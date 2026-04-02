export type Intent =
  | "coding"
  | "writing"
  | "research"
  | "image"
  | "video"
  | "system_prompt"
  | "agent_instructions";

export type ToolName =
  | "Claude Code"
  | "Generic Code Agent"
  | "ChatGPT"
  | "Gemini"
  | "Claude"
  | "Midjourney"
  | "DALL·E"
  | "Runway";

export type ConfidenceLevel = "low" | "medium" | "high";

export type ToolOverride = ToolName | "auto";
export type OutputTypeOverride =
  | "auto"
  | "Text"
  | "Code"
  | "Research"
  | "Image"
  | "Video"
  | "System Prompt"
  | "Agent Instructions";

export interface UserInput {
  rawIdea: string;
  contextText: string;
  fileContent: string | null;
  fileName: string | null;
  toolOverride: ToolOverride;
  outputTypeOverride: OutputTypeOverride;
}

export interface IntentResult {
  intent: Intent;
  confidence: ConfidenceLevel;
  matchedKeywords: string[];
  wasOverridden: boolean;
}

export interface ToolRecommendation {
  primaryTool: ToolName;
  alternativeTool: ToolName | null;
  confidence: ConfidenceLevel;
  reasoning: string[];
}

export interface PromptPack {
  optimizedPrompt: string;
  systemInstructions?: string;
  outputFormat?: string;
  contextNotes?: string;
  qualityChecklist: string[];
  alternativeVersion?: string;
}

export interface EngineOutput {
  intent: IntentResult;
  recommendation: ToolRecommendation;
  promptPack: PromptPack;
}
