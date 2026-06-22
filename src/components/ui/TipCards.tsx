/** Exactly two prioritised, actionable coaching tips. */
export function TipCards({ tips }: { tips: [string, string] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tips.map((tip, i) => (
        <div
          key={i}
          className="rounded-2xl bg-teal/8 p-4 ring-1 ring-teal/25"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-dark">
              Next session, try this
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-navy">{tip}</p>
        </div>
      ))}
    </div>
  );
}
