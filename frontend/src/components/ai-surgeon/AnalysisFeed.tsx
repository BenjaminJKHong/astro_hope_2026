import { PageHeading } from "@/components/ui/PageHeading";
import { Panel } from "@/components/ui/Panel";

const emptyFeed = { latest: "No analysis available. Waiting for the first backend log.", previous: "No previous analysis logs are available." };

export function AnalysisFeed() {
  return <>
    <PageHeading title="AI Flight Surgeon" description="Live analysis feed · actual backend text only · no analysis received yet" badge="FEED · WAITING" />
    <div className="surgeon-stats">
      <Stat label="UPDATE CADENCE" value="UNKNOWN" detail="Not reported" tone="amber" />
      <Stat label="HISTORY MODE" value="ROLL" detail="Scrollable newest-first history" tone="cyan" />
      <Stat label="FEED STATUS" value="WAIT" detail="Waiting for first log" tone="amber" />
      <Stat label="AI SERVICE" value="UNKNOWN" detail="Status not reported" tone="amber" />
    </div>
    <div className="feed-layout">
      <Panel className="analysis-feed"><h2>LIVE ANALYSIS FEED</h2><p className="panel-subtitle">Backend field ai_surgeon_log · newest first · update cadence not reported</p>
        <div className="feed-history" aria-live="polite">
          <article className="feed-entry"><h3>LATEST ANALYSIS · ai_surgeon_log</h3><strong>{emptyFeed.latest}</strong><p>When a log arrives, the backend string is displayed here verbatim.</p><time>NOT REPORTED</time></article>
          <article className="feed-entry feed-entry-previous"><h3>PREVIOUS ANALYSIS LOGS</h3><strong>{emptyFeed.previous}</strong><p>Entries appear here after backend logs arrive.</p></article>
        </div>
      </Panel>
      <div className="feed-side"><Panel><h2>FEED STATUS</h2><p className="panel-subtitle">Payload and connection states shown independently</p><ul className="feed-state-list"><li><span className="crew-dot dot-amber"/>Log stream<strong>UNKNOWN · not reported</strong></li><li><span className="crew-dot dot-amber"/>Update cadence<strong className="tone-text-amber">UNKNOWN · not reported</strong></li><li><span className="crew-dot dot-cyan"/>History<strong className="tone-text-cyan">Scrollable · rolling</strong></li><li><span className="crew-dot dot-cyan"/>New log indicator<strong>On payload arrival</strong></li></ul></Panel>
        <Panel className="feed-states"><h2>FEED STATES</h2><p><b>EMPTY</b> No analysis received yet.</p><p><b>DISCONNECTED</b> Backend log stream unavailable.</p><p><b>NEW LOG</b> Brief visual highlight when ai_surgeon_log arrives.</p><strong>The backend string is displayed verbatim; no generated analysis is added.</strong></Panel>
      </div>
    </div>
  </>;
}

function Stat({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "cyan" | "amber" }) {
  return <article className="panel surgeon-stat"><p className="eyebrow">{label}</p><div><strong className={`tone-text-${tone}`}>{value}</strong><span>{detail}</span></div></article>;
}
