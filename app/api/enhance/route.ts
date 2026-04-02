import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generatePrompt } from "@/lib/prompt-engine";
import type { UserInput } from "@/lib/prompt-engine";

export async function POST(request: NextRequest) {
  let input: UserInput;

  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Always run deterministic engine — used for intent/tool detection
  // and as the fallback if AI enhancement is unavailable
  const deterministicOutput = generatePrompt(input);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ...deterministicOutput, aiEnhanced: false });
  }

  try {
    const client = new Anthropic({ apiKey });

    const { intent, recommendation } = deterministicOutput;
    const primaryTool = recommendation.primaryTool;
    const altTool = recommendation.alternativeTool;

    // Build context block from optional inputs
    const contextParts: string[] = [];
    if (input.contextText?.trim()) {
      contextParts.push(`Additional context from user:\n${input.contextText.trim()}`);
    }
    if (input.fileContent && input.fileName) {
      const truncated = input.fileContent.length > 1500
        ? input.fileContent.slice(0, 1500) + "\n[...truncated]"
        : input.fileContent;
      contextParts.push(`Attached file (${input.fileName}):\n${truncated}`);
    }
    const contextBlock = contextParts.join("\n\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      tool_choice: { type: "tool", name: "generate_prompt_pack" },
      tools: [
        {
          name: "generate_prompt_pack",
          description: "Generate a complete optimized prompt pack for the user's request",
          input_schema: {
            type: "object" as const,
            properties: {
              optimizedPrompt: {
                type: "string",
                description: `The main optimized prompt, ready to paste directly into ${primaryTool}. Must include a clear role, structured task, explicit requirements, output format, and hallucination guardrails.`,
              },
              systemInstructions: {
                type: "string",
                description: "System-level instructions to configure the AI (for system prompt or agent fields). Omit if not applicable.",
              },
              outputFormat: {
                type: "string",
                description: "A concise description of the expected output structure. Omit if already covered in the main prompt.",
              },
              contextNotes: {
                type: "string",
                description: "Brief notes on how to use the provided context. Only include if context was provided.",
              },
              qualityChecklist: {
                type: "array",
                items: { type: "string" },
                description: "4–5 checklist items to verify the prompt is complete and high-quality before using it.",
              },
              alternativeVersion: {
                type: "string",
                description: altTool
                  ? `A complete alternative prompt optimized specifically for ${altTool}, using that tool's conventions.`
                  : "A shorter, simpler fallback version of the prompt.",
              },
            },
            required: ["optimizedPrompt", "qualityChecklist"],
          },
        },
      ],
      messages: [
        {
          role: "user",
          content: `You are an expert prompt engineer. Generate the best possible zero-shot prompt for the task below.

**User's request:** ${input.rawIdea.trim()}

**Target AI tool:** ${primaryTool}
**Detected intent category:** ${intent.intent}
${contextBlock ? `\n${contextBlock}\n` : ""}
Requirements for the optimized prompt:
- Open with a specific role definition (e.g. "You are a senior software engineer...")
- Break the task into clear, structured steps or sections
- Specify the exact output format expected
- Include explicit guardrails: "Do not invent missing information", "State assumptions before proceeding"
- Be ready to paste directly into ${primaryTool} with zero modifications
- Adapt tone and structure to ${primaryTool}'s strengths${altTool ? `\n\nAlso generate an alternative version optimized for ${altTool}, using its specific conventions and strengths.` : ""}

The quality checklist should cover the most important things to verify before sending this prompt to an AI.`,
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ ...deterministicOutput, aiEnhanced: false });
    }

    const pack = toolUse.input as {
      optimizedPrompt: string;
      systemInstructions?: string;
      outputFormat?: string;
      contextNotes?: string;
      qualityChecklist: string[];
      alternativeVersion?: string;
    };

    return NextResponse.json({
      intent,
      recommendation,
      promptPack: {
        optimizedPrompt: pack.optimizedPrompt,
        systemInstructions: pack.systemInstructions ?? undefined,
        outputFormat: pack.outputFormat ?? undefined,
        contextNotes:
          pack.contextNotes ??
          (contextBlock ? "Context has been incorporated into the prompt above." : undefined),
        qualityChecklist: pack.qualityChecklist,
        alternativeVersion: pack.alternativeVersion ?? undefined,
      },
      aiEnhanced: true,
    });
  } catch (error) {
    // Any API error → fall back to deterministic result silently
    console.error("[/api/enhance] Claude API error, falling back:", error);
    return NextResponse.json({ ...deterministicOutput, aiEnhanced: false });
  }
}
