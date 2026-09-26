/** Reproduce: 5 concurrent remembers -> timeout, and check server-side truth. */
import { MemWal } from "@mysten-incubation/memwal";
import "dotenv/config";

const m = MemWal.create({
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: `probe-bulk5-${Date.now()}`,
});

async function one(i: number) {
  const job = await m.remember(`bulk fact number ${i}`);
  await m.waitForRememberJob(job.job_id);
  return job.job_id;
}

console.log("firing 5 concurrent remembers...");
const r = await Promise.allSettled([...Array(5)].map((_, i) => one(i)));
r.forEach((x, i) => console.log(`job ${i}:`, x.status === "fulfilled" ? `OK ${x.value}` : `REJECTED — ${(x.reason as Error).message.slice(0, 140)}`));

console.log("\nwaiting 45s, then recalling to check what REALLY landed...");
await new Promise((r2) => setTimeout(r2, 45_000));
const recall = await m.recall({ query: "bulk fact", limit: 10 } as any);
console.log(`recalled: ${(recall.results ?? []).length}/5`);
(recall.results ?? []).forEach((x: any) => console.log(" -", x.text));
