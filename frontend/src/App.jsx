import { useState, useEffect } from 'react'

function App() {
  const [telemetry, setTelemetry] = useState({
    time: "00:00",
    heart_rate: 0,
    blood_pressure_sys: 0,
    blood_sugar: 0
  });
  const [alert, setAlert] = useState(null);
  const [wsStatus, setWsStatus] = useState("Connecting...");

  useEffect(() => {
    // Connect to your FastAPI backend
    const ws = new WebSocket("ws://localhost:8000/ws/telemetry");

    ws.onopen = () => setWsStatus("Connected to AstroPulse");
    ws.onclose = () => setWsStatus("Disconnected");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.metrics) {
        setTelemetry(data.metrics);
      }
      // If the backend sends a system alert based on NASA-STD-3001, capture it
      if (data.system_alert) {
        setAlert(data.system_alert);
      } else {
        setAlert(null); // Clear alert if normal
      }
    };

    // Cleanup connection when component unmounts
    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold tracking-wider text-blue-400">ASTROPULSE COMMAND</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${wsStatus === "Connected to AstroPulse" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {wsStatus}
        </span>
      </header>

      {/* Critical Alert Banner */}
      {alert && (
        <div className="bg-red-600/90 border border-red-400 text-white px-6 py-4 rounded-md mb-8 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          <h2 className="font-bold text-xl uppercase">⚠ Medical Anomaly Detected</h2>
          <p>{alert}</p>
          {/* Meththani's AI Agent will eventually inject treatment suggestions here */}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Heart Rate</h3>
          <p className="text-4xl font-light">{telemetry.heart_rate} <span className="text-lg text-slate-500">BPM</span></p>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Blood Pressure (SYS)</h3>
          <p className="text-4xl font-light">{telemetry.blood_pressure_sys} <span className="text-lg text-slate-500">mmHg</span></p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Mission Time</h3>
          <p className="text-4xl font-light">{telemetry.time}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Placeholder for Mandy's UI */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 min-h-[400px] flex items-center justify-center">
          <p className="text-slate-500">[ Mandy's Interactive Human Body UI Goes Here ]</p>
        </div>

        {/* Placeholder for Hariharane's Charts */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 min-h-[400px] flex items-center justify-center">
          <p className="text-slate-500">[ Hariharane's Dynamic Recharts Go Here ]</p>
        </div>
      </div>
    </div>
  )
}

export default App