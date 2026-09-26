/** Compare NVIDIA NIM models: latency + whether content is empty. */
import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: process.env.LLM_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
});

for (const model of ["z-ai/glm-5.3", "z-ai/glm-5.3-flash", "deepseek-ai/deepseek-v4.1-flash", "moonshotai/kimi-k3"]) {
  const t0 = Date.now();
  try {
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Reply with exactly: bonjour" }],
      max_tokens: 512,
    });
    const msg: any = res.choices[0]?.message;
    console.log(`${model}: OK in ${Date.now() - t0}ms -> content=${JSON.stringify(msg?.content?.slice(0, 60) ?? null)} reasoning=${JSON.stringify(msg?.reasoning_content?.slice(0, 60) ?? null)} finish=${res.choices[0]?.finish_reason}`);
  } catch (e: any) {
    console.log(`${model}: FAIL in ${Date.now() - t0}ms -> ${e?.message?.slice(0, 120)}`);
  }
}
