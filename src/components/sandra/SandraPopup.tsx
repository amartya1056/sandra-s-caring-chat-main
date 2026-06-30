import { useEffect, useMemo, useRef, useState } from "react";
import { X, Download, RotateCcw } from "lucide-react";
import sandraAvatar from "@/assets/sandra-avatar.png";
import { AnswerBox } from "./AnswerBox";
import { collapseRepeats } from "@/lib/dedupe";
import { supabase } from "@/integrations/supabase/client";

type Lang = "en" | "hi";

type Response = { question: string; answer: string; input_method: "voice" | "typed" };

const QUESTIONS: Record<Lang, string[]> = {
  en: [
    "What is your full name?",
    "What is your age?",
    "What is your current occupation?",
    "What city do you live in?",
    "What is your highest qualification?",
  ],
  hi: [
    "आपका पूरा नाम क्या है?",
    "आपकी उम्र क्या है?",
    "आपका वर्तमान व्यवसाय क्या है?",
    "आप किस शहर में रहते हैं?",
    "आपकी सर्वोच्च योग्यता क्या है?",
  ],
};

const WELCOME: Record<Lang, string> = {
  en: "Welcome to Positive Mind Care! I'm Sandra. I'll ask you 5 short questions — answer by typing or by speaking.",
  hi: "Positive Mind Care में आपका स्वागत है! मैं Sandra हूँ। मैं आपसे 5 छोटे प्रश्न पूछूँगी — टाइप करके या बोलकर उत्तर दें।",
};

