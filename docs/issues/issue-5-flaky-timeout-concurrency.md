**Title:** `[Bug] Intermittent remember-job timeouts under concurrent load: SDK reports failure while the write succeeds server-side`

**Surface:** `TypeScript SDK` (default `MemWal` client) + production relayer
**Network:** mainnet
**Package version:** `@mysten-incubation/memwal@0.1.8`

### What happened?
When several `remember()` jobs run concurrently, some `waitForRememberJob` calls intermittently fail with `remember job timed out after 60000ms` — yet polling the job later (and semantic recall) shows the memory **did** land. The SDK reports a failure for a write that actually succeeded.

### Steps to reproduce
1. Create a client against the production relayer.
2. Fire 5 concurrent `remember("bulk fact number i")` and `waitForRememberJob` on each.
3. Repeat a few times (flaky — depends on relayer load).

```ts
const jobs = await Promise.all([...Array(5)].map((_, i) => m.remember(`bulk fact number ${i}`)));
await Promise.allSettled(jobs.map((j) => m.waitForRememberJob(j.job_id)));
```

### Expected
All waits resolve (slow is fine), or failures are clearly marked as "still pending" rather than terminal errors.

### Actual
- Run 1: 4/5 jobs OK (~30s each), 1 job rejected after 60 060 ms: `remember job timed out after 60000ms (job_id=28c6baf5-5228-4297-bb6a-391187c417e5)`.
- Run 2 (same code): 5/5 OK (28–34s each), recall returns all 5 facts.
- i.e. the failure is load/timing-dependent, and a timed-out job can still complete server-side afterward — callers can't tell "failed" from "late".

### Additional context
- Single sequential `remember`+wait reliably takes **21–24s** per fact (mainnet). That's workable for chatbot flows only if done asynchronously — but the flaky 60s timeout makes async fire-and-forget pipelines unreliable.
- A nearby symptom we hit in production use was an unhandled `p-timeout` rejection after 90 000 ms (`node_modules/p-timeout/index.js`) that crashed our long-running bot process — suggesting at least two different hard-coded polling timeouts in the SDK.
- Workaround we shipped: wrap `waitForRememberJob` in our own `Promise.race` timeout and treat timeouts as non-fatal.

### Suggested fix
- Expose `timeoutMs` / `pollIntervalMs` on `waitForRememberJob`.
- Distinguish "timed out while polling" from "job failed": return a resumable state or expose `getJob(job_id)` so callers can re-check later.
- Document expected write latency on mainnet (~20–60s) so integrators design for it.
