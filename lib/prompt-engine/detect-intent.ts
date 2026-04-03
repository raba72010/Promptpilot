import type {
  Intent,
  IntentResult,
  ConfidenceLevel,
  UserInput,
} from "./types";

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  coding: [
    "code", "build", "function", "script", "debug", "refactor",
    "api", "component", "implement", "develop", "program", "typescript",
    "javascript", "python", "react", "nextjs", "next.js", "sql", "database",
    "backend", "frontend", "fullstack", "deploy", "cli", "bug",
    "endpoint", "hook", "module", "algorithm", "repository", "github",
    "class", "interface", "library", "framework", "web app", "website",
    "landing page", "dashboard", "crud", "web application",
  ],
  writing: [
    "write", "draft", "essay", "article", "blog", "post", "email",
    "letter", "copy", "content", "caption", "story", "narrative",
    "bio", "resume", "cover letter", "newsletter", "pitch", "proposal",
    "rewrite", "edit", "proofread", "summarize", "announcement", "press release",
    "tweet", "social media", "tagline", "slogan", "paragraph",
    "poem", "lyrics", "dialogue", "speech", "message",
  ],
  research: [
    "research", "analyze", "analyse", "compare", "explain", "summarize",
    "overview", "what is", "how does", "why does", "difference between",
    "pros and cons", "study", "investigate", "review", "report",
    "competitive analysis", "market", "understand", "breakdown", "deep dive",
    "explore", "fact", "evidence", "findings", "survey", "evaluate",
    "assessment", "history of", "trend", "statistics",
  ],
  image: [
    "image", "photo", "picture", "illustration", "artwork",
    "logo", "icon", "generate image", "draw", "paint", "render",
    "portrait", "landscape", "concept art", "digital art", "visual",
    "graphic", "poster", "banner", "thumbnail", "photorealistic",
    "cartoon", "anime", "sketch", "aesthetic", "midjourney",
    "dalle", "stable diffusion", "photography", "wallpaper",
  ],
  video: [
    "video", "animation", "film", "movie", "clip", "scene", "motion",
    "animate", "reel", "timelapse", "cinematic", "transition", "footage",
    "vfx", "visual effects", "explainer video", "runway", "sora",
    "short film", "motion graphics",
  ],
  system_prompt: [
    "system prompt", "act as", "behave as", "you are a",
    "custom gpt", "always respond", "never say",
    "your goal is", "assistant that", "ai assistant",
    "roleplay", "instruct the ai", "bot instructions",
    "gpt instructions", "claude instructions", "persona",
    "chatbot persona", "assistant persona",
  ],
  agent_instructions: [
    "agent", "workflow", "multi-step", "autonomous", "pipeline",
    "chain of thought", "agentic", "automate", "sequence of steps",
    "orchestrate", "reasoning loop", "tool use", "multi agent",
    "subagent", "task runner", "automation script", "background job",
    "autonomous agent", "ai agent", "agentic workflow", "build an agent",
    "run autonomously", "self-directed",
  ],
};

const OUTPUT_TYPE_TO_INTENT: Record<string, Intent> = {
  Code: "coding",
  Research: "research",
  Image: "image",
  Video: "video",
  "System Prompt": "system_prompt",
  "Agent Instructions": "agent_instructions",
  Text: "writing",
};

const TOOL_TO_INTENT: Record<string, Intent> = {
  "Claude Code": "coding",
  "Generic Code Agent": "coding",
  ChatGPT: "writing",
  Gemini: "research",
  Claude: "writing",
  Midjourney: "image",
  "DALL·E": "image",
  Runway: "video",
};

/**
 * Match a keyword against text using word boundaries for single words,
 * and substring match for multi-word phrases (they're specific enough).
 * Returns the score weight: multi-word phrases score 2, single words score 1.
 */
function matchKeyword(text: string, keyword: string): number {
  if (keyword.includes(" ")) {
    // Multi-word phrase: substring match is fine; worth double (more specific)
    return text.includes(keyword) ? 2 : 0;
  }
  // Single word: require word boundary so "builder" ≠ "build", "app" ≠ "happy"
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`);
  return regex.test(text) ? 1 : 0;
}

export function detectIntent(input: UserInput): IntentResult {
  // Output type override takes priority
  if (input.outputTypeOverride !== "auto" && input.outputTypeOverride in OUTPUT_TYPE_TO_INTENT) {
    return {
      intent: OUTPUT_TYPE_TO_INTENT[input.outputTypeOverride],
      confidence: "high",
      matchedKeywords: [],
      wasOverridden: true,
    };
  }

  // Tool override implies an intent
  if (input.toolOverride !== "auto" && input.toolOverride in TOOL_TO_INTENT) {
    return {
      intent: TOOL_TO_INTENT[input.toolOverride],
      confidence: "high",
      matchedKeywords: [],
      wasOverridden: true,
    };
  }

  // Keyword scoring
  const text = [
    input.rawIdea,
    input.contextText,
    input.fileContent ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const scores: Record<Intent, number> = {
    coding: 0,
    writing: 0,
    research: 0,
    image: 0,
    video: 0,
    system_prompt: 0,
    agent_instructions: 0,
  };

  const matched: Record<Intent, string[]> = {
    coding: [],
    writing: [],
    research: [],
    image: [],
    video: [],
    system_prompt: [],
    agent_instructions: [],
  };

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    for (const kw of keywords) {
      const weight = matchKeyword(text, kw);
      if (weight > 0) {
        scores[intent] += weight;
        matched[intent].push(kw);
      }
    }
  }

  const sorted = (Object.entries(scores) as [Intent, number][]).sort(
    ([, a], [, b]) => b - a
  );

  const [topIntent, topScore] = sorted[0];
  const [, secondScore] = sorted[1] ?? ["", 0];

  let confidence: ConfidenceLevel;
  if (topScore === 0) {
    confidence = "low";
  } else if (topScore === 1) {
    confidence = "low";
  } else if (topScore <= 5) {
    confidence = "medium";
  } else {
    confidence = "high";
  }

  // Ambiguity penalty: if second intent is within 80% of top, drop confidence
  if (topScore > 0 && secondScore / topScore >= 0.8) {
    if (confidence === "high") confidence = "medium";
    else if (confidence === "medium") confidence = "low";
  }

  return {
    intent: topIntent,
    confidence,
    matchedKeywords: matched[topIntent],
    wasOverridden: false,
  };
}
