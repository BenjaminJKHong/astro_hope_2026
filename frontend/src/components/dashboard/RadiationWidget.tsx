"use client";

export function RadiationWidget({ critical = false }: Readonly<{ critical?: boolean }>) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-200/60 text-xs font-bold tracking-widest flex items-center gap-2">
          {/* Fixed SonarQube Warning: Added aria-hidden */}
          <svg aria-hidden="true" className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          RADIATION TELEMETRY
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-400">CREW MEMBER</span>
          <span className="text-sm text-white font-mono bg-white/10 px-2 py-1 rounded">ID NOT REPORTED</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-400">EXPOSURE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">—</span>
            <span className="text-gray-500">mSv</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest border transition-colors duration-500 ${critical ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
            {critical ? 'SOLAR PARTICLE EVENT DETECTED' : 'ENVIRONMENT NOMINAL'}
          </div>
        </div>
      </div>
    </div>
  );
}