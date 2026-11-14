"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeading } from "@/components/ui/PageHeading";
import { Panel } from "@/components/ui/Panel";
import { TelemetryChart } from "@/components/dashboard/TelemetryChart";
import { crewStreamPlaceholders, getCrewStream } from "@/data/crew-streams";
import { emptyTelemetrySeries, missionTelemetry } from "@/data/telemetry";
import type { TelemetryPoint } from "@/types/telemetry";

const metrics = [
  { key: "heartRate", label: "HEART RATE", unit: "BPM", data: missionTelemetry.heartRate },
  { key: "spo2", label: "SpO₂", unit: "%", data: missionTelemetry.spo2 },
  { key: "bloodPressure", label: "BLOOD PRESSURE", unit: "mmHg", data: emptyTelemetrySeries },
  { key: "radiation_msv", label: "RADIATION · radiation_msv", unit: "mSv", data: emptyTelemetrySeries },
] satisfies { key: string; label: string; unit: string; data: TelemetryPoint[] }[];

const ranges = [
  { key: "1h", label: "LAST 1 HOUR" },
  { key: "6h", label: "LAST 6 HOURS" },
  { key: "24h", label: "LAST 24 HOURS" },
  { key: "7d", label: "LAST 7 DAYS" },
];

type BiometricTrendsProps = { initialCrewKey?: string };

export function BiometricTrends({ initialCrewKey }: BiometricTrendsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCrew = initialCrewKey ? getCrewStream(initialCrewKey) : undefined;
  const chartCrew: Parameters<typeof TelemetryChart>[0]["crew"] = (selectedCrew
    ? [selectedCrew]
    : crewStreamPlaceholders.flatMap(({ key }) => {
        const crew = getCrewStream(key);
        return crew ? [crew] : [];
      })) as unknown as Parameters<typeof TelemetryChart>[0]["crew"];
  const metricKey = searchParams.get("metric") ?? "all";
  const rangeKey = searchParams.get("range") ?? "24h";
  const selectedMetrics = metricKey === "all" ? metrics : metrics.filter((metric) => metric.key === metricKey);
  const selectedRange = ranges.find((range) => range.key === rangeKey) ?? ranges[2];

  function updateQuery(key: "metric" | "range", value: string, defaultValue: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  function updateCrew(key: string) {
    const query = searchParams.toString();
    const path = key === "all" ? "/biometric-trends" : `/biometric-trends/${key}`;
    router.push(`${path}${query ? `?${query}` : ""}`, { scroll: false });
  }

  const statusBadge = selectedCrew
    ? selectedCrew.dataState === "SIMULATED"
      ? "SIMULATED · NO MEASUREMENTS"
      : selectedCrew.state
    : "WAITING FOR TELEMETRY";

  return (
    <>
      <div className="detail-page-heading-row">
        <PageHeading
          title="Biometric Trends"
          description="Historical biometric signals · charts show only measurements received"
          badge={statusBadge}
        />
        <div className="detail-heading-actions">
          {selectedCrew ? (
            <Link className="detail-back-link" href={`/crew-profile/${selectedCrew.key}`}>OPEN CREW PROFILE →</Link>
          ) : (
            <Link className="detail-back-link" href="/crew-profile">CREW PROFILE →</Link>
          )}
          <Link className="detail-back-link" href="/">← MISSION OVERVIEW</Link>
        </div>
      </div>

      <Panel className="trend-filter-panel">
        <label className="trend-filter">
          <span>CREW</span>
          <select value={selectedCrew?.key ?? "all"} onChange={(event) => updateCrew(event.target.value)}>
            <option value="all">ALL CREW</option>
            {crewStreamPlaceholders.map((crew) => <option key={crew.key} value={crew.key}>{crew.label}</option>)}
          </select>
        </label>
        <label className="trend-filter">
          <span>DATE RANGE</span>
          <select value={selectedRange.key} onChange={(event) => updateQuery("range", event.target.value, "24h")}>
            {ranges.map((range) => <option key={range.key} value={range.key}>{range.label}</option>)}
          </select>
        </label>
        <label className="trend-filter">
          <span>MEASUREMENT</span>
          <select value={metricKey} onChange={(event) => updateQuery("metric", event.target.value, "all")}>
            <option value="all">ALL VITALS</option>
            {metrics.map((metric) => <option key={metric.key} value={metric.key}>{metric.label}</option>)}
          </select>
        </label>
        <span className="trend-source-badge"><i className="status-dot status-dot-amber" aria-hidden="true" />{statusBadge}</span>
      </Panel>

      <div className="trend-chart-grid">
        {selectedMetrics.length > 0 ? selectedMetrics.map((metric) => (
          <TelemetryChart
            key={metric.key}
            title={`${metric.label} TREND`}
            crew={chartCrew as Parameters<typeof TelemetryChart>[0]["crew"]}
            unit={metric.unit}
            data={metric.data}
          />
        )) : (
          <Panel className="detail-empty-state" role="status">
            <h2>METRIC NOT AVAILABLE</h2>
            <p>Select one of the displayed biometric measurements.</p>
          </Panel>
        )}
      </div>

      <Panel className="trend-quality-panel">
        <h2>ALERT &amp; DATA QUALITY SUMMARY</h2>
        <p className="panel-subtitle">{selectedRange.label} · no historical or validation data has been reported</p>
        <div className="trend-quality-grid">
          <div><span>ACTIVE ALERTS</span><strong>NOT REPORTED</strong></div>
          <div><span>ANOMALIES</span><strong>NOT REPORTED</strong></div>
          <div><span>CREW CONNECTION</span><strong>{selectedCrew?.state ?? "UNKNOWN"}</strong></div>
          <div><span>DATA QUALITY</span><strong>UNKNOWN</strong></div>
        </div>
      </Panel>
      <div className="detail-actions">
        <Link className="action-link action-link-subtle" href="/">BACK TO MISSION OVERVIEW</Link>
      </div>
    </>
  );
}
