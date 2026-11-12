"use client";

import { useState, useEffect, useCallback } from "react";
import type { TelemetryMessage } from "@/types/telemetry";

export type CrewLocation = "Command Deck" | "Engine Room" | "EVA Spacewalk" | "Life Support" | "Habitat Module";

export interface CrewMember {
  id: string;
  callsign: string;
  name: string;
  role: string;
  color: string;
  baselineHr: number;
  baselineSpo2: number;
  location: CrewLocation;
  currentTask: string;
  isOffboarded: boolean;
}

export interface LiveCrewMember extends CrewMember {
  heartRate: number;
  spo2: number;
  isCritical: boolean;
  statusLabel: "CRITICAL" | "NOMINAL" | "OFF-STATION";
}

const STORAGE_KEY = "astropulse_station_crew_v2";
const SYNC_EVENT = "astropulse-crew-updated-v2";

const CREW_COLORS = ["#38bdf8", "#34d399", "#a78bfa", "#f472b6", "#fbbf24", "#2dd4bf"];

const DEFAULT_CREW: CrewMember[] = [
  { id: "crew-04a", callsign: "04-A", name: "Cmdr. Elena Vance", role: "Mission Commander", color: "#38bdf8", baselineHr: 78, baselineSpo2: 98, location: "Command Deck", currentTask: "Monitoring orbital trajectory & atmospheric pressure", isOffboarded: false },
  { id: "crew-04b", callsign: "04-B", name: "Dr. Marcus Chen", role: "Flight Surgeon", color: "#34d399", baselineHr: 72, baselineSpo2: 99, location: "Habitat Module", currentTask: "Reviewing daily biometric logs & crew fatigue indexes", isOffboarded: false },
  { id: "crew-04c", callsign: "04-C", name: "Eng. Kenji Sato", role: "EVA Systems Engineer", color: "#a78bfa", baselineHr: 84, baselineSpo2: 97, location: "EVA Spacewalk", currentTask: "Repairing thermal insulation blanket on Solar Array B", isOffboarded: false },
  { id: "crew-04d", callsign: "04-D", name: "Spec. Priya Nair", role: "Payload Specialist", color: "#f472b6", baselineHr: 75, baselineSpo2: 98, location: "Engine Room", currentTask: "Calibrating plasma flow regulators & ion thruster valves", isOffboarded: false },
];

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 8);
}

function buildInitialHistory(members: CrewMember[], metric: "baselineHr" | "baselineSpo2") {
  const now = Date.now();
  const points: Array<Record<string, string | number>> = [];
  for (let i = 11; i >= 0; i--) {
    const point: Record<string, string | number> = { timestamp: formatTime(new Date(now - i * 3000)) };
    for (const member of members) {
      if (member.isOffboarded) continue;
      const jitter = Math.round(Math.sin(i + member.baselineHr) * 2);
      const raw = member[metric] + jitter;
      point[member.id] = metric === "baselineSpo2" ? Math.min(100, raw) : raw;
    }
    points.push(point);
  }
  return points;
}

