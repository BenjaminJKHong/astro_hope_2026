import type { MissionTelemetry, TelemetryPoint } from "@/types/telemetry";

// Static phase: no measurements have been received. Keep these arrays empty;
// future adapters can provide backend measurements without changing the chart UI.
export const missionTelemetry: MissionTelemetry = {
  sourceState: "UNKNOWN",
  heartRate: [],
  spo2: [],
};

export const emptyTelemetrySeries: TelemetryPoint[] = [];
