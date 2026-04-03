import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePrompt } from "@/lib/prompt-engine";
import { getProvider } from "@/lib/providers";
import type { UserInput } from "@/lib/prompt-engine";
import type { ProviderId } from "@/lib/providers";

interface EnhanceRequest extends UserInput {
  providerId: ProviderId;
  apiKey: string;
}

interface PromptPackResult {
  optimizedPrompt: string;
  systemInstructions?: string;
  outputFormat?: string;
  contextNotes?: string;
  qualityChecklist: string[];
  alternativeVersion?: string;
}

// ─── Shared prompt builder ────────────────────────────────────────────────────

function buildUserMessage(
  input: UserInput,
  primaryTool: string,
  altTool: string | null,
  intent: string,
  contextBlock: string
): string {
  return `You are an expert prompt engineer. Generate the best possible zero-shot prompt for the task below.

Return ONLY a valid JSON object with these fields:
- optimizedPrompt (string, required): The main optimized prompt for ${primaryTool}
- systemInstructions (string, optional): System-level instructions if applicable
- outputFormat (string, optional): Expected output structure description
- contextNotes (string, optional): Notes on using provided context (only if context exists)
- qualityChecklist (array of strings, required): 4-5 checklist items
- alternativeVersion (string, optional): Alternative prompt for ${altTool ?? "another tool"}

**User's request:** ${input.rawIdea.trim()}
**Target AI tool:** ${primaryTool}
**Detected intent:** ${intent}
${contextBlock ? `\n${contextBlock}\n` : ""}
The optimized prompt must:
- Open with a specific role definition
- Break the task into clear structured steps
- Specify the exact output format
- Include guardrails: "Do not invent missing information", "State assumptions before proceeding"
- Be ready to paste directly into ${primaryTool} with zero modifications
${altTool ? `\nAlso provide an alternativeVersion optimized for ${altTool}.` : ""}`;
}

function buildContextBlock(input: UserInput): string {
  const parts: string[] = [];
  if (input.contextText?.trim()) {
    parts.push(`Additional context:\n${input.contextText.trim()}`);
  }
  if (input.fileContent && input.fileName) {
    const truncated =
      input.fileContent.length > 1500
        ? input.fileContent.slice(0, 1500) + "\n[...truncated]"
        : input.fileContent;
    parts.push(`Attached file (${input.fileName}):\n${truncated}`);
  }
  return parts.join("\n\n");
}

function parseJsonResponse(text: string): PromptPackResult {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

// ─── Provider-specific callers ────────────────────────────────────────────────

async function callAnthropic(apiKey: string, userMessage: string, model: string): Promise<PromptPackResult> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    tool_choice: { type: "tool", name: "generate_prompt_pack" },
    tools: [
      {
        name: "generate_prompt_pack",
        description: "Generate a complete optimized prompt pack",
        input_schema: {
          type: "object" as const,
          properties: {
            optimizedPrompt: { type: "string" },
            systemInstructions: { type: "string" },
            outputFormat: { type: "string" },
            contextNotes: { type: "string" },
            qualityChecklist: { type: "array", items: { type: "string" } },
            alternativeVersion: { type: "string" },
          },
          required: ["optimizedPrompt", "qualityChecklist"],
        },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("No tool use in Anthropic response");
  return toolUse.input as PromptPackResult;
}

async function callOpenAICompat(
  apiKey: string,
  baseUrl: string,
  model: string,
  userMessage: string
): Promise<PromptPackResult> {
  const client = new OpenAI({ apiKey, baseURL: baseUrl });
  const response = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are an expert prompt engineer. Always respond with valid JSON only. No prose, no markdown fences.",
      },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  return parseJsonResponse(text);
}

async function callGemini(apiKey: string, model: string, userMessage: string): Promise<PromptPackResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
    },
  });

  const result = await geminiModel.generateContent(
    "You are an expert prompt engineer. Respond with valid JSON only.\n\n" + userMessage
  );
  const text = result.response.text();
  return parseJsonResponse(text);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: EnhanceRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { providerId, apiKey, ...input } = body;

  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "No API key provided. Configure your AI provider in Settings." },
      { status: 400 }
    );
  }

  const provider = getProvider(providerId ?? "anthropic");
  const { intent, recommendation } = generatePrompt(input);
  const contextBlock = buildContextBlock(input);
  const userMessage = buildUserMessage(
    input,
    recommendation.primaryTool,
    recommendation.alternativeTool,
    intent.intent,
    contextBlock
  );

  let pack: PromptPackResult;

  try {
    if (provider.sdk === "anthropic") {
      pack = await callAnthropic(apiKey, userMessage, provider.model);
    } else if (provider.sdk === "gemini") {
      pack = await callGemini(apiKey, provider.model, userMessage);
    } else {
      pack = await callOpenAICompat(apiKey, provider.openAICompatibleBaseUrl!, provider.model, userMessage);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[/api/enhance] ${provider.name} error:`, message);
    return NextResponse.json(
      { error: `${provider.name} API error: ${message}` },
      { status: 502 }
    );
  }

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
      qualityChecklist: pack.qualityChecklist ?? [],
      alternativeVersion: pack.alternativeVersion ?? undefined,
    },
    providerLabel: provider.label,
  });
}
