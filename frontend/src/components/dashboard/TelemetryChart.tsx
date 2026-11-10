"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TelemetryPoint, TelemetrySourceState } from "@/types/telemetry";

type TelemetryChartProps = {
  title: string;
  unit: string;
  data: TelemetryPoint[];
  sourceState?: TelemetrySourceState;
  color?: string;
  critical?: boolean;
  variant?: "overview" | "trend";
};

export function TelemetryChart({
  title,
  unit,
  data,
  sourceState = "UNKNOWN",
  color = "#32d6f5",
  critical = false,
  variant = "overview",
}: TelemetryChartProps) {
  const validData = data.filter(
    (point) => point.timestamp.trim().length > 0 && Number.isFinite(point.value),
  );
  const hasData = validData.length > 0;
  const disconnected = sourceState === "NOT CONNECTED" || sourceState === "DISCONNECTED";
  const displayState = hasData
    ? sourceState
    : disconnected
      ? sourceState
      : sourceState === "SIMULATED"
        ? "SIMULATED · WAITING FOR TELEMETRY"
        : "WAITING FOR TELEMETRY";
  const headingState = hasData ? sourceState : disconnected ? "NOT CONNECTED" : "WAITING";
  const latestValue = validData.at(-1)?.value;

  return (
    <section
      className={`panel telemetry-chart${variant === "trend" ? " telemetry-chart-trend" : ""}${critical ? " telemetry-chart-critical" : ""}`}
      aria-label={`${title} telemetry chart${critical ? ", critical demonstration warning active" : ""}`}
    >
      <div className="chart-heading">
        <div>
          <h2>{title} · {headingState}</h2>
          <p className={`chart-source ${critical ? "tone-text-red" : "tone-text-amber"}`}>
            {critical ? "CRITICAL MODE · VALUE NOT REPORTED" : `${displayState} · ID NOT REPORTED`}
          </p>
        </div>
        <div className="chart-value"><strong>{latestValue ?? "—"}</strong><span>{unit}</span></div>
      </div>
      <div className={`chart-plot${hasData ? " chart-plot-data" : ""}`} role="group" aria-label={`${title} measurements`}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={validData} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#263347" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: "#78879c", fontSize: 8 }}
                tickLine={false}
                axisLine={{ stroke: "#263347" }}
                minTickGap={24}
              />
              <YAxis
                width={30}
                tick={{ fill: "#78879c", fontSize: 8 }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip
                cursor={{ stroke: "#78879c", strokeDasharray: "3 3" }}
                contentStyle={{ background: "#0b101a", border: "1px solid #263347", borderRadius: 6, color: "#f3f6fc", fontSize: 10 }}
                labelStyle={{ color: "#9caac0", marginBottom: 4 }}
                formatter={(value) => [`${value ?? "—"} ${unit}`, title]}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={title}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: color }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty-state" role="status" aria-live="polite">
            <span aria-hidden="true" />
            {critical ? "CRITICAL MODE · WAITING FOR TELEMETRY" : displayState}
          </div>
        )}
      </div>
    </section>
  );
}
