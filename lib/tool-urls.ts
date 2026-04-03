/** Maps the tool names used in recommendations to their canonical URLs. */
export const TOOL_URLS: Record<string, string> = {
  "Claude":               "https://claude.ai",
  "Claude Code":          "https://claude.ai/code",
  "ChatGPT":              "https://chatgpt.com",
  "Gemini":               "https://gemini.google.com",
  "Midjourney":           "https://midjourney.com",
  "DALL·E":               "https://chatgpt.com",   // DALL·E 3 is in ChatGPT
  "Runway":               "https://app.runwayml.com",
  "Perplexity":           "https://perplexity.ai",
  "Stable Diffusion":     "https://stability.ai",
};

/** Rough token estimate (English text ≈ 4 chars / token). */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
