import type {
  Intent,
  ToolName,
  ConfidenceLevel,
  ToolOverride,
  ToolRecommendation,
  IntentResult,
  UserInput,
} from "./types";

interface ToolMapping {
  primary: ToolName;
  alternative: ToolName | null;
  reasoning: string[];
}

const INTENT_TOOL_MAP: Record<Intent, ToolMapping> = {
  coding: {
    primary: "Claude Code",
    alternative: "Generic Code Agent",
    reasoning: [
      "Excels at multi-file, production-quality code generation",
      "Understands full project context and architectural decisions",
      "Minimizes hallucinated APIs and eliminates placeholder code",
    ],
  },
  writing: {
    primary: "Claude",
    alternative: "ChatGPT",
    reasoning: [
      "Produces nuanced, well-structured long-form writing",
      "Follows tone and style guidance with precision",
      "Strong at maintaining consistency across longer pieces",
    ],
  },
  research: {
    primary: "ChatGPT",
    alternative: "Gemini",
    reasoning: [
      "Excels at synthesizing information across multiple sources",
      "Structured output format works well for research reports",
      "Strong at comparative analysis and fact-dense summaries",
    ],
  },
  image: {
    primary: "Midjourney",
    alternative: "DALL·E",
    reasoning: [
      "Produces high-quality, aesthetically refined images",
      "Excellent at interpreting complex visual style descriptions",
      "Best-in-class for concept art and photorealistic renders",
    ],
  },
  video: {
    primary: "Runway",
    alternative: null,
    reasoning: [
      "Leading model for cinematic video generation from text",
      "Handles motion, scene transitions, and pacing directives",
      "Best option for short-form generative video content",
    ],
  },
  system_prompt: {
    primary: "Claude",
    alternative: null,
    reasoning: [
      "Optimized for following complex behavioral instructions",
      "Strong at maintaining role constraints across long conversations",
      "Excellent for nuanced persona and constraint definitions",
    ],
  },
  agent_instructions: {
    primary: "Claude Code",
    alternative: "Generic Code Agent",
    reasoning: [
      "Built for multi-step autonomous task execution",
      "Handles tool use, memory, and reasoning loops effectively",
      "Best at understanding pipeline context and orchestration logic",
    ],
  },
};

const TOOL_OVERRIDE_PRIMARY: Record<string, ToolName> = {
  "Claude Code": "Claude Code",
  "Generic Code Agent": "Generic Code Agent",
  ChatGPT: "ChatGPT",
  Gemini: "Gemini",
  Claude: "Claude",
  Midjourney: "Midjourney",
  "DALL·E": "DALL·E",
  Runway: "Runway",
};

const TOOL_OVERRIDE_REASONING: Record<string, string[]> = {
  "Claude Code": [
    "You selected Claude Code as your preferred tool",
    "Optimized for agentic coding and multi-file projects",
    "Produces production-ready code without mock data",
  ],
  "Generic Code Agent": [
    "You selected a Generic Code Agent as your preferred tool",
    "Works with most code-capable AI models",
    "Optimized for structured, unambiguous code generation",
  ],
  ChatGPT: [
    "You selected ChatGPT as your preferred tool",
    "Excels at structured, section-based outputs",
    "Great at following explicit formatting instructions",
  ],
  Gemini: [
    "You selected Gemini as your preferred tool",
    "Strong at grounded, factual responses with clear objectives",
    "Works well with context-rich, research-oriented prompts",
  ],
  Claude: [
    "You selected Claude as your preferred tool",
    "Optimized for thoughtful, nuanced instructions",
    "Excellent at long-form tasks and complex reasoning",
  ],
  Midjourney: [
    "You selected Midjourney as your preferred tool",
    "Industry-leading aesthetic quality for image generation",
    "Prompt optimized for Midjourney's unique style syntax",
  ],
  "DALL·E": [
    "You selected DALL·E as your preferred tool",
    "Produces clean, instruction-following image outputs",
    "Optimized for OpenAI's image generation syntax",
  ],
  Runway: [
    "You selected Runway as your preferred tool",
    "Leading platform for cinematic video generation",
    "Prompt tuned for scene, motion, and pacing parameters",
  ],
};

export function recommendTool(
  intentResult: IntentResult,
  input: UserInput
): ToolRecommendation {
  // If user overrode the tool, use it directly
  if (input.toolOverride !== "auto" && input.toolOverride in TOOL_OVERRIDE_PRIMARY) {
    const primaryTool = TOOL_OVERRIDE_PRIMARY[input.toolOverride];
    const mapping = INTENT_TOOL_MAP[intentResult.intent];
    return {
      primaryTool,
      alternativeTool: mapping?.alternative !== primaryTool ? (mapping?.alternative ?? null) : null,
      confidence: "high",
      reasoning: TOOL_OVERRIDE_REASONING[input.toolOverride] ?? [],
    };
  }

  const mapping = INTENT_TOOL_MAP[intentResult.intent];

  return {
    primaryTool: mapping.primary,
    alternativeTool: mapping.alternative,
    confidence: intentResult.confidence,
    reasoning: mapping.reasoning,
  };
}
