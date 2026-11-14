# AstroPulse — Autonomous Astronaut Health Monitoring & AI Flight Surgeon

Real-time astronaut biometric telemetry, holographic body/xEMU suit diagnostics, NASA Five Hazards risk assessment, and autonomous AI medical triage built for the **2026 NASA Space Apps Challenge** (*Create Health Monitoring Software for Astronauts on Space Missions*).

## Key Capabilities
- **Live Physiological Telemetry (FastAPI + WebSockets):** Streams heart rate (BPM), arterial oxygen saturation ($\text{SpO}_2$), blood pressure, core body temperature, suit pressure (`psid`), inspired $\text{pCO}_2$, and cumulative radiation dosimetry (`mSv`).
- **Interactive Holographic Body & xEMU Suit Scanner:** Clickable anatomical nodes (`BIO-01` to `BIO-05`) and spacesuit subsystems (`xEMU-01` to `xEMU-05`) with real-time fault isolation and stabilization protocols.
- **NASA HRP Five Hazards Live Matrix:** Evaluates Space Radiation, Isolation & Confinement, Distance from Earth, Gravity Fields, and Hostile/Closed Environments in real time.
- **Astronaut Daily Self-Assessment & Plain-Language Guides:** Enables crew to log daily sleep hours, blood glucose (`mg/dL`), mood/behavioral state, and symptoms with jargon-free guidance.
- **Autonomous AI Flight Surgeon (Groq LLaMA 3):** Generates clinical triage assessments and step-by-step countermeasures for deep-space missions with communication latency.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts (deployed on Vercel)
- **Backend:** Python, FastAPI, WebSockets, Groq LLaMA 3 API (deployed on Render)

## Data & Scientific References
- **NASA Human Research Program (HRP):** Five Hazards of Human Spaceflight & HRP-STD-3001 physiological thresholds
- **NASA Life Sciences Data Archive (LSDA):** Astronaut cardiovascular and cardiopulmonary baseline datasets
- **Canadian Space Agency (CSA):** Space radiation dosimetry and crew health monitoring guidelines