/**
 * Proof-of-use script for the hackathon submission:
 * prints the MemWal account ID (agent identity) and lists memories per namespace,
 * so we can report agent ID + blob count on mainnet (>= 10 required).
 *
 * Usage: npm run show-memories -- tg-123456789 tg-987654321
 */
import { MemWal } from "@mysten-incubation/memwal";
import { config } from "../src/config.js";

const namespaces = process.argv.slice(2);

console.log(`MemWal account (agent) ID: ${config.memwal.accountId}`);
console.log(`Relayer: ${config.memwal.serverUrl}`);

if (namespaces.length === 0) {
  console.log("\nPass one or more namespaces (e.g. tg-<telegramUserId>) to inspect.");
  process.exit(0);
}

let total = 0;
for (const ns of namespaces) {
  const memwal = MemWal.create({ ...config.memwal, namespace: ns });
  const res = await memwal.recall({ query: "*", limit: 100 } as any);
  const memories = res.results ?? [];
  total += memories.length;
  console.log(`\nNamespace ${ns}: ${memories.length} memories`);
  memories.forEach((m: any, i: number) => console.log(`  ${i + 1}. ${m.content ?? m.text}`));
}
console.log(`\nTotal memories across given namespaces: ${total}`);
