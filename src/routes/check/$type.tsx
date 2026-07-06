import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ChevronDown,
  Leaf,
  Mic,
  MousePointerClick,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import {
  getAssessment,
  matchOption,
  OPTIONS,
  type Assessment,
  type Lang,
} from "@/lib/assessments";
import { Gauge } from "@/components/site/Gauge";
import { VoiceAnswer } from "@/components/site/VoiceAnswer";
import { speak, stopSpeaking } from "@/lib/speak";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/check/$type")({
  component: AssessmentPage,
});

type Mode = "options" | "voice";
type Severity = "Minimal" | "Mild" | "Moderate" | "Severe";

const NAV_LINKS = ["Home", "About Us", "Deep TMS", "Services", "Our Experts", "Awareness", "Contact"];
const withDropdown = new Set(["Services", "Awareness"]);

const UI: Record<
  Lang,
  {
    next: string;
    seeResult: string;
    answered: (a: number, n: number) => string;
    tapOptions: string;
    voice: string;
    heard: string;
    noMatch: string;
    resultLabel: (t: string) => string;
    score: string;
    recorded: string;
    notRecorded: string;
    expert: string;
    retake: string;
    severity: Record<Severity, string>;
  }
> = {
  en: {
    next: "Next",
    seeResult: "See result",
    answered: (a, n) => `${a} of ${n} questions answered`,
    tapOptions: "Tap options",
    voice: "Voice",
    heard: "Heard",
    noMatch: "— couldn't match that, please tap an option or try again.",
    resultLabel: (t) => `Your ${t} screening result`,
    score: "Score",
    recorded:
      "Your responses have been recorded. This screening is for awareness only and is not a medical diagnosis. For a professional evaluation, please connect with one of our experts.",
    notRecorded:
      "This screening is for awareness only and is not a medical diagnosis. For a professional evaluation, please connect with one of our experts.",
    expert: "Talk to an expert",
    retake: "Retake test",
    severity: { Minimal: "Minimal", Mild: "Mild", Moderate: "Moderate", Severe: "Severe" },
  },
  hi: {
    next: "अगला",
    seeResult: "परिणाम देखें",
    answered: (a, n) => `${n} में से ${a} प्रश्नों के उत्तर दिए`,
    tapOptions: "विकल्प चुनें",
    voice: "आवाज़",
    heard: "सुना",
    noMatch: "— समझ नहीं पाए, कृपया कोई विकल्प चुनें या दोबारा कोशिश करें।",
    resultLabel: (t) => `आपका ${t} स्क्रीनिंग परिणाम`,
    score: "स्कोर",
    recorded:
      "आपके उत्तर दर्ज कर लिए गए हैं। यह स्क्रीनिंग केवल जागरूकता के लिए है और चिकित्सीय निदान नहीं है। पेशेवर मूल्यांकन के लिए कृपया हमारे किसी विशेषज्ञ से संपर्क करें।",
    notRecorded:
      "यह स्क्रीनिंग केवल जागरूकता के लिए है और चिकित्सीय निदान नहीं है। पेशेवर मूल्यांकन के लिए कृपया हमारे किसी विशेषज्ञ से संपर्क करें।",
    expert: "विशेषज्ञ से बात करें",
    retake: "दोबारा टेस्ट लें",
    severity: { Minimal: "न्यूनतम", Mild: "हल्का", Moderate: "मध्यम", Severe: "गंभीर" },
  },
};

const DISCLAIMER: Record<Lang, { heading: string; body: string; yes: string; no: string }> = {
  en: {
    heading: "Before you begin",
    body: "Please note: your responses to this assessment, including every question and the answer you give, will be recorded and stored so we can generate your report and improve our services. Do you want to continue?",
    yes: "Yes, I agree",
    no: "No",
  },
  hi: {
    heading: "शुरू करने से पहले",
    body: "कृपया ध्यान दें: इस आकलन में आपके सभी उत्तर, यानी हर प्रश्न और आपका दिया गया उत्तर, रिकॉर्ड और सुरक्षित किए जाएँगे ताकि हम आपकी रिपोर्ट बना सकें और अपनी सेवाएँ बेहतर बना सकें। क्या आप जारी रखना चाहते हैं?",
    yes: "हाँ, मैं सहमत हूँ",
    no: "नहीं",
  },
};

