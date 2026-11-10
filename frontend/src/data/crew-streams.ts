export type CrewStreamState = "NOT CONNECTED" | "SIMULATED" | "UNKNOWN";

export const crewStreamPlaceholders = [
  {
    key: "unreported",
    label: "STREAM · ID NOT REPORTED",
    state: "NOT CONNECTED · WAITING FOR TELEMETRY",
    dataState: "NOT CONNECTED",
  },
  { key: "crew-02", label: "CREW MEMBER 02", state: "SIMULATED DATA", dataState: "SIMULATED" },
  { key: "crew-03", label: "CREW MEMBER 03", state: "SIMULATED DATA", dataState: "SIMULATED" },
  { key: "crew-04", label: "CREW MEMBER 04", state: "SIMULATED DATA", dataState: "SIMULATED" },
  { key: "crew-05", label: "CREW MEMBER 05", state: "SIMULATED DATA", dataState: "SIMULATED" },
  { key: "crew-06", label: "CREW MEMBER 06", state: "SIMULATED DATA", dataState: "SIMULATED" },
] as const satisfies readonly {
  key: string;
  label: string;
  state: string;
  dataState: CrewStreamState;
}[];

export type CrewStream = (typeof crewStreamPlaceholders)[number];

export function getCrewStream(key: string) {
  return crewStreamPlaceholders.find((stream) => stream.key === key);
}

export const simulatedCrewStreamCount = crewStreamPlaceholders.filter(
  (stream) => stream.dataState === "SIMULATED",
).length;
