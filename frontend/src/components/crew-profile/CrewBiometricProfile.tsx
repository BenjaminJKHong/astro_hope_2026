"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useCrewRoster, type LiveCrewMember } from "@/hooks/useCrewRoster";
import { useWarningState } from "@/components/warnings/WarningStateProvider";

type SensorLayer = "BIOMEDICAL" | "SUIT";
type SensorNode = { id: string; code: string; label: string; x: number; y: number; nominalMetric: string; criticalMetric: string; nominalDiagnosis: string; criticalDiagnosis: string; recommendedAction: string; };

const BIOMEDICAL_NODES: SensorNode[] = [
  { id: "bio-cranial", code: "BIO-01 · CRANIAL / VESTIBULAR", label: "Cerebral Oximetry & Neuro-Vestibular", x: 110, y: 36, nominalMetric: "rSO₂ 74% · ICP Nominal", criticalMetric: "rSO₂ 58% · Hypoxic Neuro-Stress", nominalDiagnosis: "Cerebral perfusion and microgravity vestibular adaptation within baseline parameters.", criticalDiagnosis: "Cerebral hypoxia risk secondary to arterial desaturation and elevated sympathetic load.", recommendedAction: "Administer 100% O₂ via suit purge valve and stabilize crew member in zero-G restraint." },
  { id: "bio-thoracic", code: "BIO-02 · THORACIC / CARDIOPULMONARY", label: "Myocardial & Pulmonary Telemetry", x: 110, y: 96, nominalMetric: "Sinus Rhythm · Tidal Vol 540 mL", criticalMetric: "Tachyarrhythmia · Tachypnea Alert", nominalDiagnosis: "Normal sinus rhythm with steady myocardial contractility and alveolar gas exchange.", criticalDiagnosis: "Acute sinus tachycardia and elevated respiratory drive detected on ECG lead II.", recommendedAction: "Initiate Flight Surgeon continuous 12-lead ECG stream and abort high-exertion EVA tasks." },
  { id: "bio-arm-r", code: "BIO-03 · RIGHT UPPER EXTREMITY", label: "Brachial Perfusion & Muscular Load", x: 64, y: 122, nominalMetric: "EMG 18% · SpO₂ Peripheral 98%", criticalMetric: "EMG 86% · Tendon Strain / DCS Risk", nominalDiagnosis: "Peripheral capillary refill and forearm EMG workload within safe EVA duty limits.", criticalDiagnosis: "Severe localized muscle fatigue and possible Type-I Decompression Sickness (DCS) joint pain.", recommendedAction: "Cease torque-tool operation immediately; prepare hyperbaric airlock recompression protocol." },
  { id: "bio-lumbar", code: "BIO-04 · CORE / LUMBAR SPINE", label: "Core Thermal & Spinal Axis Sensor", x: 110, y: 146, nominalMetric: "Core Temp 37.0°C · Hydration Optimal", criticalMetric: "Core Temp 38.6°C · Hyperthermia Warning", nominalDiagnosis: "Thermoregulation balanced; spinal elongation in microgravity within expected margin.", criticalDiagnosis: "Elevated core metabolic heat retention exceeding passive evaporative cooling capacity.", recommendedAction: "Maximize LCVG chilled-water loop flow and initiate oral electrolyte rehydration." },
  { id: "bio-leg-l", code: "BIO-05 · LOWER EXTREMITY", label: "Femoral Venous Return & Ortho-Load", x: 132, y: 224, nominalMetric: "Cephalad Shift Compensated", criticalMetric: "Venous Pooling / Contusion Detected", nominalDiagnosis: "Lower-body fluid distribution and restraint harness pressure nominal.", criticalDiagnosis: "Localized soft-tissue impact trauma and restricted peripheral venous return detected.", recommendedAction: "Inspect lower torso restraint interface and log musculoskeletal injury in Flight Surgeon feed." }
];

