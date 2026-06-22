"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/types";

const AXES: { key: keyof Report["subscores"]; label: string }[] = [
  { key: "empathy",     label: "Empathy"     },
  { key: "clarity",     label: "Clarity"     },
  { key: "questioning", label: "Questioning" },
  { key: "structure",   label: "Structure"   },
  { key: "nonverbal",   label: "Non-verbal"  },
];

const N    = AXES.length;
const SIZE = 220;
const CX   = SIZE / 2;
const CY   = SIZE / 2;
const MAX_R = 82; // max radius to edge of pentagon

/** Angle of axis i, starting top and going clockwise. */
function angle(i: number) {
  return (Math.PI * 2 * i) / N - Math.PI / 2;
}

function point(r: number, i: number) {
  return {
    x: CX + r * Math.cos(angle(i)),
    y: CY + r * Math.sin(angle(i)),
  };
}

function toPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";
}

/**
 * Animated spider/radar chart for the 5 communication subscores.
 * Pure SVG — no new deps. Animates from 0 on mount.
 */
export function SkillsRadar({ subscores }: { subscores: Report["subscores"] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80); // brief delay so transition fires
    return () => clearTimeout(id);
  }, []);

  const gridLevels = [20, 40, 60, 80, 100];

  // Score polygon points (or zeroed for initial state)
  const scorePts = AXES.map(({ key }, i) => {
    const frac = mounted ? subscores[key] / 100 : 0;
    return point(frac * MAX_R, i);
  });

  // Max-extent pentagon (reference shape)
  const maxPts = AXES.map((_, i) => point(MAX_R, i));

  return (
    <div className="flex flex-col items-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Skills radar chart"
        style={{ overflow: "visible" }}
      >
        {/* ── Background web ──────────────────────────────────── */}
        {gridLevels.map((lvl) => {
          const pts = AXES.map((_, i) => point((lvl / 100) * MAX_R, i));
          return (
            <path
              key={lvl}
              d={toPath(pts)}
              fill="none"
              stroke="rgb(27 42 58 / 0.10)"
              strokeWidth={1}
            />
          );
        })}

        {/* ── Axis lines ──────────────────────────────────────── */}
        {maxPts.map((p, i) => (
          <line
            key={i}
            x1={CX} y1={CY}
            x2={p.x} y2={p.y}
            stroke="rgb(27 42 58 / 0.12)"
            strokeWidth={1}
          />
        ))}

        {/* ── Score polygon fill ──────────────────────────────── */}
        <path
          d={toPath(scorePts)}
          fill="rgb(15 181 174 / 0.18)"
          stroke="none"
          style={{ transition: "d 700ms cubic-bezier(0.4,0,0.2,1)" }}
        />

        {/* ── Score polygon stroke ────────────────────────────── */}
        <path
          d={toPath(scorePts)}
          fill="none"
          stroke="#0fb5ae"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ transition: "d 700ms cubic-bezier(0.4,0,0.2,1)" }}
        />

        {/* ── Score dots ──────────────────────────────────────── */}
        {scorePts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="white"
            stroke="#0fb5ae"
            strokeWidth={2}
            style={{ transition: `cx 700ms, cy 700ms` }}
          />
        ))}

        {/* ── Axis labels ─────────────────────────────────────── */}
        {maxPts.map((p, i) => {
          const ax = angle(i);
          const labelR = MAX_R + 20;
          const lx = CX + labelR * Math.cos(ax);
          const ly = CY + labelR * Math.sin(ax);
          const anchor =
            Math.abs(Math.cos(ax)) < 0.1 ? "middle"
            : Math.cos(ax) < 0 ? "end"
            : "start";
          return (
            <text
              key={i}
              x={lx}
              y={ly + 4}
              textAnchor={anchor}
              fontSize={10}
              fontWeight={600}
              fill="#6b8195"
              letterSpacing="0.03em"
            >
              {AXES[i].label}
            </text>
          );
        })}

        {/* ── Score values on dots ─────────────────────────────── */}
        {scorePts.map((p, i) => (
          <text
            key={`v${i}`}
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="#0a8f89"
            style={{ transition: `x 700ms, y 700ms` }}
          >
            {mounted ? subscores[AXES[i].key] : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}
