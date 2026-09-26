# [Feature request] List & delete memories per namespace (needed for transparency and data-erasure flows)

## Environment
- SDK: `@mysten-incubation/memwal` 0.1.8, production relayer
- App: Telegram chatbot with per-user namespaces (`tg-<userId>`)

## Use case
A chatbot that remembers users must be able to:
1. **List** everything it stores about a user — e.g. our `/memories` command ("see what the bot knows about you").
2. **Delete** a single memory or a whole namespace — e.g. `/forget`, "delete my data" requests. This is a hard requirement for any bot used by real people (and for GDPR-style compliance in the EU).

## Actual
- `recall({ query })` is semantic search only: there is no way to enumerate all memories in a namespace (queries only surface what matches the query).
- No delete/forget API exists in the default `MemWal` client (or it is undocumented).
- `restore()` exists for re-indexing, but nothing for removal.

## Expected API (proposal)
```ts
await memwal.list({ limit?: number, cursor?: string });   // all entries in namespace, paginated
await memwal.forget(blob_id: string);                     // delete one memory
await memwal.forgetNamespace();                           // wipe the namespace
```

## Current workaround
None for full listing; `recall` with a generic query (`"everything known about this user"`) is only an approximation and can miss entries.
