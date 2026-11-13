"use client";

import { useState } from "react";
import Link from "next/link";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useCrewRoster, type CrewLocation } from "@/hooks/useCrewRoster";
import { useWarningState } from "@/components/warnings/WarningStateProvider";

const LOCATIONS: CrewLocation[] = ["Command Deck", "Engine Room", "EVA Spacewalk", "Life Support", "Habitat Module"];

export function CrewProfile(_props: Readonly<{ crew?: unknown }>) {
  const { telemetry } = useTelemetry();
  const { state } = useWarningState();
  const baseCritical = state === "CRITICAL" || telemetry?.system_status === "CRITICAL" || telemetry?.system_status === "RED";

  const { crew, addCrewMember, toggleOffboard } = useCrewRoster(telemetry, baseCritical);

  const [name, setName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [role, setRole] = useState("Mission Specialist");
  const [location, setLocation] = useState<CrewLocation>("Command Deck");
  const [currentTask, setCurrentTask] = useState("");
  const [baselineHr, setBaselineHr] = useState("76");
  const [baselineSpo2, setBaselineSpo2] = useState("98");

  const handleRegister: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim() || !callsign.trim()) return;

    addCrewMember({
      name, callsign, role, location, currentTask,
      baselineHr: Number(baselineHr) || 76,
      baselineSpo2: Number(baselineSpo2) || 98,
    });

    setName(""); setCallsign(""); setRole("Mission Specialist"); setCurrentTask(""); setBaselineHr("76"); setBaselineSpo2("98");
  };

  const activeCrew = crew.filter((m) => !m.isOffboarded);
  const offboardedCrew = crew.filter((m) => m.isOffboarded);

  return (
    <div className="w-full flex flex-col gap-8 text-white font-sans pb-12">
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">Crew Monitoring & Station Roster</h1>
          <p className="text-blue-200/70 mt-1 text-sm">Manage live station locations, assign active EVA/Engine tasks, or toggle offboard status</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-5 py-2.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold tracking-wider">
            {activeCrew.length} ACTIVE ON STATION
          </span>
          <Link href="/" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold tracking-wider transition-all">
            ← MISSION OVERVIEW
          </Link>
        </div>
      </div>

      <form onSubmit={handleRegister} className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-8 shadow-xl">
        <h2 className="text-blue-200/70 text-xs font-bold tracking-widest uppercase mb-5">REGISTER ARRIVING CREW MEMBER</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="input-name" className="block text-xs text-blue-200/60 font-semibold mb-1.5 ml-3">FULL NAME</label>
            <input id="input-name" type="text" required placeholder="e.g. Capt. Sarah Jenkins" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-3 rounded-full bg-slate-900/80 border border-white/15 text-sm text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label htmlFor="input-callsign" className="block text-xs text-blue-200/60 font-semibold mb-1.5 ml-3">CALLSIGN / ID</label>
            <input id="input-callsign" type="text" required placeholder="e.g. 04-E" value={callsign} onChange={(e) => setCallsign(e.target.value)} className="w-full px-5 py-3 rounded-full bg-slate-900/80 border border-white/15 text-sm text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label htmlFor="input-role" className="block text-xs text-blue-200/60 font-semibold mb-1.5 ml-3">STATION ROLE</label>
            <input id="input-role" type="text" placeholder="e.g. Flight Engineer" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-5 py-3 rounded-full bg-slate-900/80 border border-white/15 text-sm text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="input-task" className="block text-xs text-blue-200/60 font-semibold mb-1.5 ml-3">CURRENT TASK / MISSION NOTE</label>
            <input id="input-task" type="text" placeholder="e.g. Fixing radiator valve in external sector 4" value={currentTask} onChange={(e) => setCurrentTask(e.target.value)} className="w-full px-5 py-3 rounded-full bg-slate-900/80 border border-white/15 text-sm text-white placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label htmlFor="input-location" className="block text-xs text-blue-200/60 font-semibold mb-1.5 ml-3">STATION LOCATION / ZONE</label>
            <select id="input-location" value={location} onChange={(e) => setLocation(e.target.value as CrewLocation)} className="w-full px-5 py-3 rounded-full bg-slate-900/80 border border-white/15 text-sm text-white focus:outline-none focus:border-blue-400">
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="input-hr" className="block text-xs text-blue-200/60 font-semibold mb-1.5 ml-2">BASE HR</label>
              <input id="input-hr" type="number" min={40} max={180} value={baselineHr} onChange={(e) => setBaselineHr(e.target.value)} className="w-full px-4 py-3 rounded-full bg-slate-900/80 border border-white/15 text-sm text-white text-center focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label htmlFor="input-spo2" className="block text-xs text-blue-200/60 font-semibold mb-1.5 ml-2">BASE SpO₂</label>
              <input id="input-spo2" type="number" min={80} max={100} value={baselineSpo2} onChange={(e) => setBaselineSpo2(e.target.value)} className="w-full px-4 py-3 rounded-full bg-slate-900/80 border border-white/15 text-sm text-white text-center focus:outline-none focus:border-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button type="submit" className="px-8 py-3 rounded-full bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 text-blue-200 text-xs font-bold tracking-wider transition-all shadow-lg">
            + DEPLOY CREW MEMBER
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-blue-100 tracking-wide uppercase">Active Station Personnel</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCrew.map((member) => (
            <div key={member.id} className={`rounded-3xl p-6 border flex flex-col justify-between ${member.isCritical ? 'bg-red-950/40 border-red-500/50 critical-pulse' : 'bg-[#141b2d]/85 border-white/10 shadow-xl'}`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-mono text-blue-300/70">UNIT {member.callsign} · <strong className="text-blue-400">{member.location}</strong></span>
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-blue-200/50">{member.role}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${member.isCritical ? 'bg-red-500/30 text-red-200 border border-red-400/60 animate-pulse' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                    {member.statusLabel}
                  </span>
                </div>

                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 my-3">
                  <span className="text-[10px] uppercase font-bold text-blue-300/60 block mb-1">Active Assignment</span>
                  <p className="text-xs text-blue-100 italic">&quot;{member.currentTask}&quot;</p>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 mb-4">
                  <div>
                    <span className="text-[11px] text-blue-200/50 block">HEART RATE</span>
                    <span className={`text-xl font-bold ${member.isCritical ? "text-red-300" : "text-white"}`}>
                      {member.heartRate}
                      <span className="ml-1 text-xs font-normal text-blue-200/50">BPM</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-blue-200/50 block">SpO₂</span>
                    <span className={`text-xl font-bold ${member.isCritical ? "text-red-300" : "text-white"}`}>
                      {member.spo2}
                      <span className="ml-1 text-xs font-normal text-blue-200/50">%</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/biometric-trends?crew=${member.id}`}
                    className={`w-full py-2 rounded-full text-center text-xs font-bold tracking-wider transition-all border ${
                      member.isCritical
                        ? "bg-red-500/25 hover:bg-red-500/35 text-red-100 border-red-400/50"
                        : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border-cyan-400/30"
                    }`}
                  >
                    {member.isCritical ? "DIAGNOSE CRITICAL FAULT →" : "OPEN BIOMETRIC & SUIT SCAN →"}
                  </Link>

                  <button onClick={() => toggleOffboard(member.id)} className="w-full py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-bold tracking-wider transition-all">
                    MARK OFFBOARD / RETIRED
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {offboardedCrew.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h2 className="text-sm font-bold text-gray-400 tracking-wider uppercase">Offboarded / Retired Personnel ({offboardedCrew.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-70">
            {offboardedCrew.map((member) => (
              <div key={member.id} className="rounded-2xl p-4 bg-slate-900/40 border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-xs font-mono text-gray-400">UNIT {member.callsign}</span>
                  <h4 className="text-sm font-bold text-white">{member.name}</h4>
                  <span className="text-[10px] text-red-400 font-semibold uppercase">Off-Station</span>
                </div>
                <button onClick={() => toggleOffboard(member.id)} className="px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold hover:bg-blue-500/30">
                  REBOARD
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}