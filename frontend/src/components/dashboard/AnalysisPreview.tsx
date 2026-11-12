"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { AiSurgeonLog, SurgeonTriageLevel, TelemetryMessage } from "@/types/telemetry";

const triageLevels = new Set<SurgeonTriageLevel>(["GREEN", "AMBER", "RED"]);

function parseSurgeonLog(value: string | null | undefined): AiSurgeonLog | null {
  if (!value?.trim()) return null; 
  try {
    const log = JSON.parse(value) as Record<string, unknown>;
    return {
      agent: typeof log.agent === "string" ? log.agent : undefined,
      triage_level: triageLevels.has(log.triage_level as SurgeonTriageLevel) ? log.triage_level as SurgeonTriageLevel : undefined,
      diagnosis: typeof log.diagnosis === "string" ? log.diagnosis : undefined,
      timestamp: typeof log.timestamp === "string" ? log.timestamp : undefined,
    };
  } catch { return null; }
}

function HighlightedText({ text }: Readonly<{ text: string }>) {
  const keywords = ['NOMINAL', 'CRITICAL', 'WARNING', 'baseline', 'steady', 'anomaly', 'elevated', 'immediate', 'surveillance', 'intervention'];
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span className="transition-all duration-300 ease-in-out">
      {parts.map((part, i) => 
        keywords.some(k => k.toLowerCase() === part.toLowerCase()) 
          ? <span key={`${part}-${i}`} className="bg-blue-500/20 text-blue-200 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{part}</span> 
          : <span key={`${part}-${i}`}>{part}</span>
      )}
    </span>
  );
}

const getTriageClass = (level?: string) => {
  if (level === 'RED') return 'bg-red-500/20 text-red-300 border-red-500/30';
  if (level === 'AMBER') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  return 'bg-green-500/20 text-green-300 border-green-500/30';
};

export function AnalysisPreview({ telemetry, isConnected = false }: Readonly<{ telemetry?: TelemetryMessage | null; isConnected?: boolean }>) {
  const log = parseSurgeonLog(telemetry?.ai_surgeon_log);
  const [displayedText, setDisplayedText] = useState("");
  const previousBaseMsg = useRef("");

  useEffect(() => {
    const currentText = log?.diagnosis || "";
    
    // Check the first 25 characters. If they are the same, it's just minor numbers updating at the end.
    const currentBase = currentText.substring(0, 25);

    if (!previousBaseMsg.current || currentBase !== previousBaseMsg.current) {
      // NEW MESSAGE: Restart the slow, deliberate typewriter effect
      let i = 0;
      setDisplayedText("");
      const interval = setInterval(() => {
        setDisplayedText(currentText.slice(0, i));
        i += 1;
        if (i > currentText.length) clearInterval(interval);
      }, 0); // 40ms is a very comfortable reading pace
      
      previousBaseMsg.current = currentBase;
      return () => clearInterval(interval);
    } else {
      // MINOR UPDATE: Smoothly update the live numbers without restarting the typewriter
      setDisplayedText(currentText);
    }
  }, [log?.diagnosis]);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-200/60 text-xs font-bold tracking-widest flex items-center gap-2">
          <svg aria-hidden="true" className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          AI ANALYSIS PREVIEW
        </h2>
        <Link href="/ai-surgeon" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-bold flex items-center gap-1">
          OPEN FEED <span aria-hidden="true">→</span>
        </Link>
      </div>

      {log ? (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest border transition-colors duration-500 ${getTriageClass(log.triage_level)}`}>
              TRIAGE: {log.triage_level || "UNKNOWN"}
            </div>
            <span className="text-sm font-bold text-gray-300">{log.agent}</span>
          </div>
          <p className="text-gray-300 mb-6 min-h-[80px] leading-relaxed transition-all duration-300 ease-in-out">
            <HighlightedText text={displayedText} />
            <span className="animate-pulse bg-blue-400 w-2 h-4 inline-block ml-1 align-middle opacity-70"></span>
          </p>
          <div className="text-xs text-blue-200/40 font-mono tracking-widest uppercase transition-opacity duration-300">
            SYNC STAMP · {log.timestamp || "NOT REPORTED"}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-blue-200/40">
          <p className="animate-pulse">PROCESSING TELEMETRY STREAM...</p>
        </div>
      )}
    </div>
  );
}