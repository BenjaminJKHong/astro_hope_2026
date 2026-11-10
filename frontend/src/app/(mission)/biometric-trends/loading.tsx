import { PageHeading } from "@/components/ui/PageHeading";
import { Panel } from "@/components/ui/Panel";

export default function BiometricTrendsLoading() {
  return <>
    <PageHeading title="Biometric Trends" description="Historical biometric signals · charts show only measurements received" badge="WAITING FOR TELEMETRY" />
    <Panel className="detail-empty-state" role="status">
      <h2>LOADING TREND VIEW</h2>
      <p>Waiting for the current biometric trend selection.</p>
    </Panel>
  </>;
}