export function useCrewRoster(telemetry?: TelemetryMessage | null, globalCritical = false) {
  const [roster, setRoster] = useState<CrewMember[]>(DEFAULT_CREW);
  const [liveVitals, setLiveVitals] = useState<Record<string, { hr: number; spo2: number }>>({});
  const [hrHistory, setHrHistory] = useState<Array<Record<string, string | number>>>([]);
  const [spo2History, setSpo2History] = useState<Array<Record<string, string | number>>>([]);

  useEffect(() => {
    setHrHistory(buildInitialHistory(DEFAULT_CREW, "baselineHr"));
    setSpo2History(buildInitialHistory(DEFAULT_CREW, "baselineSpo2"));

    const loadRoster = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as CrewMember[];
          if (Array.isArray(parsed) && parsed.length > 0) setRoster(parsed);
        }
      } catch { /* empty */ }
    };
    loadRoster();
    window.addEventListener(SYNC_EVENT, loadRoster);
    window.addEventListener("storage", loadRoster);
    return () => {
      window.removeEventListener(SYNC_EVENT, loadRoster);
      window.removeEventListener("storage", loadRoster);
    };
  }, []);

  useEffect(() => {
    const updateTick = () => {
      const stamp = formatTime(new Date());
      const nextVitals: Record<string, { hr: number; spo2: number }> = {};
      const nextHrPoint: Record<string, string | number> = { timestamp: stamp };
      const nextSpo2Point: Record<string, string | number> = { timestamp: stamp };

      roster.forEach((member, idx) => {
        if (member.isOffboarded) return;
        const isPrimary = idx === 0 && typeof telemetry?.heart_rate === "number";
        const hrDrift = Math.round((Math.random() - 0.48) * 4);
        
        let spo2Drift = 0;
        if (Math.random() > 0.7) {
          spo2Drift = Math.random() > 0.5 ? 1 : -1;
        }

        const currentHr = isPrimary ? Math.round(telemetry.heart_rate!) : Math.max(55, Math.min(135, member.baselineHr + hrDrift));
        const currentSpo2 = isPrimary && typeof telemetry?.spo2 === "number" ? Math.round(telemetry.spo2) : Math.max(90, Math.min(100, member.baselineSpo2 + spo2Drift));

        nextVitals[member.id] = { hr: currentHr, spo2: currentSpo2 };
        nextHrPoint[member.id] = currentHr;
        nextSpo2Point[member.id] = currentSpo2;
      });

      setLiveVitals(nextVitals);
      setHrHistory((prev) => [...prev.slice(-14), nextHrPoint]);
      setSpo2History((prev) => [...prev.slice(-14), nextSpo2Point]);
    };

    updateTick();
    const timer = setInterval(updateTick, 2500);
    return () => clearInterval(timer);
  }, [roster, telemetry?.heart_rate, telemetry?.spo2]);

  const addCrewMember = useCallback((input: { name: string; callsign: string; role: string; baselineHr: number; baselineSpo2: number; location: CrewLocation; currentTask: string }) => {
    const newMember: CrewMember = {
      id: `crew-${Date.now()}`,
      name: input.name.trim(),
      callsign: input.callsign.trim().toUpperCase(),
      role: input.role.trim() || "Mission Specialist",
      color: CREW_COLORS[roster.length % CREW_COLORS.length],
      baselineHr: input.baselineHr,
      baselineSpo2: input.baselineSpo2,
      location: input.location,
      currentTask: input.currentTask.trim() || "Station maintenance and routine monitoring",
      isOffboarded: false,
    };
    const updated = [...roster, newMember];
    setRoster(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(SYNC_EVENT));
    setHrHistory((prev) => prev.map((pt) => ({ ...pt, [newMember.id]: newMember.baselineHr })));
    setSpo2History((prev) => prev.map((pt) => ({ ...pt, [newMember.id]: newMember.baselineSpo2 })));
  }, [roster]);

  const toggleOffboard = useCallback((id: string) => {
    const updated = roster.map((m) => m.id === id ? { ...m, isOffboarded: !m.isOffboarded } : m);
    setRoster(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, [roster]);

  const liveCrew: LiveCrewMember[] = roster.map((member, idx) => {
    const vitals = liveVitals[member.id] ?? { hr: member.baselineHr, spo2: member.baselineSpo2 };
    const isPrimaryForcedCritical = idx === 0 && globalCritical;
    const isVitalCritical = !member.isOffboarded && (vitals.hr > 110 || vitals.hr < 50 || vitals.spo2 < 94);
    const isCritical = isPrimaryForcedCritical || isVitalCritical;
    return { 
      ...member, 
      heartRate: vitals.hr, 
      spo2: vitals.spo2, 
      isCritical, 
      statusLabel: member.isOffboarded ? "OFF-STATION" : isCritical ? "CRITICAL" : "NOMINAL" 
    };
  });

  return { crew: liveCrew, hrHistory, spo2History, addCrewMember, toggleOffboard };
}