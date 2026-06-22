"use client";

import { SessionProvider, useSession } from "@/lib/useSession";
import { StepRail } from "@/components/ui/StepRail";
import { ScenarioScreen } from "@/components/screens/ScenarioScreen";
import { RehearsalScreen } from "@/components/screens/RehearsalScreen";
import { ReportScreen } from "@/components/screens/ReportScreen";

function AppBody() {
  const { step } = useSession();
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-navy2/10 bg-white/70 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-navy">MIRA</span>
          <span className="rounded-full bg-orange/15 px-2 py-0.5 text-xs font-semibold text-orange">
            mocks
          </span>
        </div>
        <StepRail current={step} />
      </header>

      <main key={step} className="reveal flex flex-1 flex-col">
        {step === 1 && <ScenarioScreen />}
        {step === 2 && <RehearsalScreen />}
        {step === 3 && <ReportScreen />}
      </main>
    </div>
  );
}

export function AppShell() {
  return (
    <SessionProvider>
      <AppBody />
    </SessionProvider>
  );
}
