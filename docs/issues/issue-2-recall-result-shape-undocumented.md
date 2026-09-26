# [Docs bug] `recall()` result item shape is undocumented — fields are `text`, `distance`, `blob_id`, `created_at`

## Environment
- SDK: `@mysten-incubation/memwal` 0.1.8 (TypeScript)
- Relayer: production (`relayer.memory.walrus.xyz`)

## Expected
Docs/SDK types should tell me exactly what `recall({ query })` returns per item.

## Actual
The README quick start ends at:
```ts
const result = await memwal.recall({ query: "What do we know about this user?" });
console.log(result.results);
```
without showing the item shape. Empirically (logged today), each result item is:

```json
{
  "blob_id": "8jDv5EY5-zR3C-6sOTERHvZvfFE1gCNoWs5u_w3or9s",
  "text": "Smoke test memory from walrus-hackathon setup.",
  "distance": 0.482344789073466,
  "created_at": "2026-09-26T05:22:59.495426Z"
}
```

Nothing documents:
- `text` (the memory content — I initially looked for `content`)
- `distance` semantics (lower = closer? cosine distance? range?)
- `blob_id` (is this the Walrus blob ID I can use as proof-of-storage / for the explorer?)
- `created_at` (ISO string)
- whether `limit` is supported in `recall({ query, limit })` — it appears to work but is not in the reference

## Why it matters
Builders who must report blob counts (and link blobs on the explorer) need this documented; right now it's guesswork/logging `JSON.stringify`.

## Suggested fix
Add a "Recall result schema" section to `docs/sdk/api-reference.md` with a full example response and field descriptions.
