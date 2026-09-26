# AGENTS.md — walrus-hackathon

## Project
"Recall" — Telegram learning-coach chatbot with long-term memory via Walrus Memory (mainnet).
Submission for Walrus Session 8: Chatbots That Remember (deadline 2026-10-09 14:00 UTC).

## Stack
- TypeScript, Node 20+, ESM (`"type": "module"`), run with `tsx`
- Telegram: `telegraf`
- LLM: NVIDIA NIM OpenAI-compatible API (`openai` client, custom baseURL). NEVER Anthropic/OpenAI models — required for the "Beyond the Big Two" prize category.
- Memory: `@mysten-incubation/memwal` — memories MUST be stored on Walrus mainnet (hackathon rule). Local logs in `logs/` are evidence only.

## Commands
- `npm run dev` — run the bot
- `npm run typecheck` — type check
- `npm run show-memories -- <namespace...>` — memory count per user (submission proof)

## Conventions
- Per-user memory namespace: `tg-<telegramUserId>` (see `src/config.ts`)
- All LLM calls go through `src/llm.ts`
- Keep `.env` out of git; `.env.example` documents every variable
