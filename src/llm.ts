import OpenAI from "openai";
import { config } from "./config.js";

/**
 * NVIDIA NIM hosted API is OpenAI-compatible, so we use the official
 * `openai` client with a custom baseURL.
 * Eligible models (non-Anthropic / non-OpenAI) for the hackathon's
 * "Beyond the Big Two" category: Kimi K3, GLM 5.3, DeepSeek v4.1 Flash...
 */
const client = new OpenAI({
  apiKey: config.llm.apiKey,
  baseURL: config.llm.baseURL,
  timeout: 120_000, // free-tier reasoning models can be slow
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(messages: ChatMessage[], model = config.llm.model): Promise<string> {
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    // Reasoning models (Kimi K3, GLM 5.3, DeepSeek) consume tokens on internal
    // reasoning before producing content — a small budget yields empty replies.
    max_tokens: 2048,
  });
  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error(`Empty LLM response (finish=${res.choices[0]?.finish_reason})`);
  return content;
}
