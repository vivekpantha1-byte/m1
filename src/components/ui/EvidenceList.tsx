import type { Evidence } from "@/types";

const TAG_STYLES: Record<Evidence["tag"], { dot: string; label: string; text: string }> = {
  good: { dot: "bg-teal", label: "Strength", text: "text-teal-dark" },
  improve: { dot: "bg-orange", label: "Work on", text: "text-orange" },
  flag: { dot: "bg-mood-angry", label: "Flag", text: "text-mood-angry" },
};

/** Evidence list — every item quotes a real line from the session (W3). */
export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return (
    <ul className="space-y-3">
      {evidence.map((e, i) => {
        const style = TAG_STYLES[e.tag];
        return (
          <li
            key={i}
            className="rounded-xl bg-white p-4 ring-1 ring-navy2/10"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>
                {style.label}
              </span>
            </div>
            <blockquote className="mt-2 border-l-2 border-navy2/20 pl-3 text-sm italic leading-relaxed text-navy">
              “{e.quote}”
            </blockquote>
            <p className="mt-2 text-sm leading-relaxed text-navy2">{e.comment}</p>
          </li>
        );
      })}
    </ul>
  );
}
