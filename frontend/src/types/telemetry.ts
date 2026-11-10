export type TelemetryPoint = {
  timestamp: string;
  value: number;
};

export type TelemetrySourceState = "LIVE" | "SIMULATED" | "NOT CONNECTED" | "DISCONNECTED" | "UNKNOWN";

export type MissionTelemetry = {
  sourceState: TelemetrySourceState;
  heartRate: TelemetryPoint[];
  spo2: TelemetryPoint[];
};
