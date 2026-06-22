"use client";

import { useEffect, useState } from "react";

/** Animated overall-score dial (hand-rolled SVG, AWS-orange stroke). */
export function ScoreDial({
  score,
  size = 180,
  label = "Overall",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const [shown, setShown] = useState(0);
  const target = Math.max(0, Math.min(100, score));

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setShown(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const stroke = 12;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (shown / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label} score ${target} out of 100`}
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--color-navy2)"
          strokeOpacity={0.12}
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--color-orange)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-navy"
          style={{ fontSize: size * 0.26, fontWeight: 700 }}
        >
          {shown}
        </text>
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted"
          style={{ fontSize: size * 0.09, fontWeight: 600 }}
        >
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
