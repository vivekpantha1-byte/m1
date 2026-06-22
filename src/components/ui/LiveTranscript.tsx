"use client";

import { useEffect, useRef } from "react";
import type { Turn } from "@/types";

/** Scrolling live transcript. Student bubbles right, client left. Captions on (§5). */
export function LiveTranscript({
  turns,
  isThinking,
  clientName = "Client",
}: {
  turns: Turn[];
  isThinking?: boolean;
  clientName?: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, isThinking]);

  return (
    <div
      aria-live="polite"
      className="flex h-full flex-col gap-3 overflow-y-auto rounded-2xl bg-white/70 p-4 ring-1 ring-navy2/10"
    >
      {turns.length === 0 && !isThinking && (
        <p className="m-auto text-sm text-dim">
          Push to talk to begin the conversation.
        </p>
      )}

      {turns.map((turn, i) => {
        const isStudent = turn.speaker === "student";
        return (
          <div
            key={i}
            className={`flex flex-col ${isStudent ? "items-end" : "items-start"}`}
          >
            <span className="px-2 text-[11px] font-medium uppercase tracking-wide text-dim">
              {isStudent ? "You" : clientName}
            </span>
            <p
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                isStudent
                  ? "rounded-br-sm bg-teal text-white"
                  : "rounded-bl-sm bg-navy2/8 text-navy"
              }`}
            >
              {turn.text}
            </p>
          </div>
        );
      })}

      {isThinking && (
        <div className="flex flex-col items-start">
          <span className="px-2 text-[11px] font-medium uppercase tracking-wide text-dim">
            {clientName}
          </span>
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-navy2/8 px-4 py-3">
            <span className="shimmer h-2 w-2 rounded-full" />
            <span className="shimmer h-2 w-16 rounded-full" />
            <span className="text-xs text-dim">MIRA is thinking…</span>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
