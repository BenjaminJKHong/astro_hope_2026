"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { MedicalWarningState } from "@/types/medical-warning";

type WarningStateContextValue = {
  state: MedicalWarningState;
  setState: (state: MedicalWarningState) => void;
};

const WarningStateContext = createContext<WarningStateContextValue | null>(null);

export function WarningStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MedicalWarningState>("NORMAL");

  return <WarningStateContext.Provider value={{ state, setState }}>
    <div className="warning-state-root" data-warning-state={state}>
      {children}
      {state === "CRITICAL" ? <div className="critical-screen-border" aria-hidden="true" /> : null}
    </div>
  </WarningStateContext.Provider>;
}

export function useWarningState() {
  const context = useContext(WarningStateContext);
  if (!context) throw new Error("useWarningState must be used within WarningStateProvider");
  return context;
}
