// Text-to-speech helper.
//   English → Groq "AI voice" via /api/groq/tts (returns WAV audio).
//   Hindi   → the browser's built-in speech synthesis (hi-IN).
// Best-effort: failures (autoplay blocks, network, API) are swallowed.

let currentAudio: HTMLAudioElement | null = null;
// Bumped on every stop/new request so stale async work (a slow fetch, a late
// voiceschanged event, a deferred utterance) knows it was superseded.
let token = 0;

// Warm up the voice list early — some browsers populate it lazily.
if (typeof window !== "undefined" && window.speechSynthesis) {
  try {
    window.speechSynthesis.getVoices();
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  token++;
  try {
    currentAudio?.pause();
  } catch {
    /* ignore */
  }
  currentAudio = null;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

function pickHindiVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "hi-IN") ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("hi")) ||
    voices.find((v) => /hindi|हिन/i.test(v.name)) ||
    null
  );
}

function speakHindi(text: string, myToken: number) {
  const synth = window.speechSynthesis;
  let done = false;
  const utter = () => {
    if (done || myToken !== token) return; // once, and not superseded
    done = true;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    u.rate = 0.9;
    const v = pickHindiVoice();
    if (v) {
      try {
        u.voice = v;
      } catch {
        /* keep default; u.lang still steers pronunciation */
      }
    }
    synth.speak(u);
    // Chrome can leave speech paused right after a preceding cancel().
    setTimeout(() => {
      try {
        synth.resume();
      } catch {
        /* ignore */
      }
    }, 50);
  };
  // A small delay lets a just-issued cancel() settle (Chrome cancel/speak race).
  const start = () => setTimeout(utter, 60);
  if (synth.getVoices().length > 0) {
    start();
  } else {
    synth.addEventListener("voiceschanged", start, { once: true });
    setTimeout(start, 300); // fallback if voiceschanged never fires
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
