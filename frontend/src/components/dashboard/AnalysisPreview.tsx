import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import type { AiSurgeonLog, SurgeonTriageLevel, TelemetryMessage } from "@/types/telemetry";

const triageLevels: SurgeonTriageLevel[] = ["GREEN", "AMBER", "RED"];

function parseSurgeonLog(value: string | null | undefined): AiSurgeonLog | "invalid" | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return "invalid";

    const log = parsed as Record<string, unknown>;
    return {
      agent: typeof log.agent === "string" ? log.agent : undefined,
      triage_level: triageLevels.includes(log.triage_level as SurgeonTriageLevel)
        ? log.triage_level as SurgeonTriageLevel
        : undefined,
      diagnosis: typeof log.diagnosis === "string" ? log.diagnosis : undefined,
      timestamp: typeof log.timestamp === "string" ? log.timestamp : undefined,
    };
  } catch {
    return "invalid";
  }
}

export function AnalysisPreview({ telemetry, isConnected = false }: { telemetry?: TelemetryMessage | null; isConnected?: boolean }) {
  const log = parseSurgeonLog(telemetry?.ai_surgeon_log);
  const hasLog = log !== null && log !== "invalid";

  return (
    <Panel className="analysis-preview">
      <div className="analysis-preview-heading">
        <h2>AI ANALYSIS PREVIEW</h2>
        <Link href="/ai-surgeon">OPEN FEED →</Link>
      </div>
      <p className="analysis-source">BACKEND FIELD · ai_surgeon_log</p>
      {hasLog ? (
        <div className="analysis-log" aria-live="polite">
          <div className="analysis-log-meta">
            <strong>{log.agent || "AGENT NOT REPORTED"}</strong>
            <span className={`triage-badge${log.triage_level ? ` triage-${log.triage_level.toLowerCase()}` : " triage-unknown"}`}>
              {log.triage_level || "TRIAGE NOT REPORTED"}
            </span>
          </div>
          <p className="analysis-diagnosis">{log.diagnosis || "Diagnosis not reported."}</p>
          <small className="analysis-sync-stamp">SYNC STAMP · {log.timestamp || "NOT REPORTED"}</small>
        </div>
      ) : (
        <div className="analysis-log" role="status" aria-live="polite">
          <strong>{log === "invalid" ? "Invalid analysis log" : isConnected ? "No analysis available" : "Telemetry disconnected"}</strong>
          <p>{log === "invalid" ? "The latest analysis log could not be read." : isConnected ? "Waiting for the first backend analysis log." : "Waiting for the telemetry connection to resume."}</p>
          <small className="analysis-sync-stamp">SYNC STAMP · NOT REPORTED</small>
        </div>
      )}
    </Panel>
  );
}
