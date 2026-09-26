import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name} (see .env.example)`);
  return v;
}

export const config = {
  telegramToken: required("TELEGRAM_BOT_TOKEN"),
  memwal: {
    key: required("MEMWAL_KEY"),
    accountId: required("MEMWAL_ACCOUNT_ID"),
    serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
  },
  llm: {
    apiKey: required("NVIDIA_API_KEY"),
    baseURL: process.env.LLM_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
    model: process.env.LLM_MODEL ?? "moonshotai/kimi-k3",
    extractorModel: process.env.LLM_EXTRACTOR_MODEL ?? "z-ai/glm-5.3-flash",
  },
} as const;

/** Namespace used per Telegram user so memories are isolated per person. */
export function userNamespace(telegramUserId: number): string {
  return `tg-${telegramUserId}`;
}
