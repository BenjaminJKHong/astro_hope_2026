"use client";

import { useState, useEffect, useCallback } from "react";
import type { TelemetryMessage } from "@/types/telemetry";

export type CrewLocation = "Command Deck" | "Engine Room" | "EVA Spacewalk" | "Life Support" | "Habitat Module";

export interface CrewMember { id: string; callsign: string; name: string; role: string; color: string; baselineHr: number; baselineSpo2: number; location: CrewLocation; currentTask: string; isOffboarded: boolean; }
export interface LiveCrewMember extends CrewMember { heartRate: number; spo2: number; isCritical: boolean; statusLabel: "CRITICAL" | "NOMINAL" | "OFF-STATION"; }

const DEFAULT_CREW: CrewMember[] = [
  { id: "crew-04a", callsign: "04-A", name: "Cmdr. Elena Vance", role: "Mission Commander", color: "#38bdf8", baselineHr: 78, baselineSpo2: 98, location: "Command Deck", currentTask: "Monitoring orbital trajectory & atmospheric pressure", isOffboarded: false },
  { id: "crew-04b", callsign: "04-B", name: "Dr. Marcus Chen", role: "Flight Surgeon", color: "#34d399", baselineHr: 72, baselineSpo2: 99, location: "Habitat Module", currentTask: "Reviewing daily biometric logs & crew fatigue indexes", isOffboarded: false },
  { id: "crew-04c", callsign: "04-C", name: "Eng. Kenji Sato", role: "EVA Systems Engineer", color: "#a78bfa", baselineHr: 84, baselineSpo2: 97, location: "EVA Spacewalk", currentTask: "Repairing thermal insulation blanket on Solar Array B", isOffboarded: false },
  { id: "crew-04d", callsign: "04-D", name: "Spec. Priya Nair", role: "Payload Specialist", color: "#f472b6", baselineHr: 75, baselineSpo2: 98, location: "Engine Room", currentTask: "Calibrating plasma flow regulators & ion thruster valves", isOffboarded: false },
];

const globalRoster = [...DEFAULT_CREW];
const globalVitals: Record<string, { hr: number; spo2: number }> = {};
let globalHrHistory: any[] = [];
let globalSpo2History: any[] = [];
const globalLatched = new Set<string>();
const globalTreated: Record<string, number> = {};

let latestTelemetry: TelemetryMessage | null = null;
let latestGlobalCritical = false;
const listeners = new Set<() => void>();

let audioCtx: AudioContext | null = null;
let alarmTimer: NodeJS.Timeout | null = null;

function manageAlarm(isCritical: boolean) {
  if (typeof window === "undefined") return;
  if (isCritical) {
    if (alarmTimer) return; 
    try {
      audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      alarmTimer = setInterval(() => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.15); 
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }, 1500);
    } catch {
      // Browsers may block AudioContext creation in restricted contexts; no action is needed beyond logging.
      console.warn("Audio Context blocked by browser policy.");
    }
  } else if (alarmTimer) {
    clearInterval(alarmTimer);
    alarmTimer = null;
  }
}

function notifySubscribers() {
  listeners.forEach((listener) => listener());
}

