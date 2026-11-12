"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWarningState } from "@/components/warnings/WarningStateProvider";
import { useCrewRoster } from "@/hooks/useCrewRoster";
import { TelemetryChart } from "./TelemetryChart";
import { RadiationWidget } from "./RadiationWidget";
import { AnalysisPreview } from "./AnalysisPreview";
import type { TelemetryMessage } from "@/types/telemetry";

type MissionOverviewProps = Readonly<{
  telemetry?: TelemetryMessage | null;
  history?: TelemetryMessage[];
  isConnected?: boolean;
}>;

export function MissionOverview({
  telemetry,
  isConnected = false,
}: MissionOverviewProps) {
  const { state } = useWarningState();
  const baseCritical =
    state === "CRITICAL" ||
    telemetry?.system_status === "CRITICAL" ||
    telemetry?.system_status === "RED";
  const caution =
    telemetry?.system_status === "AMBER" ||
    telemetry?.system_status === "YELLOW";

  const { crew, hrHistory, spo2History } = useCrewRoster(
    telemetry,
    baseCritical
  );

  const anyCrewCritical = baseCritical || crew.some((m) => m.isCritical);

  // VOICE ALARM SYSTEM
  useEffect(() => {
    if (!anyCrewCritical && !caution) {
      window.speechSynthesis.cancel();
      return;
    }

    const alertPhrase = anyCrewCritical
      ? "Warning. Warning."
      : "Caution. Caution.";

    const triggerVoiceAlert = () => {
      if (!window.speechSynthesis.speaking) {
        const utterance = new SpeechSynthesisUtterance(alertPhrase);
        utterance.rate = 1.1;
        utterance.pitch = anyCrewCritical ? 1.2 : 1.0;
        window.speechSynthesis.speak(utterance);
      }
    };

    triggerVoiceAlert();
    const interval = setInterval(triggerVoiceAlert, 3500);

    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [anyCrewCritical, caution]);

  return (
    <div className="w-full flex flex-col gap-8 text-white font-sans relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .floating-icon { animation: float 5s ease-in-out infinite; }
        .floating-icon-delayed { animation: float 5s ease-in-out 2.5s infinite; }
        
        .friendly-panel {
          background: rgba(20, 27, 45, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.4);
          border-radius: 24px; 
        }
        
        .critical-pulse {
          background: rgba(65, 16, 20, 0.88);
          border-color: rgba(239, 68, 68, 0.65);
          box-shadow: 0 0 28px rgba(239, 68, 68, 0.28);
          animation: gentle-pulse 2s infinite;
        }

        @keyframes gentle-pulse {
          0%, 100% { border-color: rgba(239, 68, 68, 0.4); }
          50% { border-color: rgba(239, 68, 68, 0.9); }
        }

        .readable-prose * {
          font-size: 1.05rem !important;
          line-height: 1.7 !important;
          letter-spacing: 0.02em;
        }
        .readable-prose h2 {
          font-size: 1.2rem !important;
          margin-bottom: 1rem !important;
        }
      `,
        }}
      />

      {/* 1. HEADER */}
      <div className="friendly-panel px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">
            Astropulse Command
          </h1>
          <p className="text-blue-200/70 mt-1 text-sm font-medium">
            Orbital Telemetry & Multi-Crew Bio-Monitoring
          </p>
        </div>
        <div
          className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest flex items-center gap-3 shadow-lg ${
            isConnected
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-500"
            }`}
          />
          {isConnected ? "UPLINK ACTIVE" : "SIGNAL LOST"}
        </div>
      </div>

      {/* 2. TOP ROW: PRIMARY VITALS METRICS */}
      <div className="grid grid-cols-4 gap-6">
        {/* Heart Rate */}
        <div
          className={`friendly-panel p-6 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[160px] ${
            anyCrewCritical ? "critical-pulse" : ""
          }`}
        >
          <svg
            aria-hidden="true"
            className="absolute -right-2 -bottom-2 w-28 h-28 text-red-500/10 floating-icon"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <div className="relative z-10 w-full flex justify-between items-center mb-4">
            <h2 className="text-blue-200/60 text-xs font-bold tracking-widest">
              HEART RATE
            </h2>
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <span
              className={`text-5xl font-bold ${
                anyCrewCritical ? "text-red-400" : "text-white"
              }`}
            >
              {telemetry?.heart_rate || "—"}
            </span>
            <span className="text-blue-200/50 text-sm font-medium">BPM</span>
          </div>
        </div>

        {/* SpO2 */}
        <div
          className={`friendly-panel p-6 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[160px] ${
            anyCrewCritical ? "critical-pulse" : ""
          }`}
        >
          <svg
            aria-hidden="true"
            className="absolute -left-4 -bottom-4 w-28 h-28 text-blue-400/10 floating-icon-delayed"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
          </svg>
          <div className="relative z-10 w-full flex justify-between items-center mb-4">
            <h2 className="text-blue-200/60 text-xs font-bold tracking-widest">
              BLOOD OXYGEN
            </h2>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <span
              className={`text-5xl font-bold ${
                anyCrewCritical ? "text-red-400" : "text-white"
              }`}
            >
              {telemetry?.spo2 || "—"}
            </span>
            <span className="text-blue-200/50 text-sm font-medium">%</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="friendly-panel p-6 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[160px]">
          <svg
            aria-hidden="true"
            className="absolute -right-2 -bottom-2 w-28 h-28 text-amber-500/10 floating-icon"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            viewBox="0 0 24 24"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <div className="relative z-10 w-full flex justify-between items-center mb-4">
            <h2 className="text-blue-200/60 text-xs font-bold tracking-widest">
              BLOOD PRESSURE
            </h2>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          <div className="relative z-10 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">
              118
              <span className="text-2xl text-blue-200/70 font-medium">/76</span>
            </span>
            <span className="text-blue-200/50 text-sm font-medium">mmHg</span>
          </div>
        </div>

        {/* System Status */}
        <div
          className={`friendly-panel p-6 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[160px] ${
            anyCrewCritical ? "critical-pulse" : ""
          }`}
        >
          <div className="relative z-10 w-full flex justify-between items-center mb-4">
            <h2 className="text-blue-200/60 text-xs font-bold tracking-widest">
              SYSTEM STATUS
            </h2>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                anyCrewCritical ? "bg-red-500/20" : "bg-green-500/20"
              }`}
            >
              <svg
                aria-hidden="true"
                className={`w-4 h-4 ${
                  anyCrewCritical ? "text-red-400" : "text-green-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <span
              className={`text-3xl font-extrabold tracking-widest uppercase ${
                anyCrewCritical
                  ? "text-red-400 animate-pulse"
                  : "text-green-400"
              }`}
            >
              {anyCrewCritical ? "CRITICAL" : telemetry?.system_status || "NOMINAL"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MULTI-CREW LINE CHARTS (All Station Members, Critical Highlighted) */}
      <div className="grid grid-cols-2 gap-6">
        <div className="friendly-panel p-6">
          <TelemetryChart
            title="ALL CREW · HEART RATE TREND"
            unit="BPM"
            data={hrHistory}
            crew={crew}
          />
        </div>
        <div className="friendly-panel p-6">
          <TelemetryChart
            title="ALL CREW · SpO₂ TREND"
            unit="%"
            data={spo2History}
            crew={crew}
          />
        </div>
      </div>

      {/* 4. LIVE STATION CREW VITALS (Only Critical Members Highlighted) */}
      <div className="friendly-panel p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <div>
            <h2 className="text-blue-200/70 text-xs font-bold tracking-widest uppercase">
              LIVE STATION CREW VITALS ({crew.length} ONBOARD)
            </h2>
            <p className="text-xs text-blue-200/45 mt-1">
              Real-time biometric feed across all active astronauts · Critical
              anomalies auto-highlighted
            </p>
          </div>
          <Link
            href="/crew-profile"
            className="px-5 py-2.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-bold tracking-wider transition-all"
          >
            + REGISTER / MANAGE CREW →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {crew.map((member) => (
            <div
              key={member.id}
              className={`rounded-2xl p-5 border transition-all ${
                member.isCritical
                  ? "critical-pulse"
                  : "bg-slate-900/50 border-white/10"
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-3">
                <div>
                  <span className="text-xs font-mono text-blue-300/70">
                    UNIT {member.callsign}
                  </span>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs text-blue-200/50">{member.role}</p>
                </div>

                {member.isCritical ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider bg-red-500/30 text-red-200 border border-red-400/60 animate-pulse">
                    CRITICAL
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider bg-white/5 text-blue-200/60 border border-white/10">
                    NOMINAL
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div>
                  <span className="text-[11px] text-blue-200/50 block">
                    HEART RATE
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      member.isCritical ? "text-red-300" : "text-white"
                    }`}
                  >
                    {member.heartRate}{" "}
                    <span className="text-xs font-normal text-blue-200/50">
                      BPM
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-200/50 block">
                    SpO₂
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      member.isCritical ? "text-red-300" : "text-white"
                    }`}
                  >
                    {member.spo2}
                    <span className="text-xs font-normal text-blue-200/50">
                      %
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. BOTTOM ROW: AI & RADIATION */}
      <div className="grid grid-cols-2 gap-6">
        <div className="friendly-panel p-8 readable-prose flex flex-col justify-center border-t-4 border-t-indigo-500/50">
          <AnalysisPreview telemetry={telemetry} isConnected={isConnected} />
        </div>
        <div className="friendly-panel p-8 readable-prose flex flex-col justify-center border-t-4 border-t-purple-500/50">
          <RadiationWidget critical={anyCrewCritical} />
        </div>
      </div>
    </div>
  );
}