type Bubble =
  | { kind: "assistant"; text: string }
  | { kind: "user"; text: string; method: "voice" | "typed" }
  | { kind: "complete" };

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function SandraPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lang, setLang] = useState<Lang>("en");
  const [sessionId, setSessionId] = useState(uuid);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [index, setIndex] = useState(0); // current question index
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spokenRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const questions = QUESTIONS[lang];
  const totalQs = questions.length;

  // Initialize / language change → reset thread
  useEffect(() => {
    if (!open) return;
    setBubbles([
      { kind: "assistant", text: WELCOME[lang] },
      { kind: "assistant", text: questions[0] },
    ]);
    setResponses([]);
    setIndex(0);
    setDone(false);
    spokenRef.current = new Set();
    // speak first question
    void speakQuestion(questions[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lang]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles]);

  async function speakQuestion(q: string) {
    if (spokenRef.current.has(q)) return;
    spokenRef.current.add(q);
    try {
      if (lang === "en") {
        const res = await fetch("/api/groq/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: q }),
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = url;
        await audioRef.current.play().catch(() => undefined);
      } else {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        const u = new SpeechSynthesisUtterance(q);
        u.lang = "hi-IN";
        u.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch {
      /* TTS is optional polish */
    }
  }

  async function cleanupAnswer(question: string, transcript: string): Promise<string> {
    try {
      const res = await fetch("/api/groq/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          transcript,
          language: lang === "en" ? "English" : "Hindi",
        }),
      });
      if (!res.ok) throw new Error("bad");
      const data = (await res.json()) as { clean?: string };
      return (data.clean ?? "").trim() || collapseRepeats(transcript);
    } catch {
      return collapseRepeats(transcript);
    }
  }

  async function persistSession(final: Response[]) {
    try {
      await supabase.from("sessions").insert({
        session_id: sessionId,
        language: lang === "en" ? "English" : "हिन्दी (Hindi)",
        responses: final,
      });
    } catch {
      /* non-blocking */
    }
  }

  async function handleSubmit(rawText: string, method: "typed" | "voice") {
    const q = questions[index];
    let finalAnswer = rawText;
    if (method === "voice") {
      // show user bubble immediately with raw, then replace once cleaned
      setBubbles((b) => [...b, { kind: "user", text: rawText, method }]);
      const cleaned = await cleanupAnswer(q, rawText);
      finalAnswer = cleaned;
      setBubbles((b) => {
        const out = [...b];
        // replace last user bubble's text
        for (let i = out.length - 1; i >= 0; i--) {
          if (out[i].kind === "user") {
            out[i] = { kind: "user", text: cleaned, method };
            break;
          }
        }
        return out;
      });
    } else {
      setBubbles((b) => [...b, { kind: "user", text: rawText, method }]);
    }

    const newResp: Response = { question: q, answer: finalAnswer, input_method: method };
    const nextResponses = [...responses, newResp];
    setResponses(nextResponses);

    const nextIdx = index + 1;
    if (nextIdx >= totalQs) {
      setDone(true);
      setBubbles((b) => [...b, { kind: "complete" }]);
      void persistSession(nextResponses);
    } else {
      setIndex(nextIdx);
      const nextQ = questions[nextIdx];
      setBubbles((b) => [...b, { kind: "assistant", text: nextQ }]);
      void speakQuestion(nextQ);
    }
  }

  function startNewSession() {
    setSessionId(uuid());
    setBubbles([
      { kind: "assistant", text: WELCOME[lang] },
      { kind: "assistant", text: questions[0] },
    ]);
    setResponses([]);
    setIndex(0);
    setDone(false);
    spokenRef.current = new Set();
    void speakQuestion(questions[0]);
  }

  function downloadJson() {
    const payload = {
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      language: lang === "en" ? "English" : "हिन्दी (Hindi)",
      responses,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "_");
    a.href = url;
    a.download = `responses_${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const progressText = useMemo(() => {
    const i = Math.min(index + 1, totalQs);
    return lang === "en" ? `Question ${i} of ${totalQs}` : `प्रश्न ${i} / ${totalQs}`;
  }, [index, lang, totalQs]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sandra assistant"
      className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: "clamp(340px, 64vw, 880px)",
        height: "clamp(440px, 78vh, 600px)",
        animation: "pop-in 220ms ease-out",
      }}
    >
      <div className="glass-strong flex h-full w-full flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-white/15 bg-white/5 px-5 py-3">
          <div className="relative">
            <img
              src={sandraAvatar}
              alt="Sandra"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-white/30 bg-white/20 object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#37553F] bg-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="font-display text-lg leading-tight text-cream">Sandra</p>
            <p className="text-[11px] text-cream/70">online · {progressText}</p>
          </div>
          <div className="glass-subtle flex items-center text-[11px]">
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1 transition ${
                lang === "en" ? "bg-cream text-deep-green font-semibold" : "text-cream/80"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`rounded-full px-3 py-1 transition ${
                lang === "hi" ? "bg-cream text-deep-green font-semibold" : "text-cream/80"
              }`}
            >
              हिन्दी
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {bubbles.map((b, i) =>
            b.kind === "assistant" ? (
              <div key={i} className="flex items-start gap-2">
                <img
                  src={sandraAvatar}
                  alt=""
                  width={28}
                  height={28}
                  className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-white/20"
                />
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/12 px-4 py-2.5 text-sm text-cream backdrop-blur">
                  {b.text}
                </div>
              </div>
            ) : b.kind === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-deep-green px-4 py-2.5 text-sm text-cream shadow-md">
                  {b.text}
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-cream/60">
                    ({b.method === "voice" ? (lang === "en" ? "via voice" : "वॉइस") : lang === "en" ? "via typed" : "टाइप"})
                  </span>
                </div>
              </div>
            ) : (
              <div key={i} className="space-y-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-cream">
                  {lang === "en"
                    ? "✅ All done — thank you! Your details have been recorded."
                    : "✅ सब हो गया — धन्यवाद! आपका विवरण दर्ज कर लिया गया है।"}
                </p>
                <ul className="space-y-1.5 rounded-xl bg-black/15 p-3 text-xs text-cream/90">
                  {responses.map((r, idx) => (
                    <li key={idx}>
                      <span className="text-cream/60">Q{idx + 1}:</span> {r.question}
                      <br />
                      <span className="text-cream/60">A:</span>{" "}
                      <span className="font-semibold">{r.answer}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={downloadJson}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-semibold text-deep-green transition hover:brightness-105"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {lang === "en" ? "Download responses (JSON)" : "उत्तर डाउनलोड करें (JSON)"}
                  </button>
                  <button
                    onClick={startNewSession}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-cream transition hover:bg-white/20"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {lang === "en" ? "Start New Session" : "नया सत्र शुरू करें"}
                  </button>
                </div>
              </div>
            ),
          )}
        </div>

        {/* Footer / answer */}
        {!done && (
          <footer className="border-t border-white/15 bg-white/5 px-5 py-3">
            <AnswerBox
              lang={lang}
              isLast={index === totalQs - 1}
              onSubmit={handleSubmit}
            />
          </footer>
        )}
      </div>
    </div>
  );
}
