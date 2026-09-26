import { chat } from "./llm.js";
import { config } from "./config.js";

/**
 * After each exchange, ask a small/fast LLM to extract durable facts
 * worth remembering. Returns 0..3 short facts, or an empty array.
 */
const EXTRACT_PROMPT = `You are a memory extractor for a learning-coach chatbot.
Given a user message and the bot reply, extract 0 to 3 DURABLE facts worth remembering in future sessions.

Good facts: user identity (name, job, level), learning goals, topics studied, recurring difficulties, preferences (language, pace, format), deadlines, plans made together.
Bad facts: greetings, small talk, one-off questions already fully answered, anything temporary.

Rules:
- One fact per line, third person, concise ("User is learning TypeScript generics").
- If nothing durable, reply exactly: NONE`;

export async function extractFacts(userMessage: string, botReply: string): Promise<string[]> {
  const raw = await chat(
    [
      { role: "system", content: EXTRACT_PROMPT },
      { role: "user", content: `USER: ${userMessage}\nBOT: ${botReply}` },
    ],
    config.llm.extractorModel,
  );
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toUpperCase().startsWith("NONE")) return [];
  return trimmed
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 4 && !l.toUpperCase().startsWith("NONE"))
    .slice(0, 3);
}
