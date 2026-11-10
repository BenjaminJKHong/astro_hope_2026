export type ServiceState =
  | "CONNECTED"
  | "WAITING FOR DATA"
  | "DISCONNECTED"
  | "STALE"
  | "UNKNOWN"
  | "NOT REPORTED";

export const serviceStatuses: { name: string; state: ServiceState; detail: string }[] = [
  { name: "BACKEND API", state: "UNKNOWN", detail: "NOT REPORTED" },
  { name: "WEBSOCKET", state: "UNKNOWN", detail: "NOT REPORTED" },
  { name: "LIVE TELEMETRY", state: "WAITING FOR DATA", detail: "Awaiting first packet" },
  { name: "AI SERVICE", state: "UNKNOWN", detail: "NOT REPORTED" },
  { name: "ML SERVICE", state: "UNKNOWN", detail: "NOT REPORTED" },
  { name: "DATA QUALITY", state: "UNKNOWN", detail: "Awaiting validation" },
];

export const serviceStateTone: Record<ServiceState, "green" | "amber" | "red" | "muted"> = {
  CONNECTED: "green",
  "WAITING FOR DATA": "amber",
  DISCONNECTED: "red",
  STALE: "amber",
  UNKNOWN: "muted",
  "NOT REPORTED": "muted",
};

export const dataQualityStates = [
  { name: "VALID", tone: "green", detail: "Within freshness window; usable for monitoring." },
  { name: "DELAYED", tone: "amber", detail: "Received outside configured freshness window." },
  { name: "INVALID", tone: "red", detail: "Fails validation; excluded from normal status." },
  { name: "MISSING / OFFLINE", tone: "muted", detail: "No valid packet; show OFFLINE / NO DATA." },
];

export const serviceStateKey = [
  { name: "CONNECTED", description: "Connection explicitly confirmed by a status payload.", tone: "green" },
  { name: "WAITING FOR DATA", description: "First telemetry payload has not been received.", tone: "amber" },
  { name: "DISCONNECTED", description: "Connection explicitly reported unavailable.", tone: "red" },
  { name: "STALE", description: "Last received packet exceeded the freshness window.", tone: "amber" },
  { name: "UNKNOWN", description: "No service state has been confirmed.", tone: "muted" },
  { name: "NOT REPORTED", description: "Service state was not included in the payload.", tone: "muted" },
];