const SUIT_NODES: SensorNode[] = [
  { id: "suit-hev", code: "xEMU-01 · HEV HELMET & HUD", label: "Extravehicular Visor & Comms Array", x: 110, y: 36, nominalMetric: "Visor Seal 100% · UHF Link Clear", criticalMetric: "Micro-Pitting / CO₂ Washout Degradation", nominalDiagnosis: "Polycarbonate pressure bubble intact; helmet anti-fog and dual-redundant comms nominal.", criticalDiagnosis: "Elevated inspired pCO₂ (4.8 mmHg) in helmet oral-nasal cavity; possible visor seal creep.", recommendedAction: "Switch PLSS ventilation fan to HIGH and verify helmet neck-ring locking dog engagement." },
  { id: "suit-plss", code: "xEMU-02 · PLSS LIFE SUPPORT", label: "Portable Life Support & RCA Scrubber", x: 146, y: 86, nominalMetric: "4.3 psid · O₂ 94% · RCA Nominal", criticalMetric: "3.7 psid · Primary O₂ Regulator Fault", nominalDiagnosis: "Primary oxygen tank, Rapid Cycle Amine (RCA) CO₂ scrubber, and sublimator operating nominally.", criticalDiagnosis: "Primary O₂ pressure drop detected; Secondary Oxygen Pack (SOP) auto-standby armed.", recommendedAction: "Activate Secondary Oxygen Pack (SOP) and execute immediate umbilical return to Quest Airlock." },
  { id: "suit-hut", code: "xEMU-03 · HUT & DCM INTERFACE", label: "Hard Upper Torso & Display Module", x: 110, y: 102, nominalMetric: "HUT Integrity Nominal · Bus 28.1V", criticalMetric: "MMOD Impact Sensor · Thermal Breach", nominalDiagnosis: "Fiberglass Hard Upper Torso shell and Display & Control Module avionics healthy.", criticalDiagnosis: "Micrometeoroid/Orbital Debris (MMOD) strike registered on upper right thermal micrometeoroid garment.", recommendedAction: "Inspect multi-layer insulation (MLI) with wrist mirror; verify zero cabin-to-vacuum leak rate." },
  { id: "suit-glove", code: "xEMU-04 · EVA GLOVE & WRIST SEAL", label: "Phase-VI Glove Heater & Disconnect", x: 162, y: 152, nominalMetric: "Fingertip 26.4°C · Bearing Sealed", criticalMetric: "Glove Heater Fault · 6.2°C Frostbite Risk", nominalDiagnosis: "Wrist disconnect bearing locked; fingertip resistive heaters maintaining dexterity.", criticalDiagnosis: "Open circuit in right Phase-VI glove thermal heater during orbital night pass.", recommendedAction: "Engage high-power glove heater override or tuck hand into HUT thermal shelter." },
  { id: "suit-lcvg", code: "xEMU-05 · LCVG & LOWER TORSO", label: "Liquid Cooling Garment & Waist Bearing", x: 92, y: 196, nominalMetric: "Coolant Loop 14.2°C · 0.9 L/min", criticalMetric: "Coolant Flow Restriction · Seal Drag", nominalDiagnosis: "LCVG tubing circulation and brief/hip mobility bearings operating without friction.", criticalDiagnosis: "Reduced coolant flow rate in lower torso manifold causing localized thermal buildup.", recommendedAction: "Cycle LCVG pump valve to bypass mode and reduce lower-extremity translation speed." }
];

function getProfileMetrics(member: LiveCrewMember, isCritical: boolean, radMsv: number | null) {
  const seed = member.callsign.split("").reduce((acc, ch) => acc + (ch.codePointAt(0) ?? 0), 0);
  const sys = isCritical ? 146 + (seed % 14) : 114 + (seed % 10);
  const dia = isCritical ? 92 + (seed % 8) : 72 + (seed % 8);
  const coreTemp = isCritical ? (38.3 + (seed % 5) * 0.1).toFixed(1) : (36.8 + (seed % 4) * 0.1).toFixed(1);
  const radiation = typeof radMsv === "number" ? radMsv.toFixed(2) : (0.34 + (seed % 15) * 0.01).toFixed(2);
  const suitPsid = isCritical ? "3.72" : "4.30";
  const co2Mmhg = isCritical ? "5.1" : "1.8";
  return { sys, dia, coreTemp, radiation, suitPsid, co2Mmhg };
}

