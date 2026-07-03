import { Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

const LABELS = {
  en: {
    prompt: "Tap the mic and say your answer",
    listening: "Listening… tap to stop",
    unsupported: "Voice input needs Chrome or Edge. Please tap an option above instead.",
  },
  hi: {
    prompt: "माइक दबाएँ और अपना उत्तर बोलें",
    listening: "सुन रहे हैं… रोकने के लिए दबाएँ",
    unsupported: "आवाज़ इनपुट के लिए Chrome या Edge ज़रूरी है। कृपया ऊपर कोई विकल्प चुनें।",
  },
};

// Small mic control for speaking a single answer. Tap to start, tap again (or
// stop talking) to finish; the final transcript is reported via onResult.
export function VoiceAnswer({
  lang = "en-US",
  uiLang = "en",
  onResult,
}: {
  lang?: string;
  uiLang?: "en" | "hi";
  onResult: (transcript: string) => void;
}) {
  const labels = LABELS[uiLang];
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const supported = typeof window !== "undefined" && !!getSpeechRecognition();

  useEffect(() => {
    return () => {
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggle = () => {
    if (listening) {
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;
    setInterim("");
    transcriptRef.current = "";
    const r = new SR();
    r.lang = lang;
    r.continuous = false;
    r.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (ev: any) => {
      let t = "";
      for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript + " ";
      transcriptRef.current = t.trim();
      setInterim(t.trim());
    };
    r.onerror = () => setListening(false);
    r.onend = () => {
      setListening(false);
      const t = transcriptRef.current.trim();
      if (t) onResult(t);
    };
    recogRef.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  };

  if (!supported) {
    return <p className="text-center text-sm text-deep-green/60">{labels.unsupported}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? "Stop recording" : "Record your answer"}
        className={`grid h-16 w-16 place-items-center rounded-full text-cream shadow-md transition ${
          listening ? "bg-accent" : "bg-deep-green hover:brightness-110"
        }`}
        style={listening ? { animation: "orb-pulse 1.2s ease-in-out infinite" } : undefined}
      >
        <Mic className="h-6 w-6" />
      </button>
      <p className="min-h-[20px] text-center text-sm text-deep-green/70">
        {listening ? (interim ? `${labels.listening.split("…")[0]}… "${interim}"` : labels.listening) : labels.prompt}
      </p>
    </div>
  );
}
