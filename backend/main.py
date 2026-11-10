import asyncio
import pandas as pd
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow Sin's frontend dev server to connect to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fallback mock data until you link the actual NASA CSV dataset
df = pd.DataFrame([
    {"time": "00:01", "heart_rate": 72, "blood_pressure_sys": 120, "blood_sugar": 90},
    {"time": "00:02", "heart_rate": 105, "blood_pressure_sys": 130, "blood_sugar": 88}, # Triggers HR alert
    {"time": "00:03", "heart_rate": 75, "blood_pressure_sys": 122, "blood_sugar": 91}
])

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    print("Frontend connected to telemetry stream.")
    
    try:
        # Loop through the dataset to simulate a live stream
        for index, row in df.iterrows():
            telemetry_data = row.fillna(0).to_dict()
            
            # Basic threshold logic (To be expanded using NASA-STD-3001)
            alert = None
            if telemetry_data.get('heart_rate', 0) > 100: 
                alert = "WARNING: Heart rate exceeds operational threshold."

            payload = {
                "status": "active",
                "metrics": telemetry_data,
                "system_alert": alert
            }
            
            await websocket.send_json(payload)
            await asyncio.sleep(1) # Broadcast at 1Hz
            
    except WebSocketDisconnect:
        print("Frontend disconnected.")