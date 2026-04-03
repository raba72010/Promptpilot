import { NextRequest } from "next/server";
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

interface MetaPack {
  systemInstructions?: string;
  outputFormat?: string;
  contextNotes?: string;
  qualityChecklist: string[];
  alternativeVersion?: string;
}

// ─── NDJSON helpers ──────────────────────────────────────────────────────────

type StreamMsg =
  | { type: "meta";  intent: object; recommendation: object }
  | { type: "delta"; text: string }
  | { type: "done";  pack: MetaPack; providerLabel: string }
  | { type: "error"; message: string };

function encode(msg: StreamMsg): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(msg) + "\n");
}

// ─── Prompt format ────────────────────────────────────────────────────────────
// Tag-based (not JSON mode) so every provider can stream plain text.
// The AI writes the optimized prompt inside <PROMPT>…</PROMPT> and
// metadata JSON inside <META>…</META>.

function buildUserMessage(
  input: UserInput,
  primaryTool: string,
  altTool: string | null,
  intent: string,
  contextBlock: string
): string {
  return `You are an expert prompt engineer. Your response MUST follow this exact format — no prose outside the tags:

<PROMPT>
Write the complete, optimized prompt here. It must:
- Open with a specific role definition for the AI
- Break the task into clear numbered steps
- Specify the exact output format
- Include guardrails: "Do not invent missing information", "State assumptions before proceeding"
- Be ready to paste into ${primaryTool} with zero modifications
</PROMPT>
<META>
{"systemInstructions":"...or null","outputFormat":"...or null","contextNotes":"...or null","qualityChecklist":["item1","item2","item3","item4"],"alternativeVersion":"...or null"}
</META>

Now generate for this request:
**User's goal:** ${input.rawIdea.trim()}
**Target AI tool:** ${primaryTool}
**Detected intent:** ${intent}
${contextBlock ? `\n${contextBlock}\n` : ""}${altTool ? `\nFor alternativeVersion, optimise specifically for ${altTool}.` : ""}`;
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

// ─── Parse full text → prompt + meta ─────────────────────────────────────────

function extractPromptText(full: string): string {
  const m = full.match(/<PROMPT>([\s\S]*?)<\/PROMPT>/);
  if (!m) return full.trim();                         // fallback: use all text
  return m[1].replace(/^\n/, "").replace(/\n$/, "");
}

function extractMeta(full: string): MetaPack {
  const m = full.match(/<META>([\s\S]*?)<\/META>/);
  if (!m) return { qualityChecklist: [] };
  try {
    const raw = JSON.parse(m[1].trim());
    return {
      systemInstructions:  raw.systemInstructions  || undefined,
      outputFormat:        raw.outputFormat        || undefined,
      contextNotes:        raw.contextNotes        || undefined,
      qualityChecklist:    Array.isArray(raw.qualityChecklist) ? raw.qualityChecklist : [],
      alternativeVersion:  raw.alternativeVersion  || undefined,
    };
  } catch {
    return { qualityChecklist: [] };
  }
}

// ─── Per-provider streaming text generators ───────────────────────────────────

async function* streamAnthropic(
  apiKey: string, model: string, userMessage: string
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model,
    max_tokens: 2048,
    system: "You are an expert prompt engineer. Follow the response format exactly.",
    messages: [{ role: "user", content: userMessage }],
  });
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

async function* streamOpenAICompat(
  apiKey: string, baseUrl: string, model: string, userMessage: string
): AsyncGenerator<string> {
  const client = new OpenAI({ apiKey, baseURL: baseUrl });
  const stream = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    stream: true,
    messages: [
      {
        role: "system",
        content: "You are an expert prompt engineer. Follow the response format exactly — use the <PROMPT> and <META> tags as instructed.",
      },
      { role: "user", content: userMessage },
    ],
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

async function* streamGemini(
  apiKey: string, model: string, userMessage: string
): AsyncGenerator<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model, generationConfig: { maxOutputTokens: 2048 } });
  const result = await geminiModel.generateContentStream(
    "You are an expert prompt engineer. Follow the response format exactly — use the <PROMPT> and <META> tags as instructed.\n\n" + userMessage
  );
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

