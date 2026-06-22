"use client";

import type { Turn } from "@/types";
import { computeMetrics } from "@/lib/metrics";

/**
 * Real-time coaching signal panel — updates after every turn.
 * Gives the student live feedback so they can adjust before the session ends.
 */
export function LiveCoach({ turns }: { turns: Turn[] }) {
  if (turns.length === 0) {
    return (
      <div className="rounded-xl border border-navy2/10 bg-white/60 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-dim">Live coaching</p>
        <p className="mt-1 text-xs text-navy/50">Signals appear after your first turn.</p>
      </div>
    );
  }

  const m = computeMetrics(turns);
  const talkPct = Math.round(m.talkRatio * 100);

  // Derive a simple on-the-fly tip.
  let tip = "";
  if (m.fillers >= 3) tip = `${m.fillers} fillers so far — try a pause instead.`;
  else if (talkPct > 60) tip = "You're doing a lot of the talking. Ask an open question.";
  else if (m.interruptions > 0) tip = "Let the client finish — you've interrupted once.";
  else tip = "Good pacing. Keep using open questions.";

  return (
    <div className="rounded-xl border border-navy2/10 bg-white px-4 py-3 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-dim">Live coaching</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Chip label="Talk ratio" value={`${talkPct}%`} ok={talkPct <= 50} />
        <Chip label="Fillers" value={String(m.fillers)} ok={m.fillers === 0} />
        <Chip label="Interrupts" value={String(m.interruptions)} ok={m.interruptions === 0} />
      </div>

      <p className="text-[11px] leading-snug text-navy/70 border-t border-navy2/10 pt-2">
        <span className="font-semibold text-teal">MIRA:</span> {tip}
      </p>
    </div>
  );
}

function Chip({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className={`rounded-lg py-1.5 px-2 ${ok ? "bg-teal/8" : "bg-orange/8"}`}>
      <p className={`text-sm font-bold ${ok ? "text-teal-dark" : "text-orange"}`}>{value}</p>
      <p className="text-[10px] text-dim">{label}</p>
    </div>
  );
}
