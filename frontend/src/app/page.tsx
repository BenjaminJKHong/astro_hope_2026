'use client';

import { MissionOverview } from "@/components/dashboard/MissionOverview";
import { useTelemetry } from "@/hooks/useTelemetry";

export default function MissionOverviewPage() {
  const { telemetry, history, isConnected } = useTelemetry();
  const MissionComponent = MissionOverview as any;

  return (
    <MissionComponent 
      telemetry={telemetry} 
      history={history} 
      isConnected={isConnected} 
    />
  );
}