// ─── Token buffer: emit only the PROMPT section while streaming ───────────────

class PromptExtractor {
  private buf = "";
  private inPrompt = false;
  private promptStart = 0;
  private emittedUntil = 0;
  private promptDone = false;

  private readonly OPEN  = "<PROMPT>";
  private readonly CLOSE = "</PROMPT>";

  /** Feed a new token. Returns text that should be streamed to the client (may be ""). */
  push(token: string): string {
    this.buf += token;

    if (!this.inPrompt && !this.promptDone) {
      const idx = this.buf.indexOf(this.OPEN);
      if (idx !== -1) {
        this.inPrompt   = true;
        this.promptStart = idx + this.OPEN.length;
        // skip optional leading newline
        if (this.buf[this.promptStart] === "\n") this.promptStart++;
        this.emittedUntil = this.promptStart;
      }
    }

    if (this.inPrompt && !this.promptDone) {
      const closeIdx = this.buf.indexOf(this.CLOSE, this.promptStart);
      if (closeIdx !== -1) {
        // prompt section is complete
        const tail = this.buf.slice(this.emittedUntil, closeIdx);
        this.emittedUntil = closeIdx;
        this.inPrompt     = false;
        this.promptDone   = true;
        return tail;
      } else {
        // stream up to `CLOSE.length` chars before the buffer end (tag might be split)
        const safeEnd = Math.max(this.emittedUntil, this.buf.length - this.CLOSE.length);
        if (safeEnd > this.emittedUntil) {
          const out = this.buf.slice(this.emittedUntil, safeEnd);
          this.emittedUntil = safeEnd;
          return out;
        }
      }
    }
    return "";
  }

  fullBuffer(): string { return this.buf; }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: EnhanceRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { providerId, apiKey, ...input } = body;

  if (!apiKey?.trim()) {
    return new Response(
      JSON.stringify({ error: "No API key provided. Configure your AI provider in Settings." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const provider     = getProvider(providerId ?? "groq");
  const { intent, recommendation } = generatePrompt(input);
  const contextBlock = buildContextBlock(input);
  const userMessage  = buildUserMessage(
    input,
    recommendation.primaryTool,
    recommendation.alternativeTool,
    intent.intent,
    contextBlock
  );

  const readable = new ReadableStream({
    async start(controller) {
      const push = (msg: StreamMsg) => controller.enqueue(encode(msg));

      // ① Intent + recommendation — sent before the first AI token
      push({ type: "meta", intent, recommendation });

      const extractor = new PromptExtractor();

      try {
        let tokenStream: AsyncGenerator<string>;
        if (provider.sdk === "anthropic") {
          tokenStream = streamAnthropic(apiKey, provider.model, userMessage);
        } else if (provider.sdk === "gemini") {
          tokenStream = streamGemini(apiKey, provider.model, userMessage);
        } else {
          tokenStream = streamOpenAICompat(
            apiKey, provider.openAICompatibleBaseUrl!, provider.model, userMessage
          );
        }

        for await (const token of tokenStream) {
          const out = extractor.push(token);
          if (out) push({ type: "delta", text: out });
        }

        // ② Full response received — parse and send completion packet
        const full       = extractor.fullBuffer();
        const promptText = extractPromptText(full);
        const meta       = extractMeta(full);

        // Include optimizedPrompt in the done packet as a fallback
        // (client uses streamed text, but falls back to this if streaming was imperfect)
        push({
          type: "done",
          pack: {
            ...meta,
            optimizedPrompt: promptText,
            contextNotes: meta.contextNotes ?? (contextBlock ? "Context incorporated above." : undefined),
          } as MetaPack & { optimizedPrompt: string },
          providerLabel: provider.label,
        } as StreamMsg);

      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`[/api/enhance] ${provider.name} error:`, message);
        push({ type: "error", message: `${provider.name} error: ${message}` });
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
