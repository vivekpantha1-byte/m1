"use client";

// Student-facing appearance overrides, kept OUTSIDE the frozen SessionState
// (types.ts). null = "auto" → derive the look/room from the persona's archetype.

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Archetype } from "./archetype";

interface AppearanceValue {
  lookKey: Archetype | null; // avatar override (null = auto)
  themeKey: Archetype | null; // room override (null = auto)
  setLookKey: (a: Archetype | null) => void;
  setThemeKey: (a: Archetype | null) => void;
}

const AppearanceContext = createContext<AppearanceValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [lookKey, setLookKey] = useState<Archetype | null>(null);
  const [themeKey, setThemeKey] = useState<Archetype | null>(null);
  const value = useMemo<AppearanceValue>(
    () => ({ lookKey, themeKey, setLookKey, setThemeKey }),
    [lookKey, themeKey],
  );
  return createElement(AppearanceContext.Provider, { value }, children);
}

export function useAppearance(): AppearanceValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used within an <AppearanceProvider>");
  }
  return ctx;
}
