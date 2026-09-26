# [Question / improvement] `remember()` stores exact duplicates — should the SDK deduplicate?

## Environment
- SDK: `@mysten-incubation/memwal` 0.1.8, production relayer
- App: Telegram chatbot that extracts durable facts after each exchange and stores them

## Actual behaviour
If the same fact is stored twice (e.g. an extractor regenerates "User's name is Maxence." in two separate sessions), two separate blobs/memories are created. Our `/memories` listing showed:

```
1. User's name is Maxence.
2. User's name is Maxence.
```

## Why it matters
For long-lived assistants, duplicates accumulate, inflate blob counts/storage cost, degrade recall results (the same fact crowds out others in top-k), and confuse end-users inspecting their data.

## Expected / proposal
One of:
1. Document the recommended client-side dedup pattern (e.g. recall first, similarity threshold, skip if near-identical), or
2. Optional server-side param: `remember(text, { dedupe: { threshold: 0.95 } })`, or
3. Guidance on canonical-update flow ("User prefers X" replacing earlier contradicting facts).

## Current workaround
Extractor-side rules + recall-before-store checks, which cost extra latency/quota.
