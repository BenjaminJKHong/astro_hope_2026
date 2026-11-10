import Link from "next/link";
import { PageHeading } from "@/components/ui/PageHeading";
import { Panel } from "@/components/ui/Panel";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { TelemetryChart } from "@/components/dashboard/TelemetryChart";
import { missionTelemetry } from "@/data/telemetry";
import type { CrewStream } from "@/data/crew-streams";
import type { TelemetrySourceState } from "@/types/telemetry";

function getSourceState(crew: CrewStream): TelemetrySourceState {
  if (crew.dataState === "NOT CONNECTED") return "NOT CONNECTED";
  if (crew.dataState === "SIMULATED") return "SIMULATED";
  return "UNKNOWN";
}

export function CrewProfile({ crew }: { crew?: CrewStream }) {
  const sourceState = crew ? getSourceState(crew) : "UNKNOWN";

  return (
    <>
      <div className="detail-page-heading-row">
        <PageHeading
          title="Crew Biometric Profile"
          description={crew ? `Selected stream · ${crew.label}` : "Select a crew stream from Mission Overview to view its profile"}
          badge={crew?.dataState === "SIMULATED" ? "SIMULATED DATA" : crew?.dataState ?? "NO CREW SELECTED"}
        />
        <Link className="detail-back-link" href="/">← MISSION OVERVIEW</Link>
      </div>

      {!crew ? (
        <Panel className="detail-empty-state" role="status">
          <h2>NO CREW MEMBER SELECTED</h2>
          <p>Select a crew stream from the Mission Overview dashboard. Identity and biometric values will remain unreported until supplied.</p>
          <Link className="action-link" href="/">RETURN TO MISSION OVERVIEW →</Link>
        </Panel>
      ) : (
        <>
          <Panel className="crew-profile-banner">
            <span className="crew-profile-avatar" aria-hidden="true">—</span>
            <div className="crew-profile-identity">
              <p className="eyebrow">SELECTED CREW STREAM</p>
              <h2>{crew.label}</h2>
              <p>CREW ID · ID NOT REPORTED</p>
            </div>
            <div className="crew-profile-status">
              <span className={`data-state-badge ${crew.dataState === "SIMULATED" ? "state-amber" : "state-muted"}`}>
                {crew.state}
              </span>
              <span className="crew-profile-health">HEALTH STATUS · UNKNOWN</span>
            </div>
          </Panel>

          <div className="summary-grid profile-summary-grid">
            <SummaryCard size="compact" label="HEART RATE" value="—" detail="BPM" note="WAITING FOR TELEMETRY" tone="green" />
            <SummaryCard size="compact" label="SpO₂" value="—" detail="%" note="WAITING FOR TELEMETRY" tone="cyan" />
            <SummaryCard size="compact" label="BLOOD PRESSURE" value="—" detail="mmHg" note="NOT REPORTED" tone="cyan" />
            <SummaryCard size="compact" label="BODY TEMPERATURE" value="—" detail="°C" note="NOT REPORTED" tone="amber" />
            <SummaryCard size="compact" label="RADIATION · radiation_msv" value="—" detail="mSv" note="WAITING FOR TELEMETRY" tone="amber" />
          </div>

          <div className="profile-chart-grid">
            <TelemetryChart
              variant="trend"
              title="HEART RATE HISTORY"
              unit="BPM"
              data={missionTelemetry.heartRate}
              sourceState={sourceState}
              color="#32d6f5"
            />
            <TelemetryChart
              variant="trend"
              title="SpO₂ HISTORY"
              unit="%"
              data={missionTelemetry.spo2}
              sourceState={sourceState}
              color="#3b82f6"
            />
          </div>

          <div className="profile-detail-grid">
            <Panel className="profile-event-panel">
              <h2>HEALTH EVENT TIMELINE</h2>
              <p className="panel-subtitle">Chronological events · backend history not reported</p>
              <div className="detail-empty-inline"><strong>NO ALERT DATA</strong><span>Waiting for crew health alerts</span></div>
            </Panel>
            <Panel className="profile-assessment-panel">
              <h2>AI HEALTH ASSESSMENT</h2>
              <p className="panel-subtitle">No analysis received</p>
              <strong className="assessment-state">NOT REPORTED</strong>
              <p>No diagnosis or recommendation is available.</p>
              <span>AI ANALYSIS · UNKNOWN</span>
            </Panel>
          </div>

          <div className="detail-actions">
            <Link className="action-link" href={`/biometric-trends/${crew.key}`}>VIEW BIOMETRIC TRENDS →</Link>
            <Link className="action-link action-link-subtle" href="/">BACK TO MISSION OVERVIEW</Link>
          </div>
        </>
      )}
    </>
  );
}
