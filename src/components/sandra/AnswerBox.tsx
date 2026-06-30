import { Mic, ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { collapseRepeats } from "@/lib/dedupe";

// Inline version of the mic-button icon, used inside placeholder/hint text in
// place of the old 🗣️ emoji so it reads as the same icon as the mic button.
const MicGlyph = () => (
  <Mic className="mx-0.5 inline h-3.5 w-3.5 align-[-0.2em]" aria-hidden="true" />
);

type Lang = "en" | "hi";

type Props = {
  lang: Lang;
  isLast: boolean;
  onSubmit: (text: string, method: "typed" | "voice") => void;
};

function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

const BAR_COUNT = 9;

export function AnswerBox({ lang, isLast, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState("");
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0.2));
  const methodRef = useRef<"typed" | "voice">("typed");
  const recogRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const supportsSpeech = !!getSpeechRecognition();

  const placeholderNode =
    lang === "en" ? (
      <>Type or tap <MicGlyph /> to speak, then press Enter or Next</>
    ) : (
      <>टाइप करें या <MicGlyph /> दबाकर बोलें, फिर Enter या Next दबाएँ</>
    );
  const inputAria = lang === "en" ? "Type your answer" : "अपना उत्तर लिखें";
  const emptyMsg =
    lang === "en"
      ? "Please type or speak an answer first."
      : "कृपया पहले अपना उत्तर टाइप करें या बोलें।";
  const listenHintNode =
    lang === "en" ? (
      <>Listening… speak now (tap <MicGlyph /> to stop).</>
    ) : (
      <>सुन रहा हूँ… अब बोलें (रोकने के लिए <MicGlyph /> दबाएँ)।</>
    );
  const fallbackMsg =
    lang === "en"
      ? "Live voice needs Chrome or Edge. You can still type your answer."
      : "लाइव वॉइस के लिए Chrome या Edge आवश्यक है। आप टाइप करके उत्तर दे सकते हैं।";

  useEffect(() => {
    if (!supportsSpeech) setHint(fallbackMsg);
    else setHint("");
    return () => {
      teardownAudio();
      try { recogRef.current?.stop(); } catch { /* ignore */ }
      recogRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function teardownAudio() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    streamRef.current = null;
    try { analyserRef.current?.disconnect(); } catch { /* ignore */ }
    analyserRef.current = null;
    try { void audioCtxRef.current?.close(); } catch { /* ignore */ }
    audioCtxRef.current = null;
  }

  async function startMicVisualizer() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AC: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const bandSize = Math.floor(data.length / BAR_COUNT);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        const next: number[] = [];
        for (let b = 0; b < BAR_COUNT; b++) {
          let sum = 0;
          for (let i = 0; i < bandSize; i++) sum += data[b * bandSize + i];
          const avg = sum / bandSize / 255; // 0..1
          // amplify low signals a bit and clamp
          const v = Math.max(0.08, Math.min(1, Math.pow(avg, 0.7) * 1.6));
          next.push(v);
        }
        setLevels(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // mic denied → fall back to idle bars
      setLevels(Array(BAR_COUNT).fill(0.25));
    }
  }

  const stopListening = () => {
    try { recogRef.current?.stop(); } catch { /* ignore */ }
    teardownAudio();
    setListening(false);
  };

  const toggleMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;
    setText("");
    methodRef.current = "voice";
    const r = new SR();
    r.lang = lang === "en" ? "en-US" : "hi-IN";
    r.continuous = true;
    r.interimResults = true;
    let finalText = "";
    r.onresult = (ev: any) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const tr = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalText += " " + tr;
        else interim += " " + tr;
      }
      const merged = collapseRepeats((finalText + " " + interim).trim());
      setText(merged);
    };
    r.onerror = () => { stopListening(); };
    r.onend = () => { setListening(false); teardownAudio(); };
    recogRef.current = r;
    setListening(true);
    setHint("");
    try { r.start(); } catch { setListening(false); }
    void startMicVisualizer();
  };

  const submit = () => {
    const value = text.trim();
    if (!value) {
      setHint(emptyMsg);
      return;
    }
    if (listening) stopListening();
    onSubmit(value, methodRef.current);
    setText("");
    methodRef.current = "typed";
    setHint("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 rounded-full border border-white/40 bg-white/85 px-1.5 py-1.5 shadow-inner backdrop-blur">
          {listening ? (
            <div className="flex h-10 items-center justify-center gap-1.5 px-4">
              {levels.map((v, i) => (
                <span
                  key={i}
                  className="block w-1 rounded-full bg-deep-green transition-[height] duration-75 ease-out"
                  style={{ height: `${Math.round(8 + v * 28)}px` }}
                />
              ))}
            </div>
          ) : (
            <div className="relative w-full">
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  methodRef.current = "typed";
                  if (hint) setHint("");
                }}
                onKeyDown={onKey}
                aria-label={inputAria}
                className="h-10 w-full bg-transparent pl-4 pr-12 text-neutral-900 outline-none"
              />
              {!text && (
                <div className="pointer-events-none absolute inset-0 flex items-center pl-4 pr-12 text-sm text-neutral-500">
                  <span className="truncate">{placeholderNode}</span>
                </div>
              )}
            </div>
          )}
          {supportsSpeech && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label="Toggle voice input"
              className={`absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full transition ${
                listening
                  ? "bg-accent text-accent-foreground"
                  : "bg-deep-green text-cream hover:brightness-110"
              }`}
              style={listening ? { animation: "orb-pulse 1.2s ease-in-out infinite" } : undefined}
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={submit}
          className="inline-flex h-12 items-center gap-1.5 rounded-full bg-deep-green px-5 text-sm font-semibold text-cream shadow-md transition hover:brightness-110"
        >
          {isLast ? (lang === "en" ? "Finish" : "समाप्त") : lang === "en" ? "Next" : "अगला"}
          {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      <p className="px-2 text-[11px] text-cream/70 min-h-[14px]">
        {listening ? listenHintNode : hint}
      </p>
    </div>
  );
}
