import Link from "next/link";
import { Panel } from "@/components/ui/Panel";

export function AnalysisPreview() {
  return (
    <Panel className="analysis-preview">
      <div className="analysis-preview-heading">
        <h2>AI ANALYSIS PREVIEW</h2>
        <Link href="/ai-surgeon">OPEN FEED →</Link>
      </div>
      <p className="analysis-source">BACKEND FIELD · ai_surgeon_log</p>
      <strong>No analysis available</strong>
      <p>Waiting for the first backend analysis log.</p>
      <b>Incoming analysis text will be shown verbatim.</b>
      <small>No diagnosis or recommendation received</small>
    </Panel>
  );
}
