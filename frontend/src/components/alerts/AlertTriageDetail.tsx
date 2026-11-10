import Link from "next/link";
import { PageHeading } from "@/components/ui/PageHeading";
import { Panel } from "@/components/ui/Panel";
import type { MissionAlert } from "@/data/alerts";

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="triage-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AlertTriageDetail({ alert }: { alert?: MissionAlert }) {
  const crewProfileHref = alert?.relatedCrewKey
    ? `/crew-profile/${alert.relatedCrewKey}`
    : "/crew-profile";

  return (
    <>
      <div className="detail-page-heading-row">
        <PageHeading
          title="Alert Triage Detail"
          description={alert ? "Review the selected alert record and its reported context" : "No alert selected · alert event details await backend data"}
          badge={alert ? "DEMONSTRATION · NOT LIVE" : "NO ALERT SELECTED"}
        />
        <Link className="detail-back-link" href="/">← MISSION OVERVIEW</Link>
      </div>

      {!alert ? (
        <Panel className="detail-empty-state" role="status">
          <h2>NO ALERT DATA</h2>
          <p>Select an alert from Mission Overview when one is available. No alert record or medical event has been reported.</p>
          <Link className="action-link" href="/">RETURN TO MISSION OVERVIEW →</Link>
        </Panel>
      ) : (
        <>
          <div className="triage-layout">
            <Panel className="triage-main-panel">
              <div className="triage-card-header">
                <span className="state-label state-red">CRITICAL · UI DEMONSTRATION</span>
                <span className="triage-alert-id">{alert.id.toUpperCase()}</span>
              </div>
              <h2>{alert.title}</h2>
              <p className="triage-description">{alert.description}</p>
              <div className="triage-details-grid">
                <DetailField label="SEVERITY" value={alert.severity} />
                <DetailField label="ALERT STATUS" value={alert.status} />
                <DetailField label="RELATED CREW MEMBER" value="ID NOT REPORTED" />
                <DetailField label="TIMESTAMP" value={alert.timestamp} />
              </div>
              <div className="triage-section">
                <h3>SUPPORTING BIOMETRIC SIGNALS</h3>
                <p>{alert.supportingSignals}</p>
              </div>
              <div className="triage-section">
                <h3>SUGGESTED REVIEW STEPS</h3>
                <p>{alert.reviewSteps}</p>
              </div>
            </Panel>

            <div className="triage-side-column">
              <Panel>
                <h2>ALERT RECORD</h2>
                <p className="panel-subtitle">Frontend warning demo · no live alert payload</p>
                <div className="triage-record-state"><span className="status-dot status-dot-red" aria-hidden="true" />{alert.warningState} · DEMONSTRATION</div>
                <p className="triage-disclaimer">This screen contains no diagnosis or medical recommendation.</p>
              </Panel>
              <Panel>
                <h2>RELATED PAGES</h2>
                <p className="panel-subtitle">Crew association was not reported for this demo state.</p>
                <Link className="action-link" href={crewProfileHref}>OPEN CREW PROFILE · ID NOT REPORTED →</Link>
                <Link className="action-link" href="/biometric-trends">OPEN BIOMETRIC TRENDS →</Link>
              </Panel>
            </div>
          </div>
          <div className="detail-actions">
            <Link className="action-link action-link-subtle" href="/">BACK TO MISSION OVERVIEW</Link>
          </div>
        </>
      )}
    </>
  );
}
