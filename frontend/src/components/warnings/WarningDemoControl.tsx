"use client";

import { useWarningState } from "./WarningStateProvider";

export function WarningDemoControl() {
  const { state, setState } = useWarningState();

  return <fieldset className="warning-demo-control">
    <legend>DEMO WARNING STATE</legend>
    <div role="group" aria-label="Select warning demonstration state">
      <button type="button" aria-pressed={state === "NORMAL"} onClick={() => setState("NORMAL")}>NORMAL</button>
      <button type="button" aria-pressed={state === "CRITICAL"} onClick={() => setState("CRITICAL")}>CRITICAL</button>
    </div>
  </fieldset>;
}
