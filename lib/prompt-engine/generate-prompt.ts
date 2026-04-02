import type { EngineOutput, UserInput } from "./types";
import { detectIntent } from "./detect-intent";
import { recommendTool } from "./recommend-tool";
import { buildPromptPack } from "./templates";

export function generatePrompt(input: UserInput): EngineOutput {
  const intentResult = detectIntent(input);
  const recommendation = recommendTool(intentResult, input);
  const promptPack = buildPromptPack(
    intentResult.intent,
    recommendation.primaryTool,
    input
  );

  return {
    intent: intentResult,
    recommendation,
    promptPack,
  };
}
