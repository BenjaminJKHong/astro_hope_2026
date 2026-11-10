"use client";

import Link from "next/link";
import { PageHeading } from "@/components/ui/PageHeading";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { WarningDemoControl } from "@/components/warnings/WarningDemoControl";
import { CriticalWarningBanner } from "@/components/warnings/CriticalWarningBanner";
import { useWarningState } from "@/components/warnings/WarningStateProvider";
import { missionTelemetry } from "@/data/telemetry";
import { simulatedCrewStreamCount } from "@/data/crew-streams";
import { TelemetryChart } from "./TelemetryChart";
import { RadiationWidget } from "./RadiationWidget";
import { AlertsPanel } from "./AlertsPanel";
import { AnalysisPreview } from "./AnalysisPreview";
import { CrewStreams } from "./CrewStreams";

// Define the incoming WebSocket props
interface MissionOverviewProps {
  telemetry?: {
    timestamp?: string;
    heart_rate?: number;
    spo2?: number;
    system_status?: string;
    active_alerts?: string[];
    ai_surgeon_log?: string;
  } | null;
  history?: any[];
  isConnected?: boolean;
}

export function MissionOverview({ 
  telemetry, 
  history = [], 
  isConnected = false 
}: MissionOverviewProps) {
  const { state } = useWarningState();
  
  // Trigger critical mode if the backend reports CRITICAL or demo warning mode is active
  const critical = state === "CRITICAL" || telemetry?.system_status === "CRITICAL";
  const trendsHref = "/biometric-trends";

  // Map WebSocket history array into the shape expected by Mandy's TelemetryChart
  const liveHeartRateData = history.length > 0
    ? history.map(item => ({ timestamp: item.timestamp || "", value: item.heart_rate || 0 }))
    : missionTelemetry.heartRate;

  const liveSpo2Data = history.length > 0
    ? history.map(item => ({ timestamp: item.timestamp || "", value: item.spo2 || 0 }))
    : missionTelemetry.spo2;

  return <>
    <div className="dashboard-heading-row">
      <PageHeading
        title="Mission Overview"
        description="Crew health, live stream state and incoming medical alerts at a glance"
        badge={critical ? "CRITICAL MODE" : isConnected ? "LIVE TELEMETRY" : "WAITING FOR TELEMETRY"}
      />
      <WarningDemoControl />
      <div className="dashboard-meta" aria-label="Telemetry reporting status">
        <span>
          <i className={`status-dot ${isConnected ? "status-dot-green" : "status-dot-amber"}`} aria-hidden="true" />
          WEBSOCKET · {isConnected ? "CONNECTED" : "OFFLINE"}
        </span>
        <span>LAST UPDATED · {telemetry?.timestamp || "NOT REPORTED"}</span>
        <span>DEMO STREAMS · {simulatedCrewStreamCount} SIMULATED</span>
        <Link href={trendsHref}>VIEW ALL TRENDS →</Link>
      </div>
    </div>
    <CriticalWarningBanner />
    <div className="summary-grid">
      <SummaryCard 
        label="CREW STREAMS" 
        value={isConnected ? "1 LIVE" : "—"} 
        detail={isConnected ? "ACTIVE STREAM" : "NOT REPORTED"} 
        note={isConnected ? "Subject 04-A active" : "Waiting for telemetry"} 
      />
      <SummaryCard 
        label="HEART RATE" 
        value={telemetry?.heart_rate ? `${telemetry.heart_rate}` : "—"} 
        detail={critical ? "CRITICAL ALERT" : isConnected ? "BPM · LIVE" : "BPM · WAITING"} 
        note={telemetry?.heart_rate ? `Current reading: ${telemetry.heart_rate} BPM` : "No measurement received"} 
        tone={critical ? "red" : "green"} 
        critical={critical} 
      />
      <SummaryCard 
        label="SpO₂" 
        value={telemetry?.spo2 ? `${telemetry.spo2}%` : "—"} 
        detail={critical ? "CRITICAL ALERT" : isConnected ? "% · LIVE" : "% · WAITING"} 
        note={telemetry?.spo2 ? `Current reading: ${telemetry.spo2}%` : "No measurement received"} 
        tone={critical ? "red" : "amber"} 
        critical={critical} 
      />
      <SummaryCard 
        label="BLOOD PRESSURE" 
        value="118/76" 
        detail={critical ? "CRITICAL · DEMO" : "mmHg · NOMINAL"} 
        note="Baseline reference" 
        tone={critical ? "red" : "amber"} 
        critical={critical} 
      />
    </div>
    <div className="overview-chart-grid">
      <Link className="chart-navigation-link" href={`${trendsHref}?metric=heartRate`} aria-label="Open heart rate biometric trends">
        <TelemetryChart 
          title="HEART RATE" 
          unit="BPM" 
          data={liveHeartRateData} 
          sourceState={isConnected ? "LIVE" : missionTelemetry.sourceState} 
          color="#35d07f" 
          critical={critical} 
        />
      </Link>
      <Link className="chart-navigation-link" href={`${trendsHref}?metric=spo2`} aria-label="Open SpO₂ biometric trends">
        <TelemetryChart 
          title="SpO₂" 
          unit="%" 
          data={liveSpo2Data} 
          sourceState={isConnected ? "LIVE" : missionTelemetry.sourceState} 
          color="#f5b942" 
          critical={critical} 
        />
      </Link>
      <RadiationWidget critical={critical} />
    </div>
    <div className="overview-info-grid">
      <AlertsPanel critical={critical} />
      {/* Pass live telemetry to the AI Flight Surgeon Preview card */}
      {/* @ts-ignore */}
      <AnalysisPreview telemetry={telemetry} />
    </div>
    <CrewStreams />
  </>;
}