function HolographicMapVisuals({ sensorLayer, activeNodes, activeNode, memberCritical, setSelectedNodeId }: Readonly<{ sensorLayer: SensorLayer, activeNodes: SensorNode[], activeNode: SensorNode, memberCritical: boolean, setSelectedNodeId: (id: string) => void }>) {
  return (
    <svg viewBox="0 0 220 290" className="w-56 h-72" aria-label="Astronaut Holographic Telemetry Silhouette" aria-hidden="false">
      <line x1="20" y1="60" x2="200" y2="60" stroke="rgba(56,189,248,0.08)" strokeDasharray="3 3" />
      <line x1="20" y1="145" x2="200" y2="145" stroke="rgba(56,189,248,0.08)" strokeDasharray="3 3" />
      <line x1="20" y1="230" x2="200" y2="230" stroke="rgba(56,189,248,0.08)" strokeDasharray="3 3" />
      {sensorLayer === "SUIT" && (
        <rect x="74" y="52" width="72" height="90" rx="8" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="4 2" />
      )}
      <g stroke={sensorLayer === "BIOMEDICAL" ? "#38bdf8" : "#fbbf24"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="110" cy="36" r="16" fill={sensorLayer === "BIOMEDICAL" ? "rgba(56,189,248,0.1)" : "rgba(245,158,11,0.1)"} />
        <line x1="110" y1="52" x2="110" y2="150" />
        <line x1="80" y1="65" x2="140" y2="65" />
        <path d="M80 65 L64 110 L70 150" />
        <path d="M140 65 L156 110 L150 150" />
        <line x1="90" y1="150" x2="130" y2="150" />
        <path d="M90 150 L84 210 L90 270" />
        <path d="M130 150 L136 210 L130 270" />
      </g>
      {activeNodes.map((node, index) => {
        const isNodeSelected = node.id === activeNode.id;
        const isFaultNode = memberCritical && (index === 1 || index === 2);
        let nodeColor = "#34d399";
        if (isFaultNode) nodeColor = "#ef4444";
        else if (isNodeSelected) nodeColor = "#38bdf8";

        return (
          <g key={node.id} onClick={() => setSelectedNodeId(node.id)} className="cursor-pointer">
            <circle cx={node.x} cy={node.y} r={isNodeSelected ? "12" : "8"} fill={nodeColor} fillOpacity="0.25" />
            <circle cx={node.x} cy={node.y} r="5" fill={nodeColor} stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

function TelemetryMatrix({ selectedMember, metrics, memberCritical }: Readonly<{ selectedMember: LiveCrewMember, metrics: any, memberCritical: boolean }>) {
  return (
    <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl">
      <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase mb-4">BIOMEDICAL &amp; xEMU TELEMETRY MATRIX</h2>
      <div className="space-y-3">
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-5 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-white block">HEART RATE (ECG LEAD II)</span>
            <span className="text-[11px] text-blue-200/50">BASELINE 60–100 BPM</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-extrabold ${memberCritical ? "text-red-400" : "text-white"}`}>
              {selectedMember.heartRate} <span className="text-xs font-normal text-blue-200/50">BPM</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${memberCritical ? "bg-red-500/25 text-red-200" : "bg-emerald-500/20 text-emerald-300"}`}>
              {memberCritical ? "ELEVATED" : "NOMINAL"}
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-5 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-white block">ARTERIAL OXYGEN SATURATION (SpO₂)</span>
            <span className="text-[11px] text-blue-200/50">TARGET ≥ 95% SpO₂</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-extrabold ${memberCritical ? "text-red-400" : "text-white"}`}>
              {selectedMember.spo2} <span className="text-xs font-normal text-blue-200/50">%</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${memberCritical ? "bg-red-500/25 text-red-200" : "bg-emerald-500/20 text-emerald-300"}`}>
              {memberCritical ? "HYPOXIA WATCH" : "NOMINAL"}
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-5 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-white block">BLOOD PRESSURE (CUFF / PPG)</span>
            <span className="text-[11px] text-blue-200/50">SYSTOLIC / DIASTOLIC</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-white">
              {metrics.sys}/{metrics.dia} <span className="text-xs font-normal text-blue-200/50">mmHg</span>
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">NOMINAL</span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-5 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-white block">xEMU SUIT PRESSURE &amp; pCO₂</span>
            <span className="text-[11px] text-blue-200/50">NOMINAL EVA 4.3 PSID · pCO₂ &lt; 3.0 mmHg</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xl font-extrabold ${memberCritical ? "text-amber-300" : "text-white"}`}>
              {metrics.suitPsid} <span className="text-xs font-normal text-blue-200/50">psid</span> · {metrics.co2Mmhg} <span className="text-xs font-normal text-blue-200/50">mmHg</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${memberCritical ? "bg-amber-500/25 text-amber-200" : "bg-emerald-500/20 text-emerald-300"}`}>
              {memberCritical ? "DEGRADED" : "SEALED"}
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-5 py-4 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-white block">CORE TEMP &amp; DOSIMETER EXPOSURE</span>
            <span className="text-[11px] text-blue-200/50">24H RADIATION LIMIT 0.50 mSv</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-white">
              {metrics.coreTemp}°C · {metrics.radiation} <span className="text-xs font-normal text-blue-200/50">mSv</span>
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">WATCH</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrewBiometricProfile() {
  const { telemetry } = useTelemetry();
  const { state } = useWarningState();
  const baseCritical = state === "CRITICAL" || telemetry?.system_status === "CRITICAL" || telemetry?.system_status === "RED";

  const { crew, treatCrewMember } = useCrewRoster(telemetry, baseCritical);
  const activeCrew = crew.filter((m) => !m.isOffboarded);

  const [selectedId, setSelectedId] = useState<string>("");
  const [sensorLayer, setSensorLayer] = useState<SensorLayer>("BIOMEDICAL");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("bio-thoracic");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const crewParam = params.get("crew");
    if (crewParam) setSelectedId(crewParam);
  }, []);

  const selectedMember = activeCrew.find((m) => m.id === selectedId) ?? activeCrew.find((m) => m.isCritical) ?? activeCrew[0];
  const memberCritical = Boolean(selectedMember?.isCritical);
  const activeNodes = sensorLayer === "BIOMEDICAL" ? BIOMEDICAL_NODES : SUIT_NODES;
  const activeNode = activeNodes.find((n) => n.id === selectedNodeId) ?? activeNodes[0];

  const handleLayerSwitch = (layer: SensorLayer) => {
    setSensorLayer(layer);
    setSelectedNodeId(layer === "BIOMEDICAL" ? "bio-thoracic" : "suit-plss");
  };

  if (!selectedMember) {
    return (
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 p-8 text-white">
        <p className="text-blue-200/70">No active crew members on station. Register crew in Crew Monitoring.</p>
      </div>
    );
  }

  const metrics = getProfileMetrics(selectedMember, memberCritical, (telemetry as Record<string, unknown>)?.radiation_msv as number | null ?? null);

  return (
    <div className="w-full flex flex-col gap-6 text-white font-sans pb-10">
      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-8 py-6 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
            <span>02 · CREW BIOMETRIC &amp; xEMU DIAGNOSTIC PROFILE</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-50">
            {selectedMember.name} <span className="text-lg font-mono text-blue-300/70">· UNIT {selectedMember.callsign}</span>
          </h1>
          <p className="text-blue-200/65 text-xs mt-1">
            {selectedMember.role} · Zone: <strong className="text-cyan-300">{selectedMember.location}</strong> · Task: {selectedMember.currentTask}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-widest border flex items-center gap-2 ${memberCritical ? "bg-red-500/20 text-red-200 border-red-400/50 animate-pulse" : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${memberCritical ? "bg-red-400" : "bg-emerald-400"}`} />
            {memberCritical ? "CRITICAL ANOMALY DETECTED" : "ALL TELEMETRY NOMINAL"}
          </div>
          <Link href="/crew-profile" className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-blue-100 text-xs font-bold tracking-wider transition-all">
            CREW ROSTER →
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-[#141b2d]/85 border border-white/10 px-6 py-4 flex flex-wrap items-center gap-3 shadow-lg">
        <span className="text-xs font-bold tracking-widest text-blue-200/60 uppercase mr-2">SELECT ASTRONAUT:</span>
        {activeCrew.map((member) => {
          const isSelected = member.id === selectedMember.id;
          return (
            <button key={member.id} type="button" onClick={() => setSelectedId(member.id)} className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider border transition-all flex items-center gap-2 ${isSelected ? "bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-md" : "bg-slate-900/60 text-blue-200/70 border-white/10 hover:bg-white/10"}`}>
              <span className={`w-2 h-2 rounded-full ${member.isCritical ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
              {member.callsign} · {member.name}
              {member.isCritical && <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 text-[10px]">CRITICAL</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-3xl bg-[#141b2d]/85 border border-white/10 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-blue-200/70 uppercase">HOLOGRAPHIC DIAGNOSTIC MAP</h2>
              <p className="text-[11px] text-blue-200/45">Tap a telemetry marker to inspect anatomical injury or suit subsystem status</p>
            </div>
            <div className="flex rounded-full bg-slate-950/80 p-1 border border-white/10">
              <button type="button" onClick={() => handleLayerSwitch("BIOMEDICAL")} className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all ${sensorLayer === "BIOMEDICAL" ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/40" : "text-blue-200/50 hover:text-white"}`}>
                1. BODY INJURY SENSOR
              </button>
              <button type="button" onClick={() => handleLayerSwitch("SUIT")} className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all ${sensorLayer === "SUIT" ? "bg-amber-500/30 text-amber-200 border border-amber-400/40" : "text-blue-200/50 hover:text-white"}`}>
                2. xEMU SUIT SENSOR
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-2">
            <div className="relative flex items-center justify-center bg-slate-950/60 rounded-2xl border border-white/5 py-4">
              <HolographicMapVisuals 
                sensorLayer={sensorLayer} 
                activeNodes={activeNodes} 
                activeNode={activeNode} 
                memberCritical={memberCritical} 
                setSelectedNodeId={setSelectedNodeId} 
              />
            </div>
            <div className="flex flex-col gap-2.5">
              {activeNodes.map((node, index) => {
                const isNodeSelected = node.id === activeNode.id;
                const isFaultNode = memberCritical && (index === 1 || index === 2);
                return (
                  <button key={node.id} type="button" onClick={() => setSelectedNodeId(node.id)} className={`text-left px-4 py-2.5 rounded-2xl border transition-all flex justify-between items-center ${isNodeSelected ? "bg-cyan-500/15 border-cyan-400/50 text-white" : "bg-slate-900/50 border-white/5 text-blue-200/70 hover:bg-white/5"}`}>
                    <div>
                      <span className="text-[10px] font-mono block text-blue-300/70">{node.code}</span>
                      <span className="text-xs font-bold">{node.label}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isFaultNode ? "bg-red-500/30 text-red-200 border border-red-400/50" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {isFaultNode ? "FAULT" : "OK"}
                    </span>
                  </button>
                );
              })}
              
              {/* EXPANDED MEDICAL STABILIZATION TOOLKIT */}
              {memberCritical && (
                <div className="mt-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4">
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400/80 uppercase block mb-3">DEPLOY STABILIZATION MEASURES</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => treatCrewMember(selectedMember.id)} className="col-span-2 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold tracking-wider transition-all">
                      MAXIMIZE LCVG COOLANT LOOP
                    </button>
                    <button onClick={() => treatCrewMember(selectedMember.id)} className="py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold tracking-wider transition-all">
                      INITIATE 100% O₂ FLUSH
                    </button>
                    <button onClick={() => treatCrewMember(selectedMember.id)} className="py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold tracking-wider transition-all">
                      ADMINISTER SEDATIVE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={`mt-4 rounded-2xl p-4 border ${memberCritical ? "bg-red-950/35 border-red-500/40" : "bg-slate-900/70 border-cyan-500/20"}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-cyan-300">{activeNode.code}</span>
              <span className="text-xs font-mono text-blue-200/70">{memberCritical ? activeNode.criticalMetric : activeNode.nominalMetric}</span>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed mb-2">{memberCritical ? activeNode.criticalDiagnosis : activeNode.nominalDiagnosis}</p>
            <p className="text-[11px] font-semibold text-amber-300">FLIGHT SURGEON PROTOCOL: {activeNode.recommendedAction}</p>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-4">
          <TelemetryMatrix selectedMember={selectedMember} metrics={metrics} memberCritical={memberCritical} />
        </div>
      </div>
    </div>
  );
}