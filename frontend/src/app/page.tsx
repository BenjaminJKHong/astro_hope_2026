'use client';
import { MainLayout } from "@/components/layout/MainLayout";
import { useTelemetry } from '../hooks/useTelemetry';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
    // We now extract 'history' to feed the charts
    const { telemetry, history, isConnected } = useTelemetry();

    let aiLog = null;
    if (telemetry?.ai_surgeon_log) {
        try {
            aiLog = JSON.parse(telemetry.ai_surgeon_log);
        } catch (e) {
            console.error("Failed to parse AI log");
        }
    }

    return (
        <MainLayout>
            <section className="page-heading" aria-labelledby="page-title">
                <div>
                    <h1 id="page-title" className="text-2xl font-bold text-white mb-1">Mission Overview</h1>
                    <p className="text-gray-400 text-sm">Crew health monitoring and mission status at a glance</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold tracking-wider ${isConnected ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                    {isConnected ? '● LIVE DATA LINK' : '■ SYSTEM OFFLINE'}
                </span>
            </section>

            <div className="mt-8 font-mono text-green-400">
                {!telemetry ? (
                    <div className="flex items-center justify-center h-64 border border-gray-800 bg-[#0a0a0a] rounded">
                        <p className="animate-pulse text-gray-500">Awaiting NASA telemetry stream from Core Engine...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        {/* Static Vitals */}
                        <div className="border border-gray-800 p-8 bg-[#0a0a0a] rounded shadow-lg">
                            <h2 className="text-gray-500 text-sm mb-2 font-bold tracking-widest">HEART RATE</h2>
                            <p className="text-5xl text-white font-light">{telemetry.heart_rate} <span className="text-xl text-gray-600">BPM</span></p>
                        </div>
                        
                        <div className="border border-gray-800 p-8 bg-[#0a0a0a] rounded shadow-lg">
                            <h2 className="text-gray-500 text-sm mb-2 font-bold tracking-widest">BLOOD OXYGEN (SpO2)</h2>
                            <p className="text-5xl text-white font-light">{telemetry.spo2} <span className="text-xl text-gray-600">%</span></p>
                        </div>

                        {/* LIVE EKG CHART */}
                        <div className="border border-gray-800 p-6 bg-[#0a0a0a] rounded col-span-2 shadow-lg h-72">
                            <h2 className="text-gray-500 text-sm mb-4 font-bold tracking-widest">LIVE TELEMETRY STREAM</h2>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                    <XAxis dataKey="timestamp" stroke="#4b5563" tick={false} />
                                    <YAxis yAxisId="left" stroke="#ef4444" domain={[60, 130]} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" domain={[90, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* NASA-STD-3001 Alert Block */}
                        <div className={`border p-8 rounded col-span-2 transition-colors duration-500 ${telemetry.system_status === 'CRITICAL' ? 'bg-red-950/20 border-red-900' : 'bg-[#0a0a0a] border-gray-800'}`}>
                            <h2 className="text-gray-500 text-sm mb-4 font-bold tracking-widest">NASA-STD-3001 SYSTEM STATUS</h2>
                            <p className={`text-2xl font-bold tracking-widest ${telemetry.system_status === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                {telemetry.system_status}
                            </p>
                            
                            {telemetry.active_alerts && telemetry.active_alerts.length > 0 && (
                                <div className="mt-4 flex flex-col gap-2">
                                    {telemetry.active_alerts.map((alert: string, i: number) => (
                                        <div key={i} className="p-3 bg-red-950/40 border-l-2 border-red-500 text-red-400 text-sm">
                                            ⚠ {alert}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* AI Flight Surgeon Log */}
                        <div className="border border-gray-800 p-8 bg-[#0a0a0a] rounded col-span-2">
                            <h2 className="text-blue-400 text-sm mb-4 font-bold tracking-widest flex items-center gap-2">
                                ✦ AI FLIGHT SURGEON LOG
                            </h2>
                            {aiLog ? (
                                <div className="font-mono text-sm leading-relaxed">
                                    <p className="text-gray-500 mb-2">AGENT: {aiLog.agent}</p>
                                    <p className="mb-2">
                                        <span className="text-gray-500">TRIAGE LEVEL: </span> 
                                        <span className={`font-bold ${aiLog.triage_level === 'RED' ? 'text-red-500' : (aiLog.triage_level === 'AMBER' || aiLog.triage_level === 'YELLOW') ? 'text-amber-500' : 'text-green-500'}`}>
                                            [{aiLog.triage_level}]
                                        </span>
                                    </p>
                                    <p className="text-white bg-black p-4 rounded border border-gray-800 mt-4">
                                        &gt; {aiLog.diagnosis}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-600 animate-pulse">&gt; Processing telemetry batch...</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}