import type { Turn } from "@/types";

/**
 * Canned transcript for the mock path. tMs offsets are realistic (~150 wpm) so
 * lib/metrics.ts produces non-trivial wpm / talk-ratio, and two student turns
 * start before the client has finished speaking → two detectable interruptions
 * (this is the quote the Report cites for the "you interrupted twice" moment).
 * Student turns also seed three fillers (um / like / you know).
 */
export const mockTurns: Turn[] = [
  {
    speaker: "client",
    text: "Oh, hello doctor. Sorry, I know you're busy — I probably shouldn't even be taking up your time.",
    tMs: 0,
    sentiment: -0.3,
  },
  {
    speaker: "student",
    text: "Not at all, Margaret, I'm really glad you came in. Take your time — what's been going on for you?",
    tMs: 7000,
    sentiment: 0.5,
  },
  {
    speaker: "client",
    text: "Well, it's just a bit of chest pain, comes and goes. It's probably nothing, honestly — just indigestion, I expect.",
    tMs: 16000,
    sentiment: -0.2,
  },
  {
    // starts at 21s, before the client turn above finishes (~24s) → interruption
    speaker: "student",
    text: "Sorry — um, when you say chest pain, can you tell me a bit more about what it actually feels like?",
    tMs: 21000,
    sentiment: 0.1,
  },
  {
    speaker: "client",
    text: "It's like a tightness, right here in the middle. Sometimes it spreads to my arm. But really, I don't want to waste anyone's time over nothing.",
    tMs: 30000,
    sentiment: -0.4,
  },
  {
    // starts at 38s, before the client turn above finishes (~42s) → interruption
    speaker: "student",
    text: "Right, like a tightness — you know, that's really helpful. Does anything in particular seem to bring it on?",
    tMs: 38000,
    sentiment: 0.2,
  },
  {
    speaker: "client",
    text: "Climbing the stairs, mostly. My father had heart trouble at about my age... but I'm sure I'm just being silly.",
    tMs: 47000,
    sentiment: -0.6,
  },
  {
    speaker: "student",
    text: "Thank you for telling me that — it isn't silly at all, and I can hear how worrying it's been. I'd like us to do an ECG and some bloods today so we can be sure together. Does that sound okay?",
    tMs: 60000,
    sentiment: 0.7,
  },
  {
    speaker: "client",
    text: "Yes... yes, I think I'd actually feel better knowing. Thank you, doctor.",
    tMs: 78000,
    sentiment: 0.5,
  },
];