const METHOD: Record<
  Lang,
  { heading: string; sub: string; options: string; optionsSub: string; voice: string; voiceSub: string }
> = {
  en: {
    heading: "How would you like to answer?",
    sub: "Choose how you'd like to respond. You can switch anytime during the test.",
    options: "Tap the options",
    optionsSub: "Select an answer with a click",
    voice: "Use my voice",
    voiceSub: "Speak your answer aloud",
  },
  hi: {
    heading: "आप कैसे उत्तर देना चाहेंगे?",
    sub: "चुनें कि आप कैसे उत्तर देना चाहते हैं। आप टेस्ट के दौरान कभी भी बदल सकते हैं।",
    options: "विकल्प चुनें",
    optionsSub: "क्लिक करके उत्तर चुनें",
    voice: "आवाज़ का उपयोग करें",
    voiceSub: "अपना उत्तर बोलकर दें",
  },
};

function AssessmentHeader() {
  return (
    <header className="sticky top-0 z-30 w-full bg-deep-green">
      <div className="mx-auto flex w-[min(94vw,1280px)] items-center justify-between gap-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-deep-green">
            <Leaf className="h-6 w-6" />
          </span>
          <span className="leading-tight text-cream">
            <span className="block font-display text-xl font-bold">Positive</span>
            <span className="block text-xs tracking-wide text-cream/80">Mind Care</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href="#"
              className="inline-flex items-center gap-1 text-sm font-medium text-cream/90 transition hover:text-cream"
            >
              {l}
              {withDropdown.has(l) && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex shrink-0 rounded-full border border-deep-green/20 bg-white p-1 text-sm">
      {(["en", "hi"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            lang === l ? "bg-deep-green text-cream" : "text-deep-green/70 hover:text-deep-green"
          }`}
        >
          {l === "en" ? "English" : "हिन्दी"}
        </button>
      ))}
    </div>
  );
}

function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-green/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">{children}</div>
    </div>
  );
}

function DisclaimerModal({
  lang,
  onToggleLang,
  onYes,
  onNo,
}: {
  lang: Lang;
  onToggleLang: () => void;
  onYes: () => void;
  onNo: () => void;
}) {
  const c = DISCLAIMER[lang];

  // Read the disclaimer aloud automatically when it appears, and again whenever
  // the language is toggled. Stop any speech when the box is dismissed.
  useEffect(() => {
    void speak(`${c.heading}. ${c.body}`, lang);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <Modal>
      <button
        type="button"
        onClick={onToggleLang}
        aria-label="Toggle language"
        title={lang === "en" ? "हिन्दी में सुनें" : "Listen in English"}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-deep-green/25 bg-deep-green/5 text-[11px] font-bold text-deep-green transition hover:bg-deep-green/10"
      >
        {lang === "en" ? "हि" : "EN"}
      </button>
      <div className="flex flex-col items-center text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-deep-green/10 text-deep-green">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold text-deep-green">{c.heading}</h2>
        <p className="mt-3 text-sm leading-relaxed text-deep-green/70">{c.body}</p>
        <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onYes}
            className="flex-1 rounded-full bg-deep-green px-5 py-3 text-sm font-semibold text-cream transition hover:brightness-110"
          >
            {c.yes}
          </button>
          <button
            type="button"
            onClick={onNo}
            className="flex-1 rounded-full border border-deep-green/25 px-5 py-3 text-sm font-semibold text-deep-green transition hover:bg-deep-green/5"
          >
            {c.no}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function MethodModal({ lang, onPick }: { lang: Lang; onPick: (m: Mode) => void }) {
  const c = METHOD[lang];
  return (
    <Modal>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-deep-green">{c.heading}</h2>
        <p className="mt-2 text-sm text-deep-green/70">{c.sub}</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onPick("options")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-deep-green/15 bg-[#fdfcf3] p-5 transition hover:border-deep-green/40 hover:bg-deep-green/5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-deep-green/10 text-deep-green">
              <MousePointerClick className="h-6 w-6" />
            </span>
            <span className="font-semibold text-deep-green">{c.options}</span>
            <span className="text-xs text-deep-green/60">{c.optionsSub}</span>
          </button>
          <button
            type="button"
            onClick={() => onPick("voice")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-deep-green/15 bg-[#fdfcf3] p-5 transition hover:border-deep-green/40 hover:bg-deep-green/5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-deep-green/10 text-deep-green">
              <Mic className="h-6 w-6" />
            </span>
            <span className="font-semibold text-deep-green">{c.voice}</span>
            <span className="text-xs text-deep-green/60">{c.voiceSub}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Quiz({
  assessment,
  mode,
  onModeChange,
  lang,
  store,
}: {
  assessment: Assessment;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  lang: Lang;
  store: boolean;
}) {
  const t = UI[lang];
  const questions = assessment.questions[lang];
  const options = OPTIONS[lang];
  const total = questions.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [heard, setHeard] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const answeredCount = answers.filter((a) => a !== null).length;
  const isLast = idx + 1 >= total;

  const setChoice = (choice: number) =>
    setAnswers((prev) => {
      const nextAns = [...prev];
      nextAns[idx] = choice;
      return nextAns;
    });

  const handleVoice = (transcript: string) => {
    setHeard(transcript);
    const m = matchOption(transcript, lang);
    if (m >= 0) setChoice(m);
  };

  const persist = async () => {
    // Only store responses if the user agreed on the disclaimer ("Yes").
    if (!store) return;
    try {
      const responses = assessment.questions.en.map((q, i) => ({
        question: q,
        answer: answers[i] !== null ? OPTIONS.en[answers[i] as number] : null,
      }));
      await supabase.from("sessions").insert({
        session_id: crypto.randomUUID(),
        language: `Assessment: ${assessment.title.en} (${lang})`,
        responses,
      });
    } catch {
      /* storage is non-blocking */
    }
  };

  const next = () => {
    if (answers[idx] === null) return;
    setHeard(null);
    if (isLast) {
      setDone(true);
      void persist();
    } else {
      setIdx((i) => i + 1);
    }
  };

  const restart = () => {
    setAnswers(Array(total).fill(null));
    setIdx(0);
    setHeard(null);
    setDone(false);
  };

  if (done) {
    const score = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0);
    const maxScore = total * 3;
    const ratio = maxScore ? score / maxScore : 0;
    const key: Severity =
      ratio < 0.25 ? "Minimal" : ratio < 0.5 ? "Mild" : ratio < 0.75 ? "Moderate" : "Severe";

    return (
      <div className="mt-8 rounded-3xl border border-deep-green/10 bg-white p-8 text-center">
        <p className="text-xs uppercase tracking-wider text-deep-green/60">
          {t.resultLabel(assessment.title[lang])}
        </p>
        <div className="mx-auto mt-4 max-w-[280px]">
          <Gauge value={ratio} className="w-full" />
        </div>
        <h2 className="font-display text-3xl font-bold text-deep-green">{t.severity[key]}</h2>
        <p className="mt-1 text-deep-green/70">
          {t.score} {score} / {maxScore}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-deep-green/70">
          {store ? t.recorded : t.notRecorded}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-deep-green px-5 py-2.5 text-sm font-semibold text-cream transition hover:brightness-110"
          >
            {t.expert}
          </Link>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-full border border-deep-green/25 px-5 py-2.5 text-sm font-semibold text-deep-green transition hover:bg-deep-green/5"
          >
            <RotateCcw className="h-4 w-4" />
            {t.retake}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 inline-flex rounded-full border border-deep-green/15 bg-white p-1 text-sm font-medium">
        {(["options", "voice"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${
              mode === m ? "bg-deep-green text-cream" : "text-deep-green/70 hover:text-deep-green"
            }`}
          >
            {m === "options" ? (
              <MousePointerClick className="h-3.5 w-3.5" />
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
            {m === "options" ? t.tapOptions : t.voice}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-deep-green/10 bg-[#faf9e8] p-6 sm:p-8">
        <p className="text-lg font-semibold text-deep-green">
          {idx + 1}. {questions[idx]}
        </p>
        <div className="mt-5 space-y-3">
          {options.map((opt, i) => {
            const selected = answers[idx] === i;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setChoice(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left transition ${
                  selected
                    ? "border-deep-green bg-deep-green/10"
                    : "border-deep-green/15 bg-[#fdfcf3] hover:border-deep-green/40"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                    selected ? "border-deep-green" : "border-deep-green/40"
                  }`}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-deep-green" />}
                </span>
                <span className="text-deep-green">{opt}</span>
              </button>
            );
          })}
        </div>

        {mode === "voice" && (
          <div className="mt-6 border-t border-deep-green/10 pt-6">
            <VoiceAnswer
              key={`${lang}-${idx}`}
              lang={lang === "hi" ? "hi-IN" : "en-US"}
              uiLang={lang}
              onResult={handleVoice}
            />
            {heard && (
              <p className="mt-3 text-center text-sm text-deep-green/70">
                {t.heard}: &ldquo;{heard}&rdquo;{" "}
                {answers[idx] !== null ? (
                  <span className="font-semibold text-deep-green">→ {options[answers[idx] as number]}</span>
                ) : (
                  <span className="text-deep-green/60">{t.noMatch}</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={next}
          disabled={answers[idx] === null}
          className="inline-flex items-center gap-2 rounded-2xl bg-deep-green px-7 py-3.5 text-sm font-semibold text-cream shadow-md transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" />
          {isLast ? t.seeResult : t.next}
        </button>
      </div>

      <div className="mt-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-deep-green/10">
          <div
            className="h-full rounded-full bg-deep-green transition-all duration-300"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-center text-sm text-deep-green/60">
          {t.answered(answeredCount, total)}
        </p>
      </div>
    </>
  );
}

function AssessmentPage() {
  const { type } = Route.useParams();
  const assessment = getAssessment(type);

  const [lang, setLang] = useState<Lang>("en");
  const [proceeded, setProceeded] = useState(false);
  const [store, setStore] = useState(true);
  const [mode, setMode] = useState<Mode | null>(null);

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#f6f5da]">
        <AssessmentHeader />
        <div className="mx-auto w-[min(94vw,1280px)] py-24 text-center text-deep-green">
          <h1 className="font-display text-3xl font-bold">Assessment not found</h1>
          <p className="mt-3 text-deep-green/70">We couldn&apos;t find that assessment.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-deep-green px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5da] pb-28">
      <AssessmentHeader />
      <main className="mx-auto w-[min(94vw,1280px)] pt-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-deep-green sm:text-4xl">
              {assessment.title[lang]}
            </h1>
            <p className="mt-2 max-w-3xl text-deep-green/70">{assessment.intro[lang]}</p>
          </div>
          <LangToggle lang={lang} onChange={setLang} />
        </div>

        {proceeded && mode ? (
          <Quiz assessment={assessment} mode={mode} onModeChange={setMode} lang={lang} store={store} />
        ) : (
          <div className="mt-8 h-52 rounded-3xl border border-deep-green/10 bg-[#faf9e8]" />
        )}
      </main>

      {!proceeded && (
        <DisclaimerModal
          lang={lang}
          onToggleLang={() => setLang((l) => (l === "en" ? "hi" : "en"))}
          onYes={() => {
            setStore(true);
            setProceeded(true);
          }}
          onNo={() => {
            // "No" declines data storage but still lets the user take the test.
            setStore(false);
            setProceeded(true);
          }}
        />
      )}
      {proceeded && !mode && <MethodModal lang={lang} onPick={setMode} />}
    </div>
  );
}
