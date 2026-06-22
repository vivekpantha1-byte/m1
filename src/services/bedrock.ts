// services/bedrock.ts — Bedrock persona parsing + dialogue + report scoring,
// behind a Mock/Real switch (CLAUDE.md §3). Client code never imports this.

import type { ConverseResult, Mood, Persona, Report, Turn } from "@/types";
import { mockPersona } from "@/fixtures/persona";
import { mockTurns } from "@/fixtures/conversation";
import { mockReport } from "@/fixtures/report";

const USE_MOCKS = process.env.USE_MOCKS !== "false";

/** Small fake latency so loading/shimmer states are actually visible in mock mode. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// parseScenario: free text -> Persona (drives the environment + avatar mood)
// ---------------------------------------------------------------------------
export async function parseScenario(text: string): Promise<Persona> {
  if (USE_MOCKS) return mockParseScenario(text);
  return realParseScenario(text);
}

async function mockParseScenario(_text: string): Promise<Persona> {
  await delay(450);
  return mockPersona;
}

async function realParseScenario(_text: string): Promise<Persona> {
  throw new Error("realParseScenario: Bedrock not wired yet");
}

// ---------------------------------------------------------------------------
// converse: latest student turn -> in-character client reply (+ mood shift)
// ---------------------------------------------------------------------------
export async function converse(
  turns: Turn[],
  _studentText: string,
): Promise<ConverseResult> {
  if (USE_MOCKS) return mockConverse(turns, _studentText);
  return realConverse(turns, _studentText);
}

const clientLines = mockTurns.filter((t) => t.speaker === "client");

async function mockConverse(
  turns: Turn[],
  _studentText: string,
): Promise<ConverseResult> {
  await delay(600);
  // Pick the next canned client line by how many client turns already happened.
  const said = turns.filter((t) => t.speaker === "client").length;
  const line = clientLines[Math.min(said, clientLines.length - 1)];

  // Mood softens as the rehearsal progresses: anxious -> anxious -> neutral.
  const progress = said / Math.max(clientLines.length - 1, 1);
  const mood: Mood = progress >= 0.66 ? "neutral" : "anxious";

  return { replyText: line.text, audioUrl: null, mood };
}

async function realConverse(
  _turns: Turn[],
  _studentText: string,
): Promise<ConverseResult> {
  throw new Error("realConverse: Bedrock not wired yet");
}

// ---------------------------------------------------------------------------
// analyze: full transcript -> coaching Report
// ---------------------------------------------------------------------------
export async function analyze(turns: Turn[]): Promise<Report> {
  if (USE_MOCKS) return mockAnalyze(turns);
  return realAnalyze(turns);
}

async function mockAnalyze(_turns: Turn[]): Promise<Report> {
  await delay(900);
  return mockReport;
}

async function realAnalyze(_turns: Turn[]): Promise<Report> {
  throw new Error("realAnalyze: Bedrock not wired yet");
}
