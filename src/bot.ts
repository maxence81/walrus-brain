import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { chat } from "./llm.js";
import { recallMemories, rememberFact, listMemories } from "./memory.js";
import { extractFacts } from "./extractor.js";
import { coachSystemPrompt } from "./prompts.js";
import { logExchange } from "./log.js";

const bot = new Telegraf(config.telegramToken, {
  // Free-tier NVIDIA reasoning models can take 60-120s; default is 90s.
  handlerTimeout: 300_000,
});

// Short per-process conversation window (last few turns); long-term memory lives on Walrus.
const sessionHistory = new Map<number, { role: "user" | "assistant"; content: string }[]>();

bot.start((ctx) =>
  ctx.reply(
    "Hi, I'm Walrus Brain \u{1f9e0} — your learning coach.\n" +
      "I remember what we discuss across sessions, thanks to Walrus Memory.\n\n" +
      "Just tell me what you're learning. Commands:\n" +
      "/memories — see everything I remember about you\n" +
      "/forget — (TODO) delete a memory",
  ),
);

bot.command("memories", async (ctx) => {
  const userId = ctx.from.id;
  await ctx.sendChatAction("typing");
  try {
    const memories = await listMemories(userId);
    if (memories.length === 0) {
      await ctx.reply("I don't remember anything about you yet. Tell me what you're learning!");
      return;
    }
    await ctx.reply(
      "Here's what I remember about you:\n\n" +
        memories.map((m, i) => `${i + 1}. ${m.content}`).join("\n"),
    );
  } catch (e) {
    console.error("recall error", e);
    await ctx.reply("Couldn't fetch memories right now.");
  }
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  await ctx.sendChatAction("typing");

  try {
    // 1. Recall long-term memories from Walrus (cross-session, cross-device)
    const recalled = await recallMemories(userId, text);

    // 2. Build prompt: system + recalled memories + short session window
    const history = sessionHistory.get(userId) ?? [];
    const reply = await chat([
      { role: "system", content: coachSystemPrompt(recalled) },
      ...history,
      { role: "user", content: text },
    ]);

    // 3. Update short session window (keep last 10 turns)
    sessionHistory.set(userId, [...history.slice(-9), { role: "user", content: text }, { role: "assistant", content: reply }]);

    await ctx.reply(reply);

    // 4. Extract durable facts and persist them on Walrus (async, non-blocking)
    const stored: string[] = [];
    try {
      const facts = await extractFacts(text, reply);
      for (const fact of facts) {
        await rememberFact(userId, fact);
        stored.push(fact);
      }
    } catch (e) {
      console.error("extract/store error", e);
    }

    // 5. Evidence log for the article / judging
    logExchange({
      userId,
      username: ctx.from.username,
      message: text,
      reply,
      recalled: recalled.map((m) => m.content),
      stored,
      model: config.llm.model,
    });
  } catch (e) {
    console.error("handler error", e);
    await ctx.reply("Something went wrong on my side, try again.");
  }
});

bot.launch().then(() => {
  console.log(`Recall bot running. LLM: ${config.llm.model}`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
