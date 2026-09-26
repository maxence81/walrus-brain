/** Deep probe of MemWal SDK edge cases — for reproducible bug reports. */
import { MemWal } from "@mysten-incubation/memwal";
import "dotenv/config";

const base = {
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
};

let n = 0;
async function probe(label: string, fn: () => Promise<unknown>) {
  n++;
  const t0 = Date.now();
  try {
    const r = await fn();
    console.log(`\n[${n}] OK  ${label} (${Date.now() - t0}ms)`);
    if (r !== undefined) console.log("   ->", JSON.stringify(r)?.slice(0, 400));
  } catch (e: any) {
    console.log(`\n[${n}] FAIL ${label} (${Date.now() - t0}ms)`);
    console.log("   ->", e?.message?.slice(0, 400));
  }
}

const ns = (s: string) => MemWal.create({ ...base, namespace: s });

// 1. Immediate consistency: remember -> waitForRememberJob -> recall right away
const mem1 = ns(`probe-consistency-${Date.now()}`);
await probe("remember (unicode + emoji)", async () => {
  const job = await mem1.remember("L'utilisateur s'appelle José 🦭 et apprend le français.");
  await mem1.waitForRememberJob(job.job_id);
  return job;
});
await probe("recall immediately after waitForRememberJob (consistency)", async () => {
  const r = await mem1.recall({ query: "José" } as any);
  return (r.results ?? []).length + " results: " + JSON.stringify(r.results?.[0]);
});

// 2. recall with limit
await probe("recall with limit=1", async () => {
  const r = await mem1.recall({ query: "name", limit: 1 } as any);
  return `${(r.results ?? []).length} results (expected <= 1)`;
});

// 3. Special-character namespaces
for (const bad of ["ns with spaces", "ns/with/slashes", "ns_émoji_🦭", "A".repeat(300)]) {
  await probe(`remember in weird namespace "${String(bad).slice(0, 30)}"`, async () => {
    const m = ns(bad);
    const job = await m.remember("namespace edge case");
    await m.waitForRememberJob(job.job_id);
    return job;
  });
}

// 4. Payload sizes
await probe("remember very long text (10k chars)", async () => {
  const m = ns("probe-large");
  const job = await m.remember("x".repeat(10_000));
  await m.waitForRememberJob(job.job_id);
  return job;
});
await probe("remember empty string", async () => {
  const m = ns("probe-large");
  const job = await m.remember("");
  await m.waitForRememberJob(job.job_id);
  return job;
});

// 5. Concurrency: 5 parallel remembers, then recall count
await probe("5 concurrent remember + recall count", async () => {
  const m = ns(`probe-bulk-${Date.now()}`);
  const jobs = await Promise.all([...Array(5)].map((_, i) => m.remember(`bulk fact ${i}`)));
  await Promise.all(jobs.map((j) => m.waitForRememberJob(j.job_id)));
  const r = await m.recall({ query: "bulk fact", limit: 10 } as any);
  return `${(r.results ?? []).length} recalled (expected 5)`;
});

// 6. Invalid credentials
await probe("create with invalid delegate key", async () => {
  const m = MemWal.create({ ...base, key: "deadbeef".repeat(8), namespace: "probe" });
  return await m.health();
});
await probe("recall with wrong accountId", async () => {
  const m = MemWal.create({ ...base, accountId: "0x" + "0".repeat(64), namespace: "probe" });
  return await m.recall({ query: "anything" } as any);
});
