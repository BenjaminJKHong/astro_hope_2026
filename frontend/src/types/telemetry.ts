export type TelemetryPoint = {
  timestamp: string;
  value: number;
};

export type TelemetrySourceState = "LIVE" | "SIMULATED" | "NOT CONNECTED" | "DISCONNECTED" | "UNKNOWN";

export type SurgeonTriageLevel = "GREEN" | "AMBER" | "RED";

export type AiSurgeonLog = {
  agent?: string;
  triage_level?: SurgeonTriageLevel;
  diagnosis?: string;
  timestamp?: string;
};

export type TelemetryMessage = {
  timestamp?: string;
  heart_rate?: number;
  spo2?: number;
  system_status?: string;
  active_alerts?: string[];
  ai_surgeon_log?: string | null;
};

export type MissionTelemetry = {
  sourceState: TelemetrySourceState;
  heartRate: TelemetryPoint[];
  spo2: TelemetryPoint[];
};
