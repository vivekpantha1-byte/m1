import { describe, expect, it } from "vitest";
import { computeMetrics } from "@/lib/metrics";
import { mockTurns } from "@/fixtures/conversation";
import type { Turn } from "@/types";

describe("computeMetrics on the canned transcript", () => {
  const m = computeMetrics(mockTurns);

  it("talkRatio = student words / total words", () => {
    // 97 student words / 191 total ≈ 0.51
    expect(m.talkRatio).toBeCloseTo(0.51, 2);
  });

  it("counts fillers (um / uh / like / you know) in student turns only", () => {
    // turn3: um + like (2), turn5: like + you know (2), turn7: like (1) = 5
    expect(m.fillers).toBe(5);
  });

  it("computes student speaking pace in wpm", () => {
    // 97 words over 45s of student turn windows = ~129 wpm
    expect(m.wpm).toBe(129);
  });

  it("detects the two interruptions", () => {
    expect(m.interruptions).toBe(2);
  });

  it("eyeContactPct is 0 when no vision signal is supplied", () => {
    expect(m.eyeContactPct).toBe(0);
  });

  it("avgSentiment averages all turns with a sentiment", () => {
    expect(m.avgSentiment).toBeCloseTo(0.06, 2);
  });
});

describe("computeMetrics edge cases", () => {
  it("handles an empty transcript without dividing by zero", () => {
    const m = computeMetrics([]);
    expect(m).toEqual({
      talkRatio: 0,
      fillers: 0,
      wpm: 0,
      interruptions: 0,
      eyeContactPct: 0,
      avgSentiment: 0,
    });
  });

  it("a single student turn yields talkRatio 1 and no interruptions", () => {
    const turns: Turn[] = [
      { speaker: "student", text: "Hello there, how are you feeling today?", tMs: 0 },
    ];
    const m = computeMetrics(turns);
    expect(m.talkRatio).toBe(1);
    expect(m.interruptions).toBe(0);
  });
});
