import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Local JSONL conversation log — evidence for the hackathon article
 * (before/after screenshots, conversation exports).
 * Note: memories themselves live on Walrus, this is only a log.
 */
const dir = join(process.cwd(), "logs");
mkdirSync(dir, { recursive: true });

const now = () => new Date().toISOString().slice(0, 10);
const file = () => join(dir, `conversations-${now()}.jsonl`);

export interface LogEntry {
  ts: string;
  userId: number;
  username?: string;
  message: string;
  reply: string;
  recalled: string[];
  stored: string[];
  model: string;
}

export function logExchange(entry: Omit<LogEntry, "ts">): void {
  appendFileSync(file(), JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n", "utf8");
}
