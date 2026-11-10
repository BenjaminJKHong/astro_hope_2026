"use client";

import { useWarningState } from "./WarningStateProvider";

export function CriticalWarningBanner() {
  const { state } = useWarningState();
  if (state !== "CRITICAL") return null;

  return <section className="critical-warning-banner" role="alert" aria-live="assertive">
    <span className="warning-symbol" aria-hidden="true">⚠</span>
    <div><strong>CRITICAL MODE ACTIVE · DEMONSTRATION</strong><p>Emergency state is for UI demonstration. Medical event details are not reported.</p></div>
  </section>;
}
