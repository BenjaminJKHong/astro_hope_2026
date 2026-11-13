"use client";

import React, { useState } from "react";
import { WarningStateProvider } from "@/components/warnings/WarningStateProvider";

interface AlertIncident {
  id: string;
  level: "WARNING" | "CAUTION" | "CRITICAL";
  title: string;
  source: string;
  time: string;
  description: string;
}

const INITIAL_ALERTS: AlertIncident[] = [
  {
    id: "inc-001",
    level: "WARNING",
    title: "Slight CO₂ Elevation",
    source: "Cmdr. Elena Vance",
    time: "11:24:00 Z",
    description: "CO₂ levels in xEMU suit oral-nasal cavity elevated above nominal baseline (3.2 mmHg). Recommend monitoring RCA scrubber performance.",
  },
  {
    id: "inc-002",
    level: "CAUTION",
    title: "Telemetry Packet Loss",
    source: "Station Comm Link",
    time: "09:12:30 Z",
    description: "Intermittent UHF transmission drop lasting 4 seconds. Auto-reconnected successfully. Data buffers have been flushed.",
  }
];

function getLevelStyle(level: string) {
  if (level === "CRITICAL") return "bg-red-500/20 text-red-300 border-red-500/50";
  if (level === "WARNING") return "bg-amber-500/20 text-amber-300 border-amber-500/50";
  return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50";
}

function AlertCenterContent() {
  const [alerts, setAlerts] = useState<AlertIncident[]>(INITIAL_ALERTS);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_ALERTS[0]?.id || null);

  const selectedAlert = alerts.find(a => a.id === selectedId);

  const resolveAlert = () => {
    if (!selectedId) return;
    const remaining = alerts.filter(a => a.id !== selectedId);
    setAlerts(remaining);
    setSelectedId(remaining.length > 0 ? remaining[0].id : null);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans pb-12">
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
            <span className="block">MISSION CONTROL · ALERT LOG & TRIAGE CENTER</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">Alert Center</h1>
        </div>
        <div className="flex gap-3">
          <div className="px-5 py-2.5 rounded-full text-xs font-extrabold tracking-widest border flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
            TRIAGE DESK ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* INCIDENT LOG LIST */}
        <div className="lg:col-span-5 rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl flex flex-col">
          <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase mb-4">INCIDENT LOG</h2>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <div className="text-center text-sm text-blue-200/50 mt-10">All alerts have been resolved.</div>
            ) : (
              alerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setSelectedId(alert.id)}
                  className={`text-left p-4 rounded-2xl border transition-all ${selectedId === alert.id ? 'bg-slate-800/80 border-cyan-500/50 shadow-md' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest border ${getLevelStyle(alert.level)}`}>
                      {alert.level}
                    </span>
                    <span className="text-[10px] text-blue-200/50 font-mono">{alert.time}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{alert.title}</h3>
                  <p className="text-[11px] text-blue-300/60">{alert.source}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* INCIDENT DETAILS & RESOLUTION */}
        <div className="lg:col-span-7 rounded-3xl bg-[#141b2d]/85 border border-white/10 p-8 shadow-xl flex flex-col">
          {selectedAlert ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">{selectedAlert.title}</h2>
                <p className="text-sm text-blue-300/60">Source: {selectedAlert.source}</p>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 mb-8 flex-grow">
                <span className="text-[10px] font-bold tracking-widest text-blue-200/60 uppercase block mb-3">INCIDENT DESCRIPTION</span>
                <p className="text-sm text-blue-100/90 leading-relaxed">
                  {selectedAlert.description}
                </p>
              </div>

              <div className="mt-auto border-t border-white/10 pt-6">
                <span className="text-[10px] font-bold tracking-widest text-blue-200/60 uppercase block mb-3">RESOLUTION ACTIONS</span>
                <button 
                  onClick={resolveAlert}
                  className="w-full py-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  RESOLVE / DISMISS ALERT
                </button>
              </div>
            </>
          ) : (
             <div className="h-full flex flex-col items-center justify-center opacity-60">
                <svg aria-hidden="true" className="w-12 h-12 text-emerald-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-300 font-bold">ALL ALERTS RESOLVED</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AlertCenterPage() {
  return (
    <WarningStateProvider>
      <AlertCenterContent />
    </WarningStateProvider>
  );
}