"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { WarningStateProvider } from "@/components/warnings/WarningStateProvider";

function getStatusStyle(status: string | undefined, isConnected: boolean) {
  if (!isConnected) return "text-slate-400 border-slate-700 bg-slate-900/50";
  const normalized = (status || "").toUpperCase();
  if (normalized === "NOMINAL" || normalized === "CONNECTED" || normalized === "VALID" || normalized === "ONLINE") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (normalized === "CRITICAL" || normalized === "RED" || normalized === "INVALID" || normalized === "OFFLINE") return "text-red-400 border-red-500/40 bg-red-500/10";
  if (normalized === "AMBER" || normalized === "DELAYED" || normalized === "STALE") return "text-amber-400 border-amber-500/40 bg-amber-500/10";
  return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
}

// SonarQube Fix: Extracted nested ternaries into dedicated helper functions
function getAiStatus(hasLog: boolean, connected: boolean) {
  if (hasLog) return "ONLINE";
  return connected ? "STANDBY" : "UNKNOWN";
}

function getDataQuality(connected: boolean, status?: string) {
  if (!connected) return "MISSING";
  return status === "CRITICAL" ? "DELAYED" : "VALID";
}

function SystemStatusContent() {
  const { telemetry, isConnected } = useTelemetry();
  const [rebooting, setRebooting] = useState(false);

  const backendStatus = isConnected ? "CONNECTED" : "OFFLINE";
  const wsStatus = isConnected ? "CONNECTED" : "WAITING FOR DATA";
  const aiStatus = getAiStatus(Boolean(telemetry?.ai_surgeon_log), isConnected);
  const dataQuality = getDataQuality(isConnected, telemetry?.system_status);

  const allNominal = backendStatus === "CONNECTED" && wsStatus === "CONNECTED" && dataQuality === "VALID";

  const handleReboot = () => {
    setRebooting(true);
    setTimeout(() => setRebooting(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans pb-12">
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
            <span>DIAGNOSTICS & TELEMETRY PIPELINE</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">System Status</h1>
          <p className="text-blue-200/65 text-xs mt-1">Backend API, WebSocket, AI Inference, and Data Quality Status.</p>
        </div>
        <div className="flex gap-3">
          <div className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-widest border flex items-center gap-2 ${isConnected ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            {isConnected ? "UPLINK SYNCHRONIZED" : "UPLINK SEVERED"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-8 shadow-xl flex flex-col gap-5">
          <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase mb-2">INFRASTRUCTURE NODES</h2>
          
          <div className="flex justify-between items-center bg-slate-900/60 p-5 rounded-2xl border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">BACKEND API (FastAPI)</span>
              <span className="text-[10px] text-blue-200/50">Core data routing and authentication</span>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border ${getStatusStyle(backendStatus, true)}`}>
              {backendStatus}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-900/60 p-5 rounded-2xl border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">WEBSOCKET (Live Telemetry)</span>
              <span className="text-[10px] text-blue-200/50">Sub-second biometrics streaming</span>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border ${getStatusStyle(wsStatus, isConnected)}`}>
              {wsStatus}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-900/60 p-5 rounded-2xl border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">AI INFERENCE (LLaMA 3)</span>
              <span className="text-[10px] text-blue-200/50">Flight Surgeon generative triage pipeline</span>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border ${getStatusStyle(aiStatus, isConnected)}`}>
              {aiStatus}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-900/60 p-5 rounded-2xl border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">DATA QUALITY GATE</span>
              <span className="text-[10px] text-blue-200/50">Payload validation and packet freshness</span>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border ${getStatusStyle(dataQuality, isConnected)}`}>
              {dataQuality}
            </span>
          </div>
        </div>

        <div className={`rounded-3xl border p-8 shadow-xl flex flex-col transition-colors ${!allNominal ? "bg-red-950/20 border-red-500/30" : "bg-[#141b2d]/85 border-white/10"}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase">DIAGNOSTIC ASSISTANT</h2>
            {!allNominal && <svg aria-hidden="true" className="w-5 h-5 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-grow pr-2">
            {allNominal ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <svg aria-hidden="true" className="w-12 h-12 text-emerald-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-300 font-bold">ALL SYSTEMS NOMINAL</p>
                <p className="text-xs text-blue-200/60 mt-2">No corrective actions required.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-red-200/70 mb-2 font-bold tracking-wider uppercase border-b border-red-500/20 pb-2">Recommended Corrective Actions</p>
                
                {backendStatus === "OFFLINE" && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">1. Restore FastAPI Backend</span>
                    <p className="text-xs text-red-100/70 leading-relaxed">
                      Verify the local Python backend is running. Open a terminal, navigate to the `backend` directory, and execute: <code className="bg-slate-900 px-1 py-0.5 rounded text-red-300 font-mono text-[10px]">uvicorn main:app --reload</code>
                    </p>
                  </div>
                )}

                {wsStatus === "WAITING FOR DATA" && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">2. Initialize Telemetry Stream</span>
                    <p className="text-xs text-amber-100/70 leading-relaxed">
                      The socket is open, but no data is flowing. Ensure the backend telemetry simulator script is actively pushing payloads to the Redis pub/sub channel.
                    </p>
                  </div>
                )}

                {dataQuality === "DELAYED" && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">3. Clear Stale Cache</span>
                    <p className="text-xs text-amber-100/70 leading-relaxed">
                      Telemetry packets are arriving outside the 1000ms freshness window. Check for high CPU load on the host machine or flush the browser WebSocket cache.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button 
              onClick={handleReboot}
              disabled={rebooting}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-200 border border-slate-600 text-xs font-bold tracking-wider transition-all"
            >
              {rebooting ? "INITIATING DIAGNOSTIC REBOOT..." : "REBOOT DIAGNOSTIC SEQUENCE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SystemStatusPage() {
  return (
    <WarningStateProvider>
      <SystemStatusContent />
    </WarningStateProvider>
  );
}