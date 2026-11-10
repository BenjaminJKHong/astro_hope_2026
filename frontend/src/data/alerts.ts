export type MissionAlert = {
  id: string;
  title: string;
  description: string;
  warningState: "CRITICAL";
  severity: "NOT REPORTED";
  status: "DEMONSTRATION · NOT A LIVE ALERT";
  relatedCrewKey: null;
  timestamp: "NOT REPORTED";
  supportingSignals: "NOT REPORTED";
  reviewSteps: "NOT REPORTED";
};

export const criticalDemoAlert: MissionAlert = {
  id: "critical-demo",
  title: "CRITICAL WARNING DEMONSTRATION",
  description: "Medical event details are not reported. No diagnosis is provided.",
  warningState: "CRITICAL",
  severity: "NOT REPORTED",
  status: "DEMONSTRATION · NOT A LIVE ALERT",
  relatedCrewKey: null,
  timestamp: "NOT REPORTED",
  supportingSignals: "NOT REPORTED",
  reviewSteps: "NOT REPORTED",
};

export function getMissionAlert(id: string) {
  return id === criticalDemoAlert.id ? criticalDemoAlert : undefined;
}
