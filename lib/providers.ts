export type ProviderId =
  | "anthropic"
  | "openai"
  | "gemini"
  | "groq"
  | "mistral"
  | "perplexity"
  | "together"
  | "deepseek"
  | "xai"
  | "cohere";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  label: string; // short display name
  model: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  apiKeyUrl: string;
  /** If set, uses OpenAI-compatible SDK with this base URL */
  openAICompatibleBaseUrl?: string;
  /** Special SDK handling */
  sdk: "anthropic" | "openai-compat" | "gemini";
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "anthropic",
    name: "Claude (Anthropic)",
    label: "Claude",
    model: "claude-sonnet-4-6",
    apiKeyLabel: "Anthropic API Key",
    apiKeyPlaceholder: "sk-ant-...",
    apiKeyUrl: "https://console.anthropic.com/",
    sdk: "anthropic",
  },
  {
    id: "openai",
    name: "GPT-4o (OpenAI)",
    label: "GPT-4o",
    model: "gpt-4o",
    apiKeyLabel: "OpenAI API Key",
    apiKeyPlaceholder: "sk-...",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.openai.com/v1",
  },
  {
    id: "gemini",
    name: "Gemini 2.0 Flash (Google)",
    label: "Gemini",
    model: "gemini-2.0-flash",
    apiKeyLabel: "Google AI API Key",
    apiKeyPlaceholder: "AIza...",
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
    sdk: "gemini",
  },
  {
    id: "groq",
    name: "Llama 3.3 70B (Groq)",
    label: "Groq",
    model: "llama-3.3-70b-versatile",
    apiKeyLabel: "Groq API Key",
    apiKeyPlaceholder: "gsk_...",
    apiKeyUrl: "https://console.groq.com/keys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.groq.com/openai/v1",
  },
  {
    id: "mistral",
    name: "Mistral Large (Mistral AI)",
    label: "Mistral",
    model: "mistral-large-latest",
    apiKeyLabel: "Mistral API Key",
    apiKeyPlaceholder: "...",
    apiKeyUrl: "https://console.mistral.ai/api-keys/",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.mistral.ai/v1",
  },
  {
    id: "perplexity",
    name: "Sonar Pro (Perplexity)",
    label: "Perplexity",
    model: "sonar-pro",
    apiKeyLabel: "Perplexity API Key",
    apiKeyPlaceholder: "pplx-...",
    apiKeyUrl: "https://www.perplexity.ai/settings/api",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.perplexity.ai",
  },
  {
    id: "together",
    name: "Llama 3.1 405B (Together AI)",
    label: "Together AI",
    model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
    apiKeyLabel: "Together AI API Key",
    apiKeyPlaceholder: "...",
    apiKeyUrl: "https://api.together.ai/settings/api-keys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.together.xyz/v1",
  },
  {
    id: "deepseek",
    name: "DeepSeek V3 (DeepSeek)",
    label: "DeepSeek",
    model: "deepseek-chat",
    apiKeyLabel: "DeepSeek API Key",
    apiKeyPlaceholder: "sk-...",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.deepseek.com/v1",
  },
  {
    id: "xai",
    name: "Grok 2 (xAI)",
    label: "Grok",
    model: "grok-2-latest",
    apiKeyLabel: "xAI API Key",
    apiKeyPlaceholder: "xai-...",
    apiKeyUrl: "https://console.x.ai/",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.x.ai/v1",
  },
  {
    id: "cohere",
    name: "Command R+ (Cohere)",
    label: "Cohere",
    model: "command-r-plus",
    apiKeyLabel: "Cohere API Key",
    apiKeyPlaceholder: "...",
    apiKeyUrl: "https://dashboard.cohere.com/api-keys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.cohere.ai/compatibility/v1",
  },
];

export const DEFAULT_PROVIDER_ID: ProviderId = "anthropic";

export function getProvider(id: ProviderId): ProviderMeta {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}
