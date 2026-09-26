/** Measure latency of each external dependency to find the 90s bottleneck. */
import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";
import OpenAI from "openai";

async function timed<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
  const t0 = Date.now();
  try {
    const r = await fn();
    console.log(`${label}: OK in ${Date.now() - t0}ms`);
    return r;
  } catch (e: any) {
    console.log(`${label}: FAIL after ${Date.now() - t0}ms — ${e.message}`);
  }
}

const memwal = MemWal.create({
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: "tg-6248932986",
});

await timed("recall (populated ns)", () => memwal.recall({ query: "TypeScript" }));
const m2 = MemWal.create({
  key: process.env.MEMWAL_KEY!,
  accountId: process.env.MEMWAL_ACCOUNT_ID!,
  serverUrl: process.env.MEMWAL_SERVER_URL,
  namespace: "tg-empty-namespace-test",
});
await timed("recall (empty ns)", () => m2.recall({ query: "hello" }));

const llm = new OpenAI({ apiKey: process.env.NVIDIA_API_KEY!, baseURL: process.env.LLM_BASE_URL });
for (const model of [process.env.LLM_MODEL, process.env.LLM_EXTRACTOR_MODEL]) {
  await timed(`LLM ${model}`, async () => {
    const r = await llm.chat.completions.create({
      model: model!,
      messages: [{ role: "user", content: "Say OK" }],
      max_tokens: 10,
    });
    console.log(`   -> "${r.choices[0]?.message?.content}"`);
  });
}
