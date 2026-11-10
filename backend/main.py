import asyncio
import json
import os
import pandas as pd
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ai_agent import run_ai_flight_surgeon

app = FastAPI(
    title="AstroPulse Telemetry & AI Surgeon Engine",
    description="Real-time physiological telemetry backend for NASA Space Apps Challenge 2026",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET_PATH = os.path.join(os.path.dirname(__file__), "5_SS.csv")
try:
    df = pd.read_csv(DATASET_PATH)
    print(f"[SUCCESS] Loaded NASA dataset '5_SS.csv' with {len(df)} telemetry rows.")
except Exception as e:
    print(f"[WARNING] Could not load 5_SS.csv ({e}). Generating fallback stream.")
    df = pd.DataFrame([
        {"TimeSecs": i * 1.0, "ECG": 650 + (i % 50), "GSR": 790 + (i % 40), "Event": 1 if i % 15 == 0 else 0}
        for i in range(120)
    ])

@app.get("/")
def read_root():
    return {
        "system": "AstroPulse Engine",
        "status": "ONLINE",
        "websocket_endpoint": "/ws/telemetry",
        "dataset_rows": len(df)
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    print("[WS CONNECTED] Client connected to live telemetry stream.")
    
    try:
        while True:
            for index, row in df.iterrows():
                metrics = row.fillna(0).to_dict()
                
                time_sec = float(metrics.get('TimeSecs', index * 1.0))
                ecg_val = float(metrics.get('ECG', 0))
                gsr_val = float(metrics.get('GSR', 0))
                event_val = int(metrics.get('Event', 0))
                
                hr = int(72 + (abs(ecg_val) % 45))
                spo2 = int(97 - (index % 3))
                
                # Execute AI Flight Surgeon evaluation
                ai_log = run_ai_flight_surgeon({
                    "heart_rate": hr,
                    "spo2": spo2,
                    "gsr": gsr_val,
                    "timestamp": f"{time_sec:.1f}s"
                })

                system_status = "CRITICAL" if ai_log["triage_level"] == "RED" else ("WARNING" if ai_log["triage_level"] == "AMBER" else "NORMAL")
                active_alerts = []
                if system_status != "NORMAL":
                    active_alerts.append(ai_log["diagnosis"])

                payload = {
                    "timestamp": f"{time_sec:.1f}s",
                    "heart_rate": hr,
                    "spo2": spo2,
                    "ecg": round(ecg_val, 2),
                    "gsr": round(gsr_val, 2),
                    "system_status": system_status,
                    "active_alerts": active_alerts,
                    "ai_surgeon_log": json.dumps(ai_log)
                }

                await websocket.send_json(payload)
                await asyncio.sleep(1)

    except WebSocketDisconnect:
        print("[WS DISCONNECTED] Client closed connection.")
    except Exception as e:
        print(f"[WS ERROR] Unexpected exception: {e}")