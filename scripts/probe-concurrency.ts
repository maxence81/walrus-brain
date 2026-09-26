/** Isolate the concurrency issue: sequential vs parallel remember(). */
import { MemWal } from "@mysten-incubation/memwal";
import "dotenv/config";

const base = {
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: `probe-seq-${Date.now()}`,
};
const m = MemWal.create(base);

async function one(i: number) {
  const t0 = Date.now();
  const job = await m.remember(`fact ${i}`);
  await m.waitForRememberJob(job.job_id);
  return Date.now() - t0;
}

console.log("— Sequential (2 facts) —");
for (let i = 0; i < 2; i++) console.log(`fact ${i}: ${await one(i)}ms`);

console.log("— Parallel (2 concurrent) —");
const r = await Promise.allSettled([one(10), one(11)]);
r.forEach((x, i) => console.log(`parallel ${i}:`, x.status === "fulfilled" ? `${x.value}ms` : `REJECTED — ${(x.reason as Error).message.slice(0, 120)}`));

console.log("— Parallel (3 concurrent) —");
const r3 = await Promise.allSettled([one(20), one(21), one(22)]);
r3.forEach((x, i) => console.log(`parallel ${i}:`, x.status === "fulfilled" ? `${x.value}ms` : `REJECTED — ${(x.reason as Error).message.slice(0, 120)}`));

// And re-check the earlier bulk namespace: did the 5 jobs complete server-side later?
const mBulk = MemWal.create({ ...base, namespace: "probe-bulk-1780477" });
