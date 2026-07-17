// Question banks for the "Check your Mental Health" self-assessments.
// Each question uses the same 4-point frequency scale (scored 0–3), available
// in English and Hindi.

export type Lang = "en" | "hi";
export type AssessmentType = "anxiety" | "depression" | "ocd" | "addiction";

export const OPTIONS: Record<Lang, string[]> = {
  en: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
  hi: ["बिल्कुल नहीं", "कुछ दिन", "आधे से ज़्यादा दिन", "लगभग हर दिन"],
};

export type Assessment = {
  slug: AssessmentType;
  title: Record<Lang, string>;
  intro: Record<Lang, string>;
  questions: Record<Lang, string[]>;
};

const INTRO_EN =
  "Please answer each question based on how you've been feeling over the past two weeks.";
const INTRO_HI =
  "कृपया प्रत्येक प्रश्न का उत्तर इस आधार पर दें कि पिछले दो हफ़्तों में आप कैसा महसूस कर रहे हैं।";

export const ASSESSMENTS: Record<AssessmentType, Assessment> = {
  anxiety: {
    slug: "anxiety",
    title: { en: "Anxiety", hi: "चिंता (Anxiety)" },
    intro: { en: `Anxiety Assessment Questionnaire. ${INTRO_EN}`, hi: `चिंता आकलन प्रश्नावली। ${INTRO_HI}` },
    questions: {
      en: [
        "I experience excessive worry about everyday situations.",
        "I find it difficult to control my worrying.",
        "I feel restless, keyed up, or on edge.",
        "I get tired easily because of feeling anxious.",
        "I have difficulty concentrating because my mind goes blank.",
        "I feel more irritable than usual.",
        "My muscles feel tense or sore.",
        "I have trouble falling or staying asleep because of worry.",
        "I feel a sense of impending panic or dread.",
        "My heart races or pounds when I feel anxious.",
        "I avoid situations that make me feel anxious.",
        "I worry about things that are unlikely to happen.",
        "I feel nervous or self-conscious in social situations.",
        "I experience shortness of breath when I am stressed.",
        "I feel dizzy or lightheaded when anxious.",
        "I am afraid of losing control of myself.",
        "I find it hard to relax even when I have free time.",
        "I tend to anticipate the worst possible outcome.",
        "Physical sensations of anxiety interfere with my day.",
        "My anxiety affects my relationships or my work.",
      ],
      hi: [
        "मुझे रोज़मर्रा की बातों को लेकर बहुत ज़्यादा चिंता होती है।",
        "मुझे अपनी चिंता पर काबू पाना मुश्किल लगता है।",
        "मैं बेचैन या घबराया हुआ महसूस करता/करती हूँ।",
        "चिंता के कारण मैं जल्दी थक जाता/जाती हूँ।",
        "मन खाली हो जाने के कारण मुझे ध्यान लगाने में कठिनाई होती है।",
        "मैं सामान्य से ज़्यादा चिड़चिड़ा महसूस करता/करती हूँ।",
        "मेरी मांसपेशियों में तनाव या दर्द रहता है।",
        "चिंता के कारण मुझे सोने या सोते रहने में परेशानी होती है।",
        "मुझे किसी अनहोनी या घबराहट का एहसास होता है।",
        "चिंतित होने पर मेरा दिल तेज़ी से धड़कता है।",
        "जिन स्थितियों में मुझे चिंता होती है, मैं उनसे बचता/बचती हूँ।",
        "मैं उन बातों की चिंता करता/करती हूँ जिनके होने की संभावना कम है।",
        "सामाजिक परिस्थितियों में मैं घबराहट या संकोच महसूस करता/करती हूँ।",
        "तनाव में मुझे साँस लेने में तकलीफ़ होती है।",
        "चिंतित होने पर मुझे चक्कर या सिर हल्का महसूस होता है।",
        "मुझे अपने आप पर से नियंत्रण खोने का डर रहता है।",
        "खाली समय में भी मुझे आराम करना मुश्किल लगता है।",
        "मैं अक्सर सबसे बुरे परिणाम की आशंका करता/करती हूँ।",
        "चिंता के शारीरिक लक्षण मेरे दिन को प्रभावित करते हैं।",
        "मेरी चिंता मेरे रिश्तों या काम को प्रभावित करती है।",
      ],
    },
  },
  depression: {
    slug: "depression",
    title: { en: "Depression", hi: "अवसाद (Depression)" },
    intro: {
      en: `Depression Assessment Questionnaire. ${INTRO_EN}`,
      hi: `अवसाद आकलन प्रश्नावली। ${INTRO_HI}`,
    },
    questions: {
      en: [
        "I have little interest or pleasure in doing things.",
        "I feel down, depressed, or hopeless.",
        "I have trouble sleeping, or I sleep too much.",
        "I feel tired or have little energy.",
        "I have a poor appetite, or I am overeating.",
        "I feel bad about myself, or that I have let others down.",
        "I have trouble concentrating on things.",
        "I feel restless, or I move and speak more slowly than usual.",
        "I find it hard to look forward to anything.",
        "I feel disconnected from the people around me.",
        "Small everyday tasks feel overwhelming.",
        "I cry more easily or feel like crying.",
        "I feel a persistent sense of emptiness.",
        "My mood makes it hard to meet my responsibilities.",
        "I have thoughts that I would be better off not being here.",
      ],
      hi: [
        "मुझे किसी काम में रुचि या आनंद कम महसूस होता है।",
        "मैं उदास, हताश या निराश महसूस करता/करती हूँ।",
        "मुझे नींद न आने या बहुत ज़्यादा सोने की समस्या है।",
        "मैं थका हुआ महसूस करता/करती हूँ या ऊर्जा कम रहती है।",
        "मेरी भूख कम है या मैं ज़रूरत से ज़्यादा खा रहा/रही हूँ।",
        "मैं खुद को लेकर बुरा महसूस करता/करती हूँ, या कि मैंने दूसरों को निराश किया।",
        "मुझे किसी बात पर ध्यान केंद्रित करने में कठिनाई होती है।",
        "मैं बेचैन रहता/रहती हूँ, या सामान्य से धीमे चलता-बोलता हूँ।",
        "मुझे किसी बात का इंतज़ार या उत्साह महसूस करना मुश्किल लगता है।",
        "मैं अपने आस-पास के लोगों से कटा हुआ महसूस करता/करती हूँ।",
        "छोटे-छोटे रोज़मर्रा के काम भी भारी लगते हैं।",
        "मुझे आसानी से रोना आता है या रोने का मन करता है।",
        "मुझे लगातार खालीपन का एहसास रहता है।",
        "मेरी मनःस्थिति के कारण ज़िम्मेदारियाँ निभाना मुश्किल होता है।",
        "मेरे मन में विचार आते हैं कि मेरा न होना बेहतर होता।",
      ],
    },
  },
  ocd: {
    slug: "ocd",
    title: { en: "OCD", hi: "ओसीडी (OCD)" },
    intro: {
      en: `Obsessive-Compulsive Assessment Questionnaire. ${INTRO_EN}`,
      hi: `ओसीडी आकलन प्रश्नावली। ${INTRO_HI}`,
    },
    questions: {
      en: [
        "I have unwanted thoughts that keep coming back.",
        "I feel driven to repeat certain actions or rituals.",
        "I check things repeatedly (locks, appliances, switches).",
        "I wash or clean more than is necessary.",
        "I need things to be arranged in a very specific order.",
        "I have distressing thoughts that feel hard to ignore.",
        "I count, tap, or repeat words silently to reduce anxiety.",
        "I seek reassurance from others over and over.",
        "I spend a lot of time on repetitive behaviours.",
        "I feel very anxious if I cannot complete a ritual.",
        "I avoid objects or situations that trigger intrusive thoughts.",
        "I doubt whether I have done something correctly.",
        "My rituals interfere with my daily schedule.",
        "I feel ashamed of my repetitive behaviours.",
        "These thoughts or actions cause me significant distress.",
      ],
      hi: [
        "मेरे मन में अनचाहे विचार बार-बार आते रहते हैं।",
        "मुझे कुछ क्रियाएँ या रीति बार-बार दोहराने की मजबूरी महसूस होती है।",
        "मैं चीज़ों को बार-बार जाँचता/जाँचती हूँ (ताले, उपकरण, स्विच)।",
        "मैं ज़रूरत से ज़्यादा धोता-साफ़ करता/करती हूँ।",
        "मुझे चीज़ों का एक ख़ास क्रम में होना ज़रूरी लगता है।",
        "मेरे मन में परेशान करने वाले विचार आते हैं जिन्हें नज़रअंदाज़ करना मुश्किल है।",
        "चिंता कम करने के लिए मैं मन में गिनती, थपथपाहट या शब्द दोहराता/दोहराती हूँ।",
        "मैं बार-बार दूसरों से आश्वासन माँगता/माँगती हूँ।",
        "मैं दोहराव वाले व्यवहारों में बहुत समय बिताता/बिताती हूँ।",
        "अगर मैं कोई रीति पूरी न कर पाऊँ तो मुझे बहुत चिंता होती है।",
        "जो चीज़ें या स्थितियाँ अनचाहे विचार लाती हैं, मैं उनसे बचता/बचती हूँ।",
        "मुझे संदेह रहता है कि मैंने कोई काम सही किया या नहीं।",
        "मेरी रीतियाँ मेरी दिनचर्या में बाधा डालती हैं।",
        "मुझे अपने दोहराव वाले व्यवहारों पर शर्म महसूस होती है।",
        "ये विचार या क्रियाएँ मुझे काफ़ी परेशान करती हैं।",
      ],
    },
  },
  addiction: {
    slug: "addiction",
    title: { en: "Addiction", hi: "लत (Addiction)" },
    intro: {
      en: "Addiction Assessment Questionnaire. Please answer each question based on your experience over the past two weeks.",
      hi: "लत आकलन प्रश्नावली। कृपया प्रत्येक प्रश्न का उत्तर पिछले दो हफ़्तों के अपने अनुभव के आधार पर दें।",
    },
    questions: {
      en: [
        "I use more, or for longer, than I intend to.",
        "I have tried to cut down but couldn't.",
        "I spend a lot of time obtaining, using, or recovering.",
        "I experience strong urges or cravings.",
        "My use interferes with work, school, or home.",
        "I continue despite the problems it causes with people.",
        "I have given up activities I used to enjoy.",
        "I use even when it is physically risky.",
        "I need more to get the same effect than I used to.",
        "I feel restless or unwell when I stop or cut down.",
        "I hide my use from the people around me.",
        "I feel guilty about my use.",
        "I have neglected responsibilities because of it.",
        "Others have expressed concern about my use.",
        "I feel unable to stop even when I want to.",
      ],
      hi: [
        "मैं इरादे से ज़्यादा या ज़्यादा देर तक इसका उपयोग करता/करती हूँ।",
        "मैंने कम करने की कोशिश की पर नहीं कर पाया/पाई।",
        "इसे पाने, इस्तेमाल करने या उससे उबरने में मेरा काफ़ी समय जाता है।",
        "मुझे तीव्र इच्छा या तलब महसूस होती है।",
        "मेरा उपयोग काम, पढ़ाई या घर में बाधा डालता है।",
        "लोगों के साथ समस्याएँ होने के बावजूद मैं इसे जारी रखता/रखती हूँ।",
        "मैंने वे गतिविधियाँ छोड़ दी हैं जो मुझे पसंद थीं।",
        "शारीरिक रूप से जोखिम होने पर भी मैं इसका उपयोग करता/करती हूँ।",
        "पहले जैसा असर पाने के लिए अब मुझे ज़्यादा की ज़रूरत पड़ती है।",
        "रोकने या कम करने पर मैं बेचैन या अस्वस्थ महसूस करता/करती हूँ।",
        "मैं अपने उपयोग को आस-पास के लोगों से छिपाता/छिपाती हूँ।",
        "मुझे अपने उपयोग को लेकर अपराधबोध होता है।",
        "इसके कारण मैंने ज़िम्मेदारियों की अनदेखी की है।",
        "दूसरों ने मेरे उपयोग को लेकर चिंता जताई है।",
        "चाहने पर भी मैं रुक नहीं पाता/पाती।",
      ],
    },
  },
};

