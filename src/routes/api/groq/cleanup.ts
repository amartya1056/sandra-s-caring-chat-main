import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/groq/cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.GROQ_API_KEY;
        if (!key) return new Response("Missing GROQ_API_KEY", { status: 500 });
        const { question, transcript, language } = (await request.json()) as {
          question?: string;
          transcript?: string;
          language?: string;
        };
        if (!question || !transcript) {
          return new Response("Missing question/transcript", { status: 400 });
        }
        const lang = language === "Hindi" ? "Hindi" : "English";
        const system = `You clean up answers captured by speech-to-text in a voice interview. The transcript may contain false starts, repeated phrases and filler. Return ONLY the answer the speaker intended — no quotes, labels, or explanation. Remove repetitions and drop lead-in phrases that merely restate the question (e.g. 'My name is... my name is Amartya' -> 'Amartya'; 'I am twenty five years old' -> '25'). Keep the answer in ${lang}. If it is already clean, return it unchanged. Never invent information.`;
        const userMsg = `Question: ${question}\nSpoken answer: ${transcript}\nClean answer:`;
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature: 0,
            max_tokens: 120,
            messages: [
              { role: "system", content: system },
              { role: "user", content: userMsg },
            ],
          }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return new Response(`Cleanup upstream error: ${res.status} ${text}`, { status: 502 });
        }
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        let clean = data.choices?.[0]?.message?.content?.trim() ?? transcript;
        clean = clean.replace(/^["'`]+|["'`]+$/g, "").trim();
        return Response.json({ clean });
      },
    },
  },
});
