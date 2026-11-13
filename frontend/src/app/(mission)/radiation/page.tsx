"use client";

import React, { useEffect, useState } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useCrewRoster } from "@/hooks/useCrewRoster";
import { useWarningState, WarningStateProvider } from "@/components/warnings/WarningStateProvider";

function getRadiationStatusColor(msv: number) {
  if (msv > 1.0) return "text-red-400 bg-red-500/20 border-red-500/50";
  if (msv > 0.6) return "text-amber-400 bg-amber-500/20 border-amber-500/50";
  return "text-emerald-400 bg-emerald-500/20 border-emerald-500/50";
}

function getRadiationLabel(msv: number) {
  if (msv > 1.0) return "DANGER";
  if (msv > 0.6) return "ELEVATED";
  return "NOMINAL";
}

function RadiationMonitoringContent() {
  const { telemetry, isConnected } = useTelemetry();
  const { state } = useWarningState();
  const baseCritical = state === "CRITICAL" || telemetry?.system_status === "CRITICAL" || telemetry?.system_status === "RED";
  
  const { crew } = useCrewRoster(telemetry, baseCritical);
  const activeCrew = crew.filter((m) => !m.isOffboarded);

  const [ambientFlux, setAmbientFlux] = useState(0.12);
  const [gcrLevel, setGcrLevel] = useState(0.45);
  const [shieldingDeployed, setShieldingDeployed] = useState(false);
  const [evaAborted, setEvaAborted] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => {
      setAmbientFlux(prev => Math.max(0.05, Math.min(2.5, prev + (Math.random() - 0.45) * 0.1)));
      setGcrLevel(prev => Math.max(0.3, Math.min(0.8, prev + (Math.random() - 0.5) * 0.02)));
    }, 4000);
    return () => clearInterval(timer);
  }, [isConnected]);

  const isSpeActive = ambientFlux > 0.8 || baseCritical;

  useEffect(() => {
    if (!isSpeActive) {
      setShieldingDeployed(false);
      setEvaAborted(false);
    }
  }, [isSpeActive]);

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans pb-12">
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
            <span>HELIO-PHYSICS & ACTIVE DOSIMETRY</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">Radiation Monitoring</h1>
          <p className="text-blue-200/65 text-xs mt-1">Solar Particle Event (SPE) tracking and crew cumulative exposure.</p>
        </div>
        <div className="flex gap-3">
          <div className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-widest border flex items-center gap-2 ${isSpeActive ? "bg-amber-500/20 text-amber-300 border-amber-400/50 animate-pulse" : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isSpeActive ? "bg-amber-400" : "bg-emerald-400"}`} />
            {isSpeActive ? "SPE FLUX ELEVATED" : "SPACE WEATHER NOMINAL"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className={`rounded-3xl p-8 border shadow-xl flex flex-col transition-colors ${isSpeActive ? 'bg-amber-950/20 border-amber-500/30' : 'bg-[#141b2d]/85 border-white/10'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase">SOLAR PARTICLE EVENT DETECTOR</h2>
                <p className="text-[11px] text-blue-200/45 mt-1">Real-time proton flux tracking (MeV) via external hull sensors</p>
              </div>
              <svg aria-hidden="true" className={`w-8 h-8 ${isSpeActive ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.243-7.243l-1.414 1.414M7.172 17.828l-1.414 1.414m12.728 0l-1.414-1.414M7.172 6.172L5.758 4.758" />
              </svg>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-900/60 rounded-2xl border border-white/5 p-6">
                <span className="text-[10px] uppercase font-bold text-blue-300/60 block mb-2">Ambient Proton Flux (&gt;10 MeV)</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-extrabold tracking-tight ${isSpeActive ? "text-amber-400" : "text-white"}`}>{ambientFlux.toFixed(2)}</span>
                  <span className="text-sm text-blue-200/50">pfu</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${isSpeActive ? "bg-amber-400" : "bg-cyan-400"}`} style={{ width: `${Math.min(100, ambientFlux * 40)}%` }} />
                </div>
              </div>
              
              <div className="bg-slate-900/60 rounded-2xl border border-white/5 p-6">
                <span className="text-[10px] uppercase font-bold text-blue-300/60 block mb-2">Galactic Cosmic Ray (GCR) Base</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-white">{gcrLevel.toFixed(2)}</span>
                  <span className="text-sm text-blue-200/50">mSv/d</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className="h-1.5 rounded-full bg-purple-400" style={{ width: `${gcrLevel * 100}%` }} />
                </div>
              </div>
            </div>

            {isSpeActive && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-6 mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  <svg aria-hidden="true" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <h3 className="text-sm font-bold tracking-widest text-amber-300 uppercase">SPE MITIGATION PROTOCOLS REQUIRED</h3>
                </div>
                <p className="text-xs text-amber-100/70 mb-5 leading-relaxed">
                  High-energy solar particles detected. Implement immediate ALARA (As Low As Reasonably Achievable) protocols to prevent acute radiation syndrome in active crew members.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setEvaAborted(true)}
                    disabled={evaAborted}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold tracking-wider transition-all ${evaAborted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-not-allowed' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/50'}`}
                  >
                    {evaAborted ? "EVA ABORT INITIATED" : "1. ABORT ALL EVA OPERATIONS"}
                  </button>
                  <button 
                    onClick={() => setShieldingDeployed(true)}
                    disabled={shieldingDeployed}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold tracking-wider transition-all ${shieldingDeployed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-not-allowed' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/50'}`}
                  >
                    {shieldingDeployed ? "WATER SHIELDING DEPLOYED" : "2. DEPLOY HABITAT WATER WALL"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl flex flex-col h-full">
          <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase mb-4">ACTIVE CREW DOSIMETRY</h2>
          
          <div className="flex flex-col gap-3 flex-grow overflow-y-auto pr-1">
            {activeCrew.map((member) => {
              // SonarQube Fix: Prefer codePointAt over charCodeAt
              const seed = member.callsign.codePointAt(member.callsign.length - 1) ?? 0;
              const baseMsv = 0.3 + (seed % 5) * 0.1;
              
              let currentMsv = baseMsv;
              if (isSpeActive) {
                const evaPenalty = (member.location === "EVA Spacewalk" && !evaAborted) ? 0.6 : 0;
                const ambientPenalty = shieldingDeployed ? ambientFlux * 0.05 : ambientFlux * 0.3;
                currentMsv = baseMsv + evaPenalty + ambientPenalty;
              }

              const styleClass = getRadiationStatusColor(currentMsv);
              const label = getRadiationLabel(currentMsv);

              return (
                <div key={member.id} className="bg-slate-900/50 rounded-2xl border border-white/5 p-4 flex flex-col gap-3 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-white block">{member.name}</span>
                      <span className="text-[10px] text-blue-300/60 font-mono uppercase">{member.location}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border ${styleClass}`}>
                      {label}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-blue-200/40">24H EXPOSURE</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-bold ${currentMsv > 1.0 ? 'text-red-400' : 'text-white'}`}>{currentMsv.toFixed(2)}</span>
                      <span className="text-xs text-blue-200/50">mSv</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activeCrew.length === 0 && (
              <div className="text-center text-sm text-blue-200/50 mt-10">No active crew to monitor.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RadiationMonitoringPage() {
  return (
    <WarningStateProvider>
      <RadiationMonitoringContent />
    </WarningStateProvider>
  );
}