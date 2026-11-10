'use client';
import { useTelemetry } from '@/hooks/useTelemetry';
import { CrewProfile } from "@/components/crew-profile/CrewProfile";

export default function CrewProfileIndexPage() {
    // Pulls live data from your FastAPI WebSocket backend
    const { telemetry, isConnected } = useTelemetry(); 

    return (
        <div>
            <span className={isConnected ? "text-green-400" : "text-red-400"}>
                {isConnected ? "● LIVE" : "■ OFFLINE"}
            </span>
            {/* Pass live telemetry data into Mandy's component */}
            {/* @ts-ignore */}
          <CrewProfile telemetryData={telemetry} />
        </div>
    );
}