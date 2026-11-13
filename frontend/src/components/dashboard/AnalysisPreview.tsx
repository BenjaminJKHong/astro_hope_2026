"use client";

import Link from "next/link";
import { useCrewRoster } from "@/hooks/useCrewRoster";
import type { TelemetryMessage } from "@/types/telemetry";

export function AnalysisPreview({ telemetry }: Readonly<{ telemetry: TelemetryMessage | null; isConnected?: boolean }>) {
  const { crew, isGlobalTreated } = useCrewRoster(telemetry);
  const anyCritical = crew.some(m => m.isCritical) && !isGlobalTreated;
  const criticalMember = crew.find(m => m.isCritical && !m.isOffboarded);

  return (
    <div className={`h-full flex flex-col justify-between transition-colors ${anyCritical ? 'bg-red-950/20' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase">AI ANALYSIS PREVIEW</h2>
        {anyCritical && (
          <Link href="/ai-surgeon" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
            OPEN AI SURGEON →
          </Link>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {anyCritical ? (
          <div className="rounded-2xl bg-red-950/50 border border-red-500/40 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/30 text-red-200 border border-red-400/50 uppercase">
                TRIAGE: CRITICAL
              </span>
              <span className="text-[10px] text-blue-300/60 font-mono">Astropulse-AI-Surgeon-v1</span>
            </div>
            <p className="text-xs text-red-100 font-medium leading-relaxed">
              CRITICAL ANOMALY DETECTED for <strong className="text-white">{criticalMember?.name}</strong>. Immediate physiological stabilization required. Review AI Flight Surgeon protocol.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-5 text-center flex flex-col items-center justify-center">
            <svg aria-hidden="true" className="w-8 h-8 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">All Physiological Metrics Nominal</p>
            <p className="text-[11px] text-blue-200/50 mt-1">LLaMA 3 inference engine active; no telemetry faults recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
}