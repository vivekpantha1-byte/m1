"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Persona, Report, SessionState, Turn } from "@/types";

/** Actions exposed alongside the SessionState (single source of truth, CLAUDE.md §1). */
interface SessionActions {
  setScenarioText: (text: string) => void;
  setPersona: (persona: Persona | null) => void;
  addTurn: (turn: Turn) => void;
  setTurns: (turns: Turn[]) => void;
  setReport: (report: Report | null) => void;
  setRecordingUrl: (url: string | null) => void;
  goToStep: (step: SessionState["step"]) => void;
  reset: () => void;
}

type SessionContextValue = SessionState & SessionActions;

const INITIAL: SessionState = {
  step: 1,
  scenarioText: "",
  persona: null,
  turns: [],
  report: null,
  recordingUrl: null,
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(INITIAL);

  const setScenarioText = useCallback(
    (scenarioText: string) => setState((s) => ({ ...s, scenarioText })),
    [],
  );
  const setPersona = useCallback(
    (persona: Persona | null) => setState((s) => ({ ...s, persona })),
    [],
  );
  const addTurn = useCallback(
    (turn: Turn) => setState((s) => ({ ...s, turns: [...s.turns, turn] })),
    [],
  );
  const setTurns = useCallback(
    (turns: Turn[]) => setState((s) => ({ ...s, turns })),
    [],
  );
  const setReport = useCallback(
    (report: Report | null) => setState((s) => ({ ...s, report })),
    [],
  );
  const setRecordingUrl = useCallback(
    (recordingUrl: string | null) => setState((s) => ({ ...s, recordingUrl })),
    [],
  );
  const goToStep = useCallback(
    (step: SessionState["step"]) => setState((s) => ({ ...s, step })),
    [],
  );
  const reset = useCallback(() => setState(INITIAL), []);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      setScenarioText,
      setPersona,
      addTurn,
      setTurns,
      setReport,
      setRecordingUrl,
      goToStep,
      reset,
    }),
    [
      state,
      setScenarioText,
      setPersona,
      addTurn,
      setTurns,
      setReport,
      setRecordingUrl,
      goToStep,
      reset,
    ],
  );

  // createElement (not JSX) so this stays a .ts file.
  return createElement(SessionContext.Provider, { value }, children);
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
