type Step = 1 | 2 | 3;

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Scenario" },
  { n: 2, label: "Rehearsal" },
  { n: 3, label: "Report" },
];

/** Guided 1·2·3 progress rail shown in the app header. */
export function StepRail({ current }: { current: Step }) {
  return (
    <nav aria-label="Progress" className="flex items-center gap-3">
      {STEPS.map(({ n, label }, i) => {
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
                  active
                    ? "bg-teal text-white shadow-[0_0_0_4px_rgb(15_181_174/0.18)]"
                    : done
                      ? "bg-teal-dark text-white"
                      : "bg-navy2/15 text-dim",
                ].join(" ")}
              >
                {done ? "✓" : n}
              </span>
              <span
                className={[
                  "text-sm font-medium transition-colors duration-200",
                  active ? "text-navy" : "text-dim",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={[
                  "h-px w-8 transition-colors duration-200",
                  done ? "bg-teal-dark" : "bg-navy2/20",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
