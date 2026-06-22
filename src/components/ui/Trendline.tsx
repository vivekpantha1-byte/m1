import type { Report } from "@/types";

/** Small progress-trend moment ("58 → 71 over 3 sessions"). */
export function Trendline({ trend }: { trend: NonNullable<Report["trend"]> }) {
  const { label, from, to, sessions } = trend;
  const delta = to - from;
  const up = delta >= 0;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-navy p-4 text-white">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-white/60">
          {label}
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{from}</span>
          <span className="text-white/50">→</span>
          <span className="text-2xl font-bold tabular-nums text-teal">{to}</span>
        </p>
        <p className="text-xs text-white/60">over {sessions} sessions</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          up ? "bg-teal/20 text-teal" : "bg-mood-angry/20 text-mood-angry"
        }`}
      >
        {up ? "▲" : "▼"} {Math.abs(delta)}
      </span>
    </div>
  );
}
