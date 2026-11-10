import Link from "next/link";
import { Panel } from "@/components/ui/Panel";

export function AlertsPanel({ critical = false }: { critical?: boolean }) {
  return (
    <Panel className={`alerts-panel${critical ? " alerts-panel-critical" : ""}`}>
      <h2>RECENT HEALTH ALERTS</h2>
      {critical ? (
        <Link
          className="critical-alert-card critical-alert-link"
          href="/alert-triage/critical-demo"
          aria-label="Open critical warning demonstration triage detail"
        >
          <span className="warning-symbol" aria-hidden="true">⚠</span>
          <span className="critical-alert-copy">
            <strong>CRITICAL · DEMONSTRATION STATE</strong>
            <span>Medical event details are not reported. No diagnosis is provided.</span>
            <small>MOCK TRIGGER · NOT A LIVE ALERT</small>
            <span className="critical-alert-open">OPEN TRIAGE DETAIL →</span>
          </span>
        </Link>
      ) : (
        <>
          <p className="panel-subtitle">No health alert data has been received</p>
          <div className="empty-alert" role="status">
            <strong>NO ALERT DATA</strong>
            <span>Waiting for backend health alerts</span>
          </div>
        </>
      )}
    </Panel>
  );
}
