import { createFileRoute } from "@tanstack/react-router";

// Groq streams WAV with placeholder chunk sizes (RIFF/data = 0xFFFFFFFF). Some
// browsers (notably Safari/Firefox) refuse to decode a downloaded blob with those
// sizes, so patch them to the real byte lengths before serving.
function fixWavSizes(buf: ArrayBuffer): ArrayBuffer {
  const view = new DataView(buf);
  const len = buf.byteLength;
  if (len < 44) return buf;
  const tag = (o: number) =>
    String.fromCharCode(view.getUint8(o), view.getUint8(o + 1), view.getUint8(o + 2), view.getUint8(o + 3));
  if (tag(0) !== "RIFF" || tag(8) !== "WAVE") return buf;
  view.setUint32(4, len - 8, true); // RIFF chunk size
  let off = 12;
  while (off + 8 <= len) {
    const id = tag(off);
    const size = view.getUint32(off + 4, true);
    if (id === "data") {
      view.setUint32(off + 4, len - (off + 8), true); // data chunk size
      break;
    }
    if (size === 0xffffffff || size === 0 || off + 8 + size > len) break;
    off += 8 + size + (size & 1);
  }
  return buf;
}

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
        const buf = fixWavSizes(await res.arrayBuffer());
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
