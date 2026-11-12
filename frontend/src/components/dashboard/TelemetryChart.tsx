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
import type { LiveCrewMember } from "@/hooks/useCrewRoster";

type TelemetryChartProps = Readonly<{
  title: string;
  unit: string;
  data: Array<Record<string, string | number>>;
  crew: LiveCrewMember[];
}>;

export function TelemetryChart({ title, unit, data, crew }: TelemetryChartProps) {
  const criticalMembers = crew.filter((member) => member.isCritical);
  const hasCritical = criticalMembers.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header & Pill Status */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h2 className="text-blue-200/70 text-xs font-bold tracking-widest uppercase">
            {title}
          </h2>
          <p className="text-xs text-blue-200/40 mt-0.5">
            Tracking {crew.length} active station crew ({unit})
          </p>
        </div>

        <div
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider border ${
            hasCritical
              ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          }`}
        >
          {hasCritical
            ? `${criticalMembers.length} CRITICAL ALERT`
            : "ALL CREW NOMINAL"}
        </div>
      </div>

      {/* Crew Legend Pills (Only Critical Crew Highlighted in Red) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {crew.map((member) => (
          <span
            key={member.id}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
              member.isCritical
                ? "bg-red-500/25 text-red-200 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                : "bg-white/5 text-blue-100/70 border-white/10"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: member.isCritical ? "#ef4444" : member.color,
              }}
            />
            {member.callsign} · {member.name.split(" ").at(-1)}
          </span>
        ))}
      </div>

      {/* Recharts Container with Fixed h-64 */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
          >
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.12)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: "#78879c", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "#78879c", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "16px",
                color: "#f8fafc",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
            />
            {crew.map((member) => (
              <Line
                key={member.id}
                type="monotone"
                dataKey={member.id}
                name={`${member.callsign} (${member.name})`}
                stroke={member.isCritical ? "#ef4444" : member.color}
                strokeWidth={member.isCritical ? 3.2 : 1.8}
                strokeOpacity={member.isCritical ? 1 : 0.7}
                dot={false}
                activeDot={{
                  r: member.isCritical ? 5 : 4,
                  fill: member.isCritical ? "#ef4444" : member.color,
                }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}