"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/useSession";
import { ScoreDial }    from "@/components/ui/ScoreDial";
import { SkillsRadar }  from "@/components/ui/SkillsRadar";
import { MetricChips }  from "@/components/ui/MetricChips";
import { EvidenceList } from "@/components/ui/EvidenceList";
import { TipCards }     from "@/components/ui/TipCards";
import { Trendline }    from "@/components/ui/Trendline";
import { Button }       from "@/components/ui/button";

/** Celebratory confetti burst — fires once on mount when score >= 70. Pure canvas, no dep. */
function ConfettiBurst({ score }: { score: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (score < 70) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#0fb5ae", "#ff9900", "#ffffff", "#22384c", "#ffb547"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      size: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
    }));

    let raf = 0;
    let elapsed = 0;

    function draw() {
      elapsed++;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = 0;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.rotation += p.spin;
        if (p.y < canvas!.height + 20) alive++;
        const alpha = Math.max(0, 1 - elapsed / 180);
        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx!.restore();
      });
      if (alive > 0 && elapsed < 200) raf = requestAnimationFrame(draw);
      else ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  if (score < 70) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 no-print"
      aria-hidden
    />
  );
}

export function ReportScreen() {
  const { report, recordingUrl, reset } = useSession();

  if (!report) return null;

  const scoreLabel =
    report.overall >= 85 ? "Excellent"
    : report.overall >= 70 ? "Good"
    : report.overall >= 55 ? "Developing"
    : "Early stage";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <ConfettiBurst score={report.overall} />

      {/* ── Print-only header (replaces app chrome in the exported PDF) ──── */}
      <div className="hidden print:flex items-center justify-between border-b border-navy2/20 pb-3 mb-4">
        <span className="text-lg font-bold tracking-tight text-navy">
          MIRA <span className="font-normal text-dim">— Communication Coaching Report</span>
        </span>
        <span className="text-xs text-dim">
          {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="bg-navy px-6 py-8 text-center text-white print:rounded-xl print:py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal">
          Coaching Report
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {scoreLabel} — Here&apos;s what happened
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Computed live from your conversation. Every number is reproducible.
        </p>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 py-8 print:space-y-4 print:py-4 print:px-0">

        {/* ── Hero: dial + radar side-by-side ──────────────────────────── */}
        <section className="reveal rounded-2xl bg-white ring-1 ring-navy2/10">
          <div className="flex flex-wrap items-center justify-center divide-x divide-navy2/10">
            <div className="flex flex-col items-center gap-1 px-10 py-8">
              <ScoreDial score={report.overall} size={160} />
              <p className="text-xs font-medium text-dim">Overall score</p>
            </div>
            <div className="flex flex-col items-center gap-1 px-10 py-8">
              <SkillsRadar subscores={report.subscores} />
              <p className="text-xs font-medium text-dim">Skills radar</p>
            </div>
          </div>
        </section>

        {/* ── Metrics ──────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <SectionLabel>Measured signals</SectionLabel>
          <MetricChips metrics={report.metrics} />
        </section>

        {/* ── Evidence ─────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <SectionLabel>What MIRA heard — direct quotes</SectionLabel>
          <EvidenceList evidence={report.evidence} />
        </section>

        {/* ── Tips + trend ─────────────────────────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <SectionLabel>Two things to try next session</SectionLabel>
            <TipCards tips={report.tips} />
          </div>
          {report.trend && (
            <div className="space-y-3">
              <SectionLabel>Your progress</SectionLabel>
              <Trendline trend={report.trend} />
            </div>
          )}
        </section>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <footer className="no-print flex flex-wrap items-center justify-center gap-3 border-t border-navy2/10 pt-6">
          <Button
            onClick={() => window.print()}
            className="bg-navy text-white hover:bg-navy2"
          >
            Download report (PDF) ↓
          </Button>

          {recordingUrl ? (
            <a
              href={recordingUrl}
              download="mira-rehearsal.webm"
              className="inline-flex items-center rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark"
            >
              Download recording ↓
            </a>
          ) : (
            <Button disabled className="bg-teal/40 text-white cursor-not-allowed">
              Recording unavailable
            </Button>
          )}

          <Button
            onClick={reset}
            variant="outline"
            className="border-navy2/20 text-navy hover:bg-navy/5"
          >
            Rehearse again
          </Button>
        </footer>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-dim">
      {children}
    </h2>
  );
}
