// Text-to-speech helper.
//   English → Groq "AI voice" via /api/groq/tts (returns WAV audio).
//   Hindi   → the browser's built-in speech synthesis (hi-IN).
// Best-effort: failures (autoplay blocks, network, API) are swallowed.

let currentAudio: HTMLAudioElement | null = null;
// Bumped on every stop/new request so stale async work (a slow fetch, a late
// voiceschanged event) knows it has been superseded and stays silent.
let token = 0;

export function stopSpeaking() {
  token++;
  try {
    currentAudio?.pause();
  } catch {
    /* ignore */
  }
  currentAudio = null;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function speakHindi(text: string, myToken: number) {
  const synth = window.speechSynthesis;
  const say = () => {
    if (myToken !== token) return; // superseded
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    u.rate = 0.92;
    const voices = synth.getVoices();
    const hi =
      voices.find((v) => v.lang === "hi-IN") ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("hi"));
    if (hi) {
      try {
        u.voice = hi;
      } catch {
        /* keep the default voice; u.lang = "hi-IN" still steers pronunciation */
      }
    }
    synth.speak(u);
  };
  // Voices can load asynchronously; wait for them if they aren't ready yet.
  if (synth.getVoices().length === 0) {
    synth.addEventListener("voiceschanged", say, { once: true });
  } else {
    say();
  }
}

export async function speak(text: string, lang: "en" | "hi"): Promise<void> {
  stopSpeaking();
  const myToken = token;
  try {
    if (lang === "hi") {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      speakHindi(text, myToken);
      return;
    }
    const res = await fetch("/api/groq/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text }),
    });
    if (!res.ok) throw new Error("tts request failed");
    const blob = await res.blob();
    if (myToken !== token) return; // superseded while fetching
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.addEventListener("ended", () => URL.revokeObjectURL(url));
    await audio.play();
  } catch {
    /* best-effort speech: ignore failures */
  }
}
