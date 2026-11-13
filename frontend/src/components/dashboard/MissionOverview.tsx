"use client";

import { TelemetryChart } from "./TelemetryChart";
import { AnalysisPreview } from "./AnalysisPreview";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useCrewRoster } from "@/hooks/useCrewRoster";
import { useWarningState } from "@/components/warnings/WarningStateProvider";
import Link from "next/link";

function getSystemStatusCardStyle(anyCrewCritical: boolean, caution: boolean) {
  if (anyCrewCritical) return "bg-red-950/40 border-red-500/50 hover:scale-[1.02]";
  if (caution) return "bg-amber-950/40 border-amber-500/50 hover:scale-[1.02]";
  return "bg-[#141b2d]/85 border-white/10 hover:scale-[1.02]";
}

function getSystemStatusTextColor(anyCrewCritical: boolean, isGlobalTreated: boolean, caution: boolean) {
  if (anyCrewCritical) return "text-red-400 animate-pulse";
  if (isGlobalTreated) return "text-emerald-400";
  if (caution) return "text-amber-400";
  return "text-green-400";
}

function getSystemStatusIconColor(anyCrewCritical: boolean, caution: boolean) {
  if (anyCrewCritical) return "text-red-400";
  if (caution) return "text-amber-400";
  return "text-green-400";
}

function getSystemStatusLabel(anyCrewCritical: boolean, isGlobalTreated: boolean, status: string | undefined) {
  if (anyCrewCritical) return "CRITICAL";
  if (isGlobalTreated) return "STABILIZED";
  return status || "NOMINAL";
}

export function MissionOverview() {
  const { telemetry, isConnected } = useTelemetry();
  const { state } = useWarningState();
  
  const backendCritical = state === "CRITICAL" || telemetry?.system_status === "CRITICAL" || telemetry?.system_status === "RED";
  const caution = telemetry?.system_status === "AMBER" || telemetry?.system_status === "YELLOW";

  const { crew, hrHistory, spo2History, isGlobalTreated, adminOverrideAll } = useCrewRoster(telemetry, backendCritical);
  
  const anyCrewCritical = (backendCritical || crew.some((m) => m.isCritical)) && !isGlobalTreated;
  const activeCrew = crew.filter(m => !m.isOffboarded);
  const criticalCrewMember = activeCrew.find(m => m.isCritical);

  const metricCardStyle = anyCrewCritical ? "bg-red-950/40 border-red-500/50" : "bg-[#141b2d]/85 border-white/10";
  const metricTextStyle = anyCrewCritical ? "text-red-400" : "text-white";
  const iconColor = anyCrewCritical ? "text-red-400" : "text-blue-400";

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans pb-10">
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">Astropulse Command</h1>
          <p className="text-blue-200/65 text-sm mt-1 font-medium">Orbital Telemetry & Multi-Crew Bio-Monitoring</p>
        </div>
        
        <div className="flex gap-3 items-center">
          {anyCrewCritical && (
            <button 
              onClick={adminOverrideAll}
              className="px-5 py-2.5 rounded-full text-[10px] font-extrabold tracking-widest bg-red-600/20 hover:bg-red-500/40 text-red-200 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all flex items-center gap-2"
            >
              <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              ADMIN OVERRIDE
            </button>
          )}

          <div className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-widest border flex items-center gap-2 transition-colors ${isConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-red-500/20 text-red-300 border-red-400/50'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'UPLINK ACTIVE' : 'UPLINK OFFLINE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-3xl p-6 border shadow-lg transition-colors ${metricCardStyle}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold tracking-widest text-blue-200/60 uppercase">Heart Rate</span>
            <svg aria-hidden="true" className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold tracking-tight ${metricTextStyle}`}>
              {typeof telemetry?.heart_rate === "number" ? Math.round(telemetry.heart_rate) : "--"}
            </span>
            <span className="text-xs text-blue-200/50 font-medium">BPM</span>
          </div>
        </div>

        <div className={`rounded-3xl p-6 border shadow-lg transition-colors ${metricCardStyle}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold tracking-widest text-blue-200/60 uppercase">Blood Oxygen</span>
            <svg aria-hidden="true" className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" /></svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold tracking-tight ${metricTextStyle}`}>
              {typeof telemetry?.spo2 === "number" ? Math.round(telemetry.spo2) : "--"}
            </span>
            <span className="text-xs text-blue-200/50 font-medium">%</span>
          </div>
        </div>

        <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold tracking-widest text-blue-200/60 uppercase">Blood Pressure</span>
            <svg aria-hidden="true" className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">118<span className="text-xl text-blue-200/70">/76</span></span>
            <span className="text-xs text-blue-200/50 font-medium">mmHg</span>
          </div>
        </div>

        <Link href="/system-status" className={`block rounded-3xl p-6 border shadow-lg transition-all ${getSystemStatusCardStyle(anyCrewCritical, caution)}`}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold tracking-widest text-blue-200/60 uppercase">System Status</span>
            <svg aria-hidden="true" className={`w-4 h-4 ${getSystemStatusIconColor(anyCrewCritical, caution)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-widest uppercase ${getSystemStatusTextColor(anyCrewCritical, isGlobalTreated, caution)}`}>
              {getSystemStatusLabel(anyCrewCritical, isGlobalTreated, telemetry?.system_status)}
            </span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl h-[300px]">
          <TelemetryChart title="All Crew · Heart Rate Trend" unit="BPM" data={hrHistory} crew={activeCrew} />
        </div>
        <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl h-[300px]">
          <TelemetryChart title="All Crew · SpO₂ Trend" unit="%" data={spo2History} crew={activeCrew} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl min-h-[220px]">
          <AnalysisPreview telemetry={telemetry} isConnected={isConnected} />
        </div>
        
        {/* REPLACED RADIATION WITH ACTIVE DIRECTIVES RESPONSE PANEL */}
        <div className={`rounded-3xl p-6 shadow-xl min-h-[220px] border flex flex-col justify-center transition-colors ${anyCrewCritical ? 'bg-red-950/40 border-red-500/50' : 'bg-[#141b2d]/85 border-white/10'}`}>
          <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase mb-4">ACTIVE DIRECTIVES</h2>
          
          {anyCrewCritical ? (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-sm font-bold text-red-300 block mb-1">PHYSIOLOGICAL ANOMALY DETECTED</span>
                <p className="text-xs text-red-200/70">Immediate triage intervention required for <strong className="text-white">{criticalCrewMember?.name || "Crew Member"}</strong>.</p>
              </div>
              <Link 
                href={`/biometric-trends?crew=${criticalCrewMember?.id || 'crew-04a'}`}
                className="w-full text-center py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold tracking-widest text-sm shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse transition-all border border-red-400"
              >
                OPEN HEALTH ANALYTICS →
              </Link>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center opacity-60">
              <svg aria-hidden="true" className="w-10 h-10 text-emerald-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-emerald-300 font-bold">ALL CREW DIRECTIVES NOMINAL</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}