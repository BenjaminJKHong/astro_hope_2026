import { PageHeading } from "@/components/ui/PageHeading";
import { Panel } from "@/components/ui/Panel";
import { dataQualityStates, serviceStatuses, serviceStateKey } from "@/data/system-status";
import { ServiceStatusCard } from "./ServiceStatusCard";

export function SystemStatus() {
  return <>
    <PageHeading title="System Status" description="Backend API, WebSocket, telemetry, AI, ML and data quality status" badge="STATUS UNKNOWN" />
    <div className="service-grid">{serviceStatuses.map((service) => <ServiceStatusCard key={service.name} {...service} />)}</div>
    <div className="status-key-grid">
      <Panel className="status-key-panel"><h2>DATA QUALITY STATE KEY</h2><p className="panel-subtitle">Examples for missing, invalid or delayed telemetry</p><ul>{dataQualityStates.map((item) => <li key={item.name}><strong className={`state-label state-${item.tone}`}>{item.name}</strong><span>{item.detail}</span></li>)}</ul></Panel>
      <Panel className="status-key-panel"><h2>SERVICE STATUS STATE KEY</h2><p className="panel-subtitle">Status values are independent; WebSocket does not imply AI or ML health.</p><ul>{serviceStateKey.map((item) => <li key={item.name}><span>{item.description}</span><strong className={`state-label state-${item.tone}`}>{item.name}</strong></li>)}</ul></Panel>
    </div>
    <Panel className="status-rules"><h2>STATUS REPORTING RULES</h2><p className="panel-subtitle">No event history supplied · UTC timestamps will populate from backend data</p><ul><li>No service payload → UNKNOWN / NOT REPORTED</li><li>Telemetry may report CONNECTED, WAITING or STALE</li><li>AI and ML require independent service status</li><li>Data Quality remains UNKNOWN without validation output</li></ul></Panel>
  </>;
}