export function getAssessment(slug: string): Assessment | undefined {
  return (ASSESSMENTS as Record<string, Assessment>)[slug];
}

// Spoken-answer hints for each of the 4 options (index 0..3), per language.
// Multi-word phrases match anywhere in the transcript; single tokens must match
// a whole spoken word. Includes the option name, "option N", and the number.
const VOICE_HINTS: Record<Lang, string[][]> = {
  en: [
    // Option 1 — "Not at all". Number forms: one / won / first / 1.
    ["not at all", "not", "never", "none", "no", "nope", "zero", "nothing", "one", "won", "first", "number one", "number 1", "option 1", "option one", "1"],
    // Option 2 — "Several days". Number forms: two / to / too / second / 2.
    ["several days", "several", "some", "sometimes", "few", "occasionally", "a little", "two", "to", "too", "second", "number two", "number 2", "option 2", "option two", "2"],
    // Option 3 — "More than half the days". Number forms: three / tree / third / 3.
    ["more than half the days", "more than half", "often", "half", "frequently", "many", "three", "tree", "third", "number three", "number 3", "option 3", "option three", "3"],
    // Option 4 — "Nearly every day". Number forms: four / for / fore / fourth / 4.
    ["nearly every day", "every day", "everyday", "nearly", "always", "most days", "daily", "constantly", "all the time", "four", "for", "fore", "fourth", "number four", "number 4", "option 4", "option four", "4"],
  ],
  hi: [
    ["बिल्कुल नहीं", "बिल्कुल", "नहीं", "कभी नहीं", "एक", "पहला", "पहला विकल्प", "नंबर एक", "विकल्प एक", "विकल्प 1", "१", "1"],
    ["कुछ दिन", "कुछ", "कभी कभी", "थोड़ा", "दो", "दूसरा", "नंबर दो", "विकल्प दो", "विकल्प 2", "२", "2"],
    ["आधे से ज़्यादा दिन", "आधे से ज़्यादा", "आधे से ज्यादा", "आधे", "अक्सर", "तीन", "तीसरा", "नंबर तीन", "विकल्प तीन", "विकल्प 3", "३", "3"],
    ["लगभग हर दिन", "हर दिन", "लगभग", "हमेशा", "रोज़", "रोज", "रोज़ाना", "चार", "चौथा", "नंबर चार", "विकल्प चार", "विकल्प 4", "४", "4"],
  ],
};

/** Best-matching option index for a spoken answer, or -1 if none matched. */
export function matchOption(transcript: string, lang: Lang = "en"): number {
  const t = transcript
    .toLowerCase()
    // Keep letters, numbers, AND combining marks (\p{M}) — Devanagari vowel
    // signs are marks, so stripping them would mangle Hindi words.
    .replace(/[^\p{L}\p{N}\p{M} ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return -1;
  const words = new Set(t.split(" "));
  let best = -1;
  let bestScore = 0;
  VOICE_HINTS[lang].forEach((hints, i) => {
    let score = 0;
    for (const h of hints) {
      const isPhrase = h.includes(" ");
      const hit = isPhrase ? t.includes(h) : words.has(h);
      // Longer, more specific phrases win over short single tokens.
      if (hit) score = Math.max(score, isPhrase ? h.length : 1);
    }
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}
