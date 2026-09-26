# [Bug] `waitForRememberJob` throws an unconfigurable 90s TimeoutError that crashes the host process

## Environment
- SDK: `@mysten-incubation/memwal` **0.1.8** (TypeScript)
- Runtime: Node.js 24.12.0, ESM
- OS: Windows 11
- Relayer: `https://relayer.memory.walrus.xyz` (production, api 1.0.0)
- App context: Telegram bot (long-lived process) using `MemWal` default client

## Expected behaviour
`remember()` → `waitForRememberJob(job_id)` should either:
- resolve/reject with a meaningful error in reasonable time, and/or
- let the caller configure the polling timeout (or disable waiting entirely).

## Actual behaviour
When the relayer job is slow, `waitForRememberJob` throws a raw `p-timeout` error after exactly 90 000 ms:

```
TimeoutError: Promise timed out after 90000 milliseconds
    at Timeout._onTimeout (node_modules\p-timeout\index.js:39:64)
    at listOnTimeout (node:internal/timers:605:17)
```

Observations:
- The 90s timeout is hard-coded (or at least not documented) — no way to adjust.
- More importantly: **the memory is already accepted server-side**; the write succeeds even though the local waiting crashed. A waiting-only failure terminates otherwise healthy long-running bots.
- When unhandled (easy to happen inside post-response async pipelines), this kills the Node process.

## Steps to reproduce
1. `MemWal.create({...})` against the production relayer
2. Call `await memwal.remember("some fact")`, then `await memwal.waitForRememberJob(job.job_id)`
3. Under real-world latency (relayer busy), the wait exceeds 90s → `TimeoutError`

## Workaround (what we shipped)
```ts
const wait = memwal.waitForRememberJob(job.job_id);
const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("remember wait timeout")), 60_000));
await Promise.race([wait, timeout]);
```
…and treat a wait timeout as non-fatal, since the blob is already accepted.

## Suggested fix
- Add a `timeoutMs` / `pollIntervalMs` option to `waitForRememberJob`.
- Document the default 90s and the recommendation to treat wait timeouts as non-fatal.
