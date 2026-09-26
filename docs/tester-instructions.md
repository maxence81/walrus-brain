# Walrus Brain — Tester Instructions (EN)

Copy-paste the message below to recruit testers.

---

## Recruitment message

Hey! 👋 I'm testing a Telegram bot for a hackathon and I need 15 minutes of your time today + 5 minutes tomorrow.

**The bot:** https://t.me/walrus_brain_hackthon_bot

It's a learning coach that **actually remembers you** between conversations (everything is stored on a decentralized storage network called Walrus). I need real people to talk to it for real.

**What to do:**

**Day 1 (~15 min):**
1. Open the bot → `/start`
2. Tell it who you are and what you're learning (or want to learn — coding, a language, anything):
   - "My name is [your name], I'm learning [topic]"
   - What you find difficult right now
   - A goal with a date ("my goal is to [X] by [month]")
3. Chat a bit — ask it questions about your topic, ask for an exercise, talk about your favorite way to learn, your schedule, tools you use…
4. Type `/memories` to see everything it stored about you (pretty cool moment 🤯)

**Day 2 (~5 min) — the magic part:**
5. Come back the NEXT day (or later today, hours after) and just say:
   - "What should we work on today?" or "Where were we?"
   - It should pick up the conversation without asking who you are again.
6. Chat 5 more minutes.

That's it! Just talk naturally, don't stress about wording. The bot takes ~10–30s to answer (free-tier AI), that's normal.

**Privacy note:** you can see everything it knows with `/memories`, and it's stored per-user. Don't share real passwords/sensitive stuff.

Send me a screenshot of `/memories` and of the Day-2 moment when it remembers you — that's what I need as proof. Thank you!! 🙏

---

## Tracking (for you, Maxence)

- Check memory counts per user:
  ```powershell
  npm run show-memories -- tg-<telegramUserId> tg-<otherId>
  ```
- Get each tester's Telegram user ID: they can message the bot, then it appears in `logs/conversations-*.jsonl` (only when running locally) — or simpler, use the `getUpdates` API:
  `https://api.telegram.org/bot<TOKEN>/getUpdates`
- Target: **≥ 10 memories per user**, spread over ≥ 2 days.
- Screenshots to collect per tester: `/memories` output + the "Day 2 recall" moment.
