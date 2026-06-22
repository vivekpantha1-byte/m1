import { NextResponse } from "next/server";
import type { Persona } from "@/types";
import { parseScenario } from "@/services/bedrock";
import { mockPersona } from "@/fixtures/persona";

// POST { text } -> Persona.  ?demo=1 returns the fixture directly (CLAUDE.md §3).
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("demo") === "1") {
    return NextResponse.json<Persona>(mockPersona);
  }

  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
  }

  const persona = await parseScenario(text);
  return NextResponse.json<Persona>(persona);
}
