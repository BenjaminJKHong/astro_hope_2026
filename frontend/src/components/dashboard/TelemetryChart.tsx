"use client";

import React from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { LiveCrewMember } from "@/hooks/useCrewRoster";

interface TelemetryChartProps {
  title: string;
  unit: string;
  data: Array<Record<string, string | number>>;
  crew: LiveCrewMember[];
}

export function TelemetryChart({ title, unit, data, crew }: Readonly<TelemetryChartProps>) {
  const criticalMembers = (crew || []).filter((member) => member.isCritical);
  const hasCritical = criticalMembers.length > 0;
  const targetCriticalId = hasCritical ? criticalMembers[0].id : "";

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-blue-200/60 text-xs font-bold tracking-widest uppercase">{title}</h2>
          <p className="text-[10px] text-blue-200/40 mt-1">Tracking {crew.filter(m => !m.isOffboarded).length} active station crew ({unit})</p>
        </div>
        {hasCritical && (
          <Link 
            href={`/biometric-trends?crew=${targetCriticalId}`}
            className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/50 text-[10px] font-bold tracking-wider animate-pulse hover:bg-red-500/40 transition-colors"
          >
            {criticalMembers.length} CRITICAL ALERT →
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {crew.filter(m => !m.isOffboarded).map((member) => (
          <div key={member.id} className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
            <span className="text-[10px] text-blue-100 font-medium">{member.callsign} · {member.name.split(" ").pop()}</span>
          </div>
        ))}
      </div>

      <div className="flex-grow w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.1)" fontSize={9} tickMargin={8} />
            <YAxis stroke="rgba(255,255,255,0.1)" fontSize={9} tickMargin={8} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
            />
            {crew.filter(m => !m.isOffboarded).map((member) => (
              <Line 
                key={member.id} 
                type="monotone" 
                dataKey={member.id} 
                stroke={member.color} 
                strokeWidth={member.isCritical ? 3 : 1.5} 
                dot={false} 
                isAnimationActive={false} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}