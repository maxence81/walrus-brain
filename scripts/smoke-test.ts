/** One-off connectivity smoke test: remember + recall against Walrus Memory. */
import { MemWal } from "@mysten-incubation/memwal";
import "dotenv/config";

const m = MemWal.create({
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: "smoke-test",
});

console.log("checking health...");
console.log("health:", JSON.stringify(await m.health()));

console.log("storing memory...");
const job = await m.remember("Smoke test memory from walrus-hackathon setup.");
await m.waitForRememberJob(job.job_id);
console.log("remembered, job", job.job_id);

console.log("recalling...");
const r = await m.recall({ query: "smoke test" });
console.log("recall results:", JSON.stringify(r.results, null, 2));
