export type ProviderId =
  | "anthropic"
  | "openai"
  | "gemini"
  | "groq"
  | "cerebras"
  | "openrouter"
  | "mistral"
  | "perplexity"
  | "together"
  | "deepseek"
  | "xai"
  | "cohere"
  // Chinese providers
  | "qwen"
  | "moonshot"
  | "zhipu"
  | "baidu"
  | "doubao";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  label: string;
  model: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  apiKeyUrl: string;
  openAICompatibleBaseUrl?: string;
  sdk: "anthropic" | "openai-compat" | "gemini";
  /** Has a meaningful free tier — no credit card required to get started */
  freeTier: boolean;
  /** One-line note shown in the UI about the free tier */
  freeTierNote?: string;
}

export const PROVIDERS: ProviderMeta[] = [
  // ── Free tier ──────────────────────────────────────────────────────────────
  {
    id: "cerebras",
    name: "Llama 3.3 70B (Cerebras)",
    label: "Cerebras",
    model: "llama-3.3-70b",
    apiKeyLabel: "Cerebras API Key",
    apiKeyPlaceholder: "csk-...",
    apiKeyUrl: "https://cloud.cerebras.ai/",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.cerebras.cloud/v1",
    freeTier: true,
    freeTierNote: "Free — no credit card required",
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
    freeTier: true,
    freeTierNote: "Free tier — generous rate limits",
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
    freeTier: true,
    freeTierNote: "Free tier via Google AI Studio",
  },
  {
    id: "openrouter",
    name: "Free Models (OpenRouter)",
    label: "OpenRouter",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    apiKeyLabel: "OpenRouter API Key",
    apiKeyPlaceholder: "sk-or-...",
    apiKeyUrl: "https://openrouter.ai/keys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://openrouter.ai/api/v1",
    freeTier: true,
    freeTierNote: "Many models free — uses :free variants",
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
    freeTier: true,
    freeTierNote: "Free $1 credit on signup",
  },

  // ── Paid ───────────────────────────────────────────────────────────────────
  {
    id: "anthropic",
    name: "Claude (Anthropic)",
    label: "Claude",
    model: "claude-sonnet-4-6",
    apiKeyLabel: "Anthropic API Key",
    apiKeyPlaceholder: "sk-ant-...",
    apiKeyUrl: "https://console.anthropic.com/",
    sdk: "anthropic",
    freeTier: false,
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
    freeTier: false,
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
    freeTier: false,
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
    freeTier: false,
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
    freeTier: false,
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
    freeTier: false,
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
    freeTier: false,
  },

  // ── Chinese providers ───────────────────────────────────────────────────────
  {
    id: "qwen",
    name: "Qwen Max (Alibaba)",
    label: "Qwen",
    model: "qwen-max",
    apiKeyLabel: "DashScope API Key",
    apiKeyPlaceholder: "sk-...",
    apiKeyUrl: "https://dashscope.aliyuncs.com/",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    freeTier: false,
  },
  {
    id: "moonshot",
    name: "Moonshot v1 (Kimi)",
    label: "Kimi",
    model: "moonshot-v1-8k",
    apiKeyLabel: "Moonshot API Key",
    apiKeyPlaceholder: "sk-...",
    apiKeyUrl: "https://platform.moonshot.cn/console/api-keys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://api.moonshot.cn/v1",
    freeTier: true,
    freeTierNote: "Free trial credits on signup",
  },
  {
    id: "zhipu",
    name: "GLM-4 (Zhipu AI)",
    label: "GLM-4",
    model: "glm-4",
    apiKeyLabel: "Zhipu API Key",
    apiKeyPlaceholder: "...",
    apiKeyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://open.bigmodel.cn/api/paas/v4",
    freeTier: true,
    freeTierNote: "Free trial quota on signup",
  },
  {
    id: "baidu",
    name: "ERNIE 4.0 (Baidu)",
    label: "ERNIE",
    model: "ernie-4.0-8k",
    apiKeyLabel: "Qianfan API Key",
    apiKeyPlaceholder: "...",
    apiKeyUrl: "https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://qianfan.baidubce.com/v2",
    freeTier: false,
  },
  {
    id: "doubao",
    name: "Doubao Pro (ByteDance)",
    label: "Doubao",
    model: "doubao-pro-32k",
    apiKeyLabel: "Ark API Key",
    apiKeyPlaceholder: "...",
    apiKeyUrl: "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey",
    sdk: "openai-compat",
    openAICompatibleBaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    freeTier: false,
  },
];

const CHINESE_IDS: ProviderId[] = ["qwen", "moonshot", "zhipu", "baidu", "doubao"];

export const CHINESE_PROVIDERS = PROVIDERS.filter((p) => CHINESE_IDS.includes(p.id));
export const FREE_PROVIDERS = PROVIDERS.filter((p) => p.freeTier && !CHINESE_IDS.includes(p.id));
export const PAID_PROVIDERS = PROVIDERS.filter((p) => !p.freeTier && !CHINESE_IDS.includes(p.id));

export const DEFAULT_PROVIDER_ID: ProviderId = "groq";

export function getProvider(id: ProviderId): ProviderMeta {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}