function globalTick() {
  const stamp = new Date().toTimeString().slice(0, 8);
  const nextHrPoint: Record<string, any> = { timestamp: stamp };
  const nextSpo2Point: Record<string, any> = { timestamp: stamp };

  // 1.2% chance per tick for natural anomaly injection during presentation
  if (Math.random() < 0.012) {
    const nonCritical = globalRoster.filter(m => !globalLatched.has(m.id) && (globalTreated[m.id] ?? 0) < Date.now());
    if (nonCritical.length > 0) {
      const victim = nonCritical[Math.floor(Math.random() * nonCritical.length)];
      globalLatched.add(victim.id);
    }
  }

  globalRoster.forEach((member, idx) => {
    if (member.isOffboarded) return;
    
    const isTreated = (globalTreated[member.id] ?? 0) > Date.now();
    const isPrimaryForced = idx === 0 && latestGlobalCritical;
    const isCurrentlyCritical = globalLatched.has(member.id) || isPrimaryForced;
    
    if (isCurrentlyCritical && !isTreated) globalLatched.add(member.id);

    let targetHr = member.baselineHr;
    let targetSpo2 = member.baselineSpo2;

    if (isTreated) {
      targetHr = member.baselineHr;
      targetSpo2 = member.baselineSpo2;
    } else if (isCurrentlyCritical) {
      targetHr = member.baselineHr + 42; 
      targetSpo2 = member.baselineSpo2 - 10; 
    } else if (idx === 0 && typeof latestTelemetry?.heart_rate === "number") {
      targetHr = latestTelemetry.heart_rate;
      targetSpo2 = latestTelemetry.spo2 ?? member.baselineSpo2;
    }

    targetHr += (Math.random() - 0.5) * 2;
    targetSpo2 += (Math.random() - 0.5) * 1;

    const current = globalVitals[member.id] || { hr: member.baselineHr, spo2: member.baselineSpo2 };
    
    // Smooth Lerp factor set to 0.12 for slow, gradual, clinical medical monitor transitions
    const newHr = Math.round(current.hr + (targetHr - current.hr) * 0.12);
    const newSpo2 = Math.round(current.spo2 + (targetSpo2 - current.spo2) * 0.12);

    globalVitals[member.id] = { hr: newHr, spo2: Math.max(75, Math.min(100, newSpo2)) };
    nextHrPoint[member.id] = newHr;
    nextSpo2Point[member.id] = globalVitals[member.id].spo2;
  });

  const isAnyAlarmActive = globalLatched.size > 0 && !Object.values(globalTreated).some(t => t > Date.now());
  manageAlarm(isAnyAlarmActive);

  globalHrHistory = globalHrHistory.length === 0 ? new Array(12).fill(nextHrPoint) : [...globalHrHistory.slice(-14), nextHrPoint];
  globalSpo2History = globalSpo2History.length === 0 ? new Array(12).fill(nextSpo2Point) : [...globalSpo2History.slice(-14), nextSpo2Point];

  notifySubscribers();
}

let isTickerRunning = false;
if (typeof window !== "undefined" && !isTickerRunning) {
  isTickerRunning = true;
  globalRoster.forEach((m) => { globalVitals[m.id] = { hr: m.baselineHr, spo2: m.baselineSpo2 }; });
  globalTick(); 
  setInterval(globalTick, 5000); // Perfectly paced 5-second clinical tick interval
}

export function useCrewRoster(telemetry?: TelemetryMessage | null, globalCritical = false) {
  useEffect(() => {
    latestTelemetry = telemetry || null;
    latestGlobalCritical = globalCritical;
  }, [telemetry, globalCritical]);

  const [tickCounter, setTickCounter] = useState(0); 
  
  useEffect(() => {
    const triggerRender = () => setTickCounter(t => t + 1);
    listeners.add(triggerRender);
    return () => { listeners.delete(triggerRender); };
  }, []);

  const addCrewMember = useCallback((input: any) => { /* Placeholder */ }, []);
  const toggleOffboard = useCallback((id: string) => { /* Placeholder */ }, []);

  const treatCrewMember = useCallback((id: string) => {
    globalTreated[id] = Date.now() + 60000; 
    globalLatched.delete(id);
    manageAlarm(false);
    notifySubscribers();
  }, []);

  const adminOverrideAll = useCallback(() => {
    globalRoster.forEach(m => globalTreated[m.id] = Date.now() + 120000); 
    globalLatched.clear();
    manageAlarm(false);
    notifySubscribers();
  }, []);

  const isGlobalTreated = Object.values(globalTreated).some(t => t > Date.now());

  const liveCrew: LiveCrewMember[] = globalRoster.map(member => {
    const v = globalVitals[member.id] || { hr: member.baselineHr, spo2: member.baselineSpo2 };
    const isCritical = globalLatched.has(member.id);
    let statusLabel: "OFF-STATION" | "CRITICAL" | "NOMINAL" = "NOMINAL";
    
    if (member.isOffboarded) statusLabel = "OFF-STATION";
    else if (isCritical) statusLabel = "CRITICAL";
    
    return { ...member, heartRate: v.hr, spo2: v.spo2, isCritical, statusLabel };
  });

  return { crew: liveCrew, hrHistory: globalHrHistory, spo2History: globalSpo2History, addCrewMember, toggleOffboard, treatCrewMember, adminOverrideAll, isGlobalTreated, _tick: tickCounter };
}