import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/groq/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.GROQ_API_KEY;
        if (!key) return new Response("Missing GROQ_API_KEY", { status: 500 });
        const { input } = (await request.json()) as { input?: string };
        if (!input || typeof input !== "string") {
          return new Response("Missing input", { status: 400 });
        }
        const res = await fetch("https://api.groq.com/openai/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "canopylabs/orpheus-v1-english",
            voice: "hannah",
            input,
            response_format: "wav",
          }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return new Response(`TTS upstream error: ${res.status} ${text}`, { status: 502 });
        }
        const buf = await res.arrayBuffer();
        return new Response(buf, {
          headers: {
            "Content-Type": "audio/wav",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
