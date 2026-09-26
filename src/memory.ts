import { MemWal } from "@mysten-incubation/memwal";
import { config, userNamespace } from "./config.js";

/**
 * Thin wrapper around Walrus Memory.
 *
 * - All memories live on Walrus (mainnet) via the managed relayer.
 * - Each Telegram user gets its OWN namespace (`tg-<userId>`), which gives us
 *   per-user isolated memory that persists across sessions and devices.
 */

function clientFor(namespace: string): MemWal {
  return MemWal.create({
    key: config.memwal.key,
    accountId: config.memwal.accountId,
    serverUrl: config.memwal.serverUrl,
    namespace,
  });
}

export interface RecalledMemory {
  content: string;
  score?: number;
}

/** Store one fact about a user. Returns the relayer job id. */
export async function rememberFact(telegramUserId: number, fact: string): Promise<string> {
  const memwal = clientFor(userNamespace(telegramUserId));
  const job = await memwal.remember(fact);
  // Bound the wait: relayer job can be slow on the free tier; the memory is
  // already accepted server-side even if polling times out.
  const wait = (memwal.waitForRememberJob(job.job_id) as Promise<unknown>);
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("waitForRememberJob timeout")), 60_000));
  await Promise.race([wait, timeout]);
  return job.job_id;
}

/** Semantic recall of the most relevant memories for a query. */
export async function recallMemories(
  telegramUserId: number,
  query: string,
  limit = 8,
): Promise<RecalledMemory[]> {
  const memwal = clientFor(userNamespace(telegramUserId));
  const result = await memwal.recall({ query, limit });
  return (result.results ?? []).map((r: any) => ({
    content: r.content ?? r.text ?? String(r),
    score: r.score,
  }));
}

/** List everything the bot currently knows about a user (for the /memories command). */
export async function listMemories(telegramUserId: number): Promise<RecalledMemory[]> {
  return recallMemories(telegramUserId, "everything known about this user", 50);
}
