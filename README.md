# Walrus Brain — a Telegram coach that remembers you

**Bot live: [@walrus_brain_hackthon_bot](https://t.me/walrus_brain_hackthon_bot)**

A learning-coach chatbot that **remembers users across sessions, devices, and days** using
[Walrus Memory](https://github.com/MystenLabs/MemWal) on Walrus **mainnet**.

Built for **Walrus Session 8: Chatbots That Remember**.

- **LLM:** Kimi K3 via the NVIDIA NIM hosted API (OpenAI-compatible) — no Anthropic/OpenAI models used
- **Memory extractor:** GLM 5.3 Flash via NVIDIA NIM
- **Channel:** Telegram
- **Memory layer:** `@mysten-incubation/memwal` (relayer-managed: embeddings, SEAL encryption, Walrus storage)

## What it does

Most Telegram bots forget you the moment the process restarts. Recall doesn't:

- On every message, it semantically **recalls** relevant long-term memories from Walrus
  (your name, goals, what you studied, where you were stuck, plans you made)
  and injects them into the coach's system prompt.
- After each exchange, a small extractor model decides which facts are durable
  (identity, goals, difficulties, preferences) and **persists them to Walrus**.
- Each user gets an isolated memory namespace (`tg-<telegramUserId>`), so memory works
  across sessions and across devices.

Commands:

| Command | Description |
|---|---|
| `/start` | Intro |
| `/memories` | Show everything the bot remembers about you |

## Setup

### Prerequisites

- Node.js 20+
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Walrus Memory account ID + delegate key from <https://memory.walrus.xyz> (mainnet)
- A free NVIDIA NIM API key from <https://build.nvidia.com>

### Install & run

```bash
git clone https://github.com/maxence81/walrus-brain.git
cd walrus-brain
npm install
cp .env.example .env   # fill in your credentials
npm run dev
```

Talk to your bot on Telegram. Restart the process — it still remembers you.

### Configuration

See `.env.example`. Any NVIDIA NIM chat model works via `LLM_MODEL`
(e.g. `moonshotai/kimi-k3`, `deepseek-ai/deepseek-v4.1-flash`, `z-ai/glm-5.3`).

### Proof of memory usage

```bash
npm run show-memories -- tg-<telegramUserId> ...
```

Prints the MemWal agent account ID and the memory count per user namespace
(>= 10 mainnet blobs required by the hackathon; check your blobs on the Walrus explorer).

## Architecture

```
Telegram user
   │
   ▼
telegraf bot (src/bot.ts)
   ├── recall  ──▶ Walrus Memory (namespace tg-<userId>) ──▶ system prompt
   ├── chat    ──▶ NVIDIA NIM (Kimi K3)
   └── extract ──▶ GLM 5.3 Flash ──▶ remember() ──▶ Walrus mainnet
```

- `src/memory.ts` — Walrus Memory wrapper (remember / recall / list per user)
- `src/extractor.ts` — durable-fact extraction
- `src/prompts.ts` — coach system prompt with injected memories
- `src/log.ts` — local JSONL conversation logs (evidence only; memories live on Walrus)

## Notes / known friction with Walrus Memory

(Documenting integration friction is part of the hackathon submission — see `docs/article-draft.md`.)
