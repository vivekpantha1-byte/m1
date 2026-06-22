import { NextResponse } from "next/server";
import type { ConverseResult, Persona, Turn } from "@/types";
import { converse } from "@/services/bedrock";
import { synthesize } from "@/services/polly";
import { mockPersona } from "@/fixtures/persona";
import { mockTurns } from "@/fixtures/conversation";

// POST { turns, studentText, persona? } -> ConverseResult.  ?demo=1 returns a fixture line.
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("demo") === "1") {
    const firstClient = mockTurns.find((t) => t.speaker === "client")!;
    return NextResponse.json<ConverseResult>({
      replyText: firstClient.text,
      audioUrl: null,
      mood: mockPersona.avatarMood,
    });
  }

  let turns: Turn[] = [];
  let studentText = "";
  let persona: Persona | null = null;
  try {
    const body = await req.json();
    turns = Array.isArray(body?.turns) ? body.turns : [];
    studentText = typeof body?.studentText === "string" ? body.studentText : "";
    persona = body?.persona ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!studentText.trim()) {
    return NextResponse.json({ error: "Missing 'studentText'" }, { status: 400 });
  }

  // Persona keeps the real client in character + picks its Polly voice.
  const result = await converse(turns, studentText, persona);
  const voiceId = persona?.voiceId ?? mockPersona.voiceId;
  // If a real voice is available, attach it; otherwise null -> speechSynthesis.
  const audioUrl =
    result.audioUrl ?? (await synthesize(result.replyText, voiceId));

  return NextResponse.json<ConverseResult>({ ...result, audioUrl });
}
