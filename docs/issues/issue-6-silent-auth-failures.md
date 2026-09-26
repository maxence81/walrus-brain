**Title:** `[Bug] Silent auth failures: health() ignores the delegate key, and recall() with a wrong accountId returns empty results instead of an error`

**Surface:** `TypeScript SDK`
**Network:** mainnet
**Package version:** `@mysten-incubation/memwal@0.1.8`

### What happened?
Invalid credentials don't fail where you expect: `health()` reports ok with a garbage delegate key, and `recall()` against a non-existent account ID silently returns `[]` (as if the namespace were simply empty). Misconfiguration is indistinguishable from "no memories yet".

### Steps to reproduce
```ts
// 1) Garbage delegate key
const bad = MemWal.create({ key: "deadbeef".repeat(8), accountId: "<real id>", serverUrl: PROD, namespace: "x" });
await bad.health(); // -> { "status": "ok", ... } after ~300ms

// 2) Wrong account id (exists nowhere)
const wrong = MemWal.create({ key: "<real key>", accountId: "0x" + "0".repeat(64), serverUrl: PROD, namespace: "x" });
await wrong.recall({ query: "anything" }); // -> { results: [], total: 0 }, no error
```

### Expected
- `health()` (or a dedicated `verify()`) should authenticate the key and fail fast with 401/403 if credentials are invalid — that's the point of a health check.
- `recall()`/`remember()` with an account the key can't act on should surface a clear authorization error.

### Actual
- `health()` succeeds regardless of the key (it appears to be an unauthenticated status endpoint).
- Wrong account → silent empty recall. Developers then debug "why is my bot not remembering?" for a typo in `MEMWAL_ACCOUNT_ID`.

### Why it matters
Credentials are long hex strings pasted from a web UI; silent auth failure is one of the most expensive classes of integration bug. A loud, early failure would save every new builder time.
