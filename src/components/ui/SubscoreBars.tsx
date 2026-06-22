"use client";

import { useEffect, useState } from "react";
import type { Report } from "@/types";

const LABELS: { key: keyof Report["subscores"]; label: string }[] = [
  { key: "empathy", label: "Empathy" },
  { key: "clarity", label: "Clarity" },
  { key: "questioning", label: "Questioning" },
  { key: "structure", label: "Structure" },
  { key: "nonverbal", label: "Non-verbal" },
];

/** Five animated subscore bars. */
export function SubscoreBars({ subscores }: { subscores: Report["subscores"] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-3">
      {LABELS.map(({ key, label }) => {
        const value = subscores[key];
        return (
          <div key={key}>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-navy">{label}</span>
              <span className="tabular-nums text-dim">{value}</span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-navy2/10">
              <div
                className="h-full rounded-full bg-teal transition-[width] duration-700 ease-[var(--ease-mira)]"
                style={{ width: mounted ? `${value}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
