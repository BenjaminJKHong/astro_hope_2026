"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useCrewRoster } from "@/hooks/useCrewRoster";
import { useWarningState, WarningStateProvider } from "@/components/warnings/WarningStateProvider";

interface LogEntry { id: string; time: string; message: string; severity: string; }

function getLogColorClass(index: number, severity: string) {
  if (index !== 0) return "text-blue-200/50";
  if (severity === "CRITICAL") return "text-red-300";
  return "text-cyan-300";
}

function getSeverityColorClass(severity: string) {
  if (severity === "CRITICAL") return "text-red-400";
  return "text-emerald-400";
}

function ParsedLogMessage({ raw }: Readonly<{ raw: string }>) {
  try {
    const data = JSON.parse(raw);
    return (
      <div className="flex flex-col gap-1.5 mt-0.5">
        {data.agent && <span className="text-[10px] text-blue-400/80 font-bold tracking-widest uppercase">{data.agent}</span>}
        <span className="text-sm">{data.diagnosis || data.message || raw}</span>
      </div>
    );
  } catch {
    return <span className="text-sm mt-0.5 block">{raw}</span>;
  }
}

function AIFlightSurgeonContent() {
  const { telemetry, isConnected } = useTelemetry();
  const { state } = useWarningState();
  const baseCritical = state === "CRITICAL" || telemetry?.system_status === "CRITICAL" || telemetry?.system_status === "RED";
  
  const { crew, treatCrewMember } = useCrewRoster(telemetry, baseCritical);
  const criticalCrew = crew.filter((m) => m.isCritical && !m.isOffboarded);
  const activeCritical = criticalCrew.length > 0 ? criticalCrew[0] : null;
  const [logs, setLogs] = useState<Array<LogEntry>>([]);

  useEffect(() => {
    if (telemetry?.ai_surgeon_log) {
      const timeStr = new Date().toTimeString().slice(0, 8);
      const severity = baseCritical ? "CRITICAL" : "NOMINAL";
      setLogs(prev => {
        if (prev.length > 0 && prev[0].message === telemetry.ai_surgeon_log) return prev;
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newLog: LogEntry = { id: uniqueId, time: timeStr, message: telemetry.ai_surgeon_log as string, severity };
        return [newLog, ...prev].slice(0, 15);
      });
    }
  }, [telemetry?.ai_surgeon_log, baseCritical]);

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans pb-12">
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
            <span>LLaMA 3 · ASTROPULSE MEDICAL INFERENCE ENGINE</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">AI Flight Surgeon Feed</h1>
          <p className="text-blue-200/65 text-xs mt-1">Live autonomous medical diagnosis and procedural triage generation</p>
        </div>
        <div className="flex gap-3">
          <div className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-widest border flex items-center gap-2 ${isConnected ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-red-500/20 text-red-300 border-red-400/50"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
            {isConnected ? "INFERENCE ENGINE ACTIVE" : "ENGINE OFFLINE"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className={`rounded-3xl p-6 border shadow-xl flex flex-col justify-between min-h-[300px] ${activeCritical ? 'bg-red-950/40 border-red-500/50' : 'bg-[#141b2d]/85 border-white/10'}`}>
            <div>
              <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase mb-4">CURRENT TRIAGE DIRECTIVE</h2>
              
              {activeCritical ? (
                <>
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-red-300/80 block mb-1">AFFECTED PERSONNEL</span>
                    <p className="text-lg font-bold text-white">{activeCritical.name} <span className="text-sm font-mono text-red-300 ml-2">UNIT {activeCritical.callsign}</span></p>
                    <p className="text-xs text-red-200/70">{activeCritical.location} · {activeCritical.currentTask}</p>
                  </div>
                  
                  {/* EXPANDED INTERACTIVE ACTION PANEL */}
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5 mb-4">
                     <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-3">REQUIRED TRIAGE ACTIONS</span>
                     
                     <div className="space-y-3 mb-5">
                       <label className="flex items-center gap-3 cursor-pointer group">
                         <input type="checkbox" className="w-4 h-4 rounded border-emerald-500/50 bg-transparent text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0" />
                         <span className="text-xs text-emerald-100/80 group-hover:text-emerald-100 transition-colors">Verify internal helmet pCO₂ levels are dropping</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group">
                         <input type="checkbox" className="w-4 h-4 rounded border-emerald-500/50 bg-transparent text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0" />
                         <span className="text-xs text-emerald-100/80 group-hover:text-emerald-100 transition-colors">Confirm physical tether securing crew member to structure</span>
                       </label>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => treatCrewMember(activeCritical.id)} className="col-span-2 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/50 text-xs font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                          MAXIMIZE LCVG COOLANT LOOP
                       </button>
                       <button onClick={() => treatCrewMember(activeCritical.id)} className="py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/50 text-[10px] font-bold tracking-wider transition-all">
                          INITIATE 100% O₂ FLUSH
                       </button>
                       <button onClick={() => treatCrewMember(activeCritical.id)} className="py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/50 text-[10px] font-bold tracking-wider transition-all">
                          ADMINISTER SEDATIVE
                       </button>
                     </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-10">
                  <svg aria-hidden="true" className="w-12 h-12 text-emerald-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-emerald-300 font-bold">ALL CREW METRICS NOMINAL</p>
                </div>
              )}
            </div>
            
            {activeCritical && (
               <Link href={`/biometric-trends?crew=${activeCritical.id}`} className="w-full text-center py-3 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-bold tracking-wider transition-all">
                 OPEN BIOMETRIC SCANNER →
               </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl flex flex-col h-[600px]">
          <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase mb-4">LIVE GENERATIVE LOG TERMINAL</h2>
          <div className="flex-grow bg-[#0b101e] border border-white/5 rounded-2xl p-4 overflow-y-auto font-mono shadow-inner relative">
            {logs.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-blue-300/40 text-xs uppercase tracking-widest">Waiting for first inference log...</div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, i) => (
                  <div key={log.id} className={`pb-4 border-b border-white/5 ${getLogColorClass(i, log.severity)}`}>
                    <div className="flex gap-3 mb-1">
                      <span className="opacity-50">[{log.time}]</span>
                      <span className={`font-bold ${getSeverityColorClass(log.severity)}`}>[{log.severity}]</span>
                    </div>
                    <div className="pl-[84px] leading-relaxed"><ParsedLogMessage raw={log.message} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIFlightSurgeonPage() { return <WarningStateProvider><AIFlightSurgeonContent /></WarningStateProvider>; }