import os
import json

# Attempt to load Google GenAI SDK if installed; fallback gracefully if offline
try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def run_ai_flight_surgeon(telemetry_data: dict) -> dict:
    """
    Evaluates real-time physiological metrics using Google Gemini / Rule Engine 
    according to NASA-STD-3001 spaceflight health standards.
    """
    hr = telemetry_data.get("heart_rate", 75)
    spo2 = telemetry_data.get("spo2", 98)
    gsr = telemetry_data.get("gsr", 790)
    time_stamp = telemetry_data.get("timestamp", "0s")

    # NASA-STD-3001 Baseline Rule Engine
    if hr > 108 or gsr > 835:
        triage_level = "RED"
        default_diagnosis = (
            f"CRITICAL ANOMALY [{time_stamp}]: Acute tachycardia ({hr} BPM) & autonomic stress surge ({gsr:.0f} GSR). "
            "NASA-STD-3001 breach. Protocol: Solicit crew status check & verify EVA O2 pressure."
        )
    elif hr > 95 or gsr > 805:
        triage_level = "AMBER"
        default_diagnosis = (
            f"MODERATE ELEVATION [{time_stamp}]: HR ({hr} BPM) shifted above baseline. "
            "Fatigue or physical strain detected. Protocol: Schedule non-critical task pause."
        )
    else:
        triage_level = "GREEN"
        default_diagnosis = f"NOMINAL [{time_stamp}]: Vitals steady (HR {hr} BPM, SpO₂ {spo2}%). All systems operational."

    # If Gemini API key is configured and SDK is available, run live LLM triage
    if GEMINI_AVAILABLE and GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            prompt = f"""
            You are the AstroPulse AI Flight Surgeon monitoring an astronaut on ISS Expedition 72.
            Evaluate these real-time biometrics against NASA-STD-3001 standards:
            - Timestamp: {time_stamp}
            - Heart Rate: {hr} BPM
            - SpO2 Level: {spo2}%
            - Galvanic Skin Response (GSR): {gsr}

            Provide a concise 2-sentence medical triage assessment and operational protocol.
            """
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response.text:
                return {
                    "agent": "AstroPulse-Gemini-Surgeon-v1",
                    "triage_level": triage_level,
                    "diagnosis": response.text.strip(),
                    "timestamp": time_stamp
                }
        except Exception as e:
            print(f"[AI AGENT FALLBACK] Gemini API skipped: {e}")

    # Fallback response ensures the stream never breaks if offline
    return {
        "agent": "AstroPulse-RuleSurgeon-v1",
        "triage_level": triage_level,
        "diagnosis": default_diagnosis,
        "timestamp": time_stamp
    }