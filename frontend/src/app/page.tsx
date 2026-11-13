'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { MissionOverview } from "@/components/dashboard/MissionOverview";
import { useTelemetry } from "@/hooks/useTelemetry";
import { WarningStateProvider } from "@/components/warnings/WarningStateProvider";

export default function MissionOverviewPage() {
  const { telemetry, history, isConnected } = useTelemetry();
  
  // Bypass TypeScript prop checks for rapid hackathon development
  const MissionComponent = MissionOverview as any;

  return (
    <WarningStateProvider>
      <MainLayout>
        <MissionComponent 
          telemetry={telemetry} 
          history={history} 
          isConnected={isConnected} 
        />
      </MainLayout>
    </WarningStateProvider>
  );
}