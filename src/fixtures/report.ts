import type { Report } from "@/types";

/**
 * Canned coaching report for the mock path (returned by /api/analyze). Every
 * subscore is backed by at least one Evidence item quoting a real line from
 * mockTurns. Metrics here are a hand-tuned snapshot consistent with that
 * transcript; in the live flow lib/metrics.ts recomputes them deterministically.
 */
export const mockReport: Report = {
  overall: 71,
  subscores: {
    empathy: 82,
    clarity: 74,
    questioning: 63,
    structure: 70,
    nonverbal: 66,
  },
  metrics: {
    talkRatio: 0.5,
    fillers: 3,
    wpm: 112,
    interruptions: 2,
    eyeContactPct: 0,
    avgSentiment: 0.1,
  },
  evidence: [
    {
      quote:
        "Thank you for telling me that — it isn't silly at all, and I can hear how worrying it's been.",
      tag: "good",
      comment:
        "Named and validated the emotion right as the hidden fear surfaced — textbook empathy that earned the disclosure.",
    },
    {
      quote: "I'd like us to do an ECG and some bloods today so we can be sure together.",
      tag: "good",
      comment:
        "Clear, jargon-light plan framed as shared ('together') — strong clarity and a concrete next step.",
    },
    {
      quote: "Sorry — um, when you say chest pain, can you tell me a bit more about what it actually feels like?",
      tag: "improve",
      comment:
        "Good open question, but it landed on top of the patient — she was still speaking. Let her finish before probing.",
    },
    {
      quote: "Right, like a tightness — you know, that's really helpful.",
      tag: "flag",
      comment:
        "Second interruption of the session, plus two fillers ('like', 'you know'). Watch the pace and let silences do work.",
    },
    {
      quote: "Take your time — what's been going on for you?",
      tag: "good",
      comment:
        "Open invitation early on set a calm tone and signalled attentive, unhurried body language.",
    },
  ],
  tips: [
    "Let the client finish before you ask your next question — you interrupted twice, both times just as she approached her real worry.",
    "Trim fillers ('um', 'like', 'you know'): replace them with a short, deliberate pause. It reads as calm and confident.",
  ],
  trend: { label: "Empathy under pressure", from: 58, to: 71, sessions: 3 },
};
