'use client';

import { MissionOverview } from "@/components/dashboard/MissionOverview";
import { useTelemetry } from "@/hooks/useTelemetry";

export default function MissionOverviewPage() {
  // 1. Get live telemetry packet, 30s history array, and connection status
  const { telemetry, history, isConnected } = useTelemetry();

  // Bypass TypeScript prop checks for rapid hackathon development
  const MissionComponent = MissionOverview as any;

  return (
    <MissionComponent 
      telemetry={telemetry} 
      history={history} 
      isConnected={isConnected} 
    />
  );
}