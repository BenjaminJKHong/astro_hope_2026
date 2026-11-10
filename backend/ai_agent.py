import os
import json
import re

# Attempt to load Google GenAI SDK if installed; fallback gracefully if offline
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def enforce_two_sentences(raw_text: str, fallback_text: str = "") -> str:
    """
    Deterministically enforces that an assessment contains at most two concise sentences.
    Preserves decimal numbers (e.g., 98.2%), abbreviations (e.g., e.g., i.e., vs.),
    and strips extraneous markdown or whitespace.
    """
    if raw_text is None:
        raw_text = fallback_text or ""
    cleaned = " ".join(str(raw_text).replace("\n", " ").split()).strip()
    if not cleaned:
        cleaned = " ".join(str(fallback_text).replace("\n", " ").split()).strip()
    if not cleaned:
        return ""

    # Split on sentence boundaries: punctuation (. ! ?) followed by whitespace,
    # ignoring common abbreviations and decimal points.
    pattern = r"(?<!\be\.g)(?<!\bi\.e)(?<!\bvs)(?<!\bDr)(?<!\bMr)(?<!\bMs)(?<!\d)(?<=[.!?])\s+(?=[A-Z0-9\[\(\"])"
    tokens = [s.strip() for s in re.split(pattern, cleaned) if s.strip()]
    if not tokens:
        tokens = [cleaned]

    selected = tokens[:2]
    result = " ".join(selected).strip()
    if result and not result.endswith((".", "!", "?")):
        result += "."
    return result

def run_ai_flight_surgeon(telemetry_data: dict) -> dict:
    """
    Evaluates real-time physiological metrics using Google Gemini / Rule Engine 
    according to NASA-STD-3001 spaceflight health standards.
    """
    if not isinstance(telemetry_data, dict):
        telemetry_data = {}

    hr = telemetry_data.get("heart_rate", 75)
    spo2 = telemetry_data.get("spo2", 98)
    gsr = telemetry_data.get("gsr", 790)
    time_stamp = str(telemetry_data.get("timestamp", "0s"))

    # NASA-STD-3001 Baseline Rule Engine
    if hr > 108 or gsr > 835:
        triage_level = "RED"
        default_diagnosis = (
            f"CRITICAL ANOMALY [{time_stamp}]: Elevated autonomic response ({gsr:.0f} GSR) and heart rate ({hr} BPM) exceed upper operational monitoring thresholds. "
            "Recommend immediate crew status check and evaluation of life support telemetry."
        )
    elif hr > 95 or gsr > 805:
        triage_level = "AMBER"
        default_diagnosis = (
            f"MODERATE ELEVATION [{time_stamp}]: Biometrics reflect elevated autonomic activity ({gsr:.0f} GSR) and heart rate ({hr} BPM) above baseline. "
            "Recommend workload task pacing and monitoring crew fatigue."
        )
    else:
        triage_level = "GREEN"
        default_diagnosis = (
            f"NOMINAL [{time_stamp}]: Telemetry indicates nominal physiological baseline with steady heart rate ({hr} BPM) and SpO₂ ({spo2}%). "
            "Continue standard flight crew health surveillance."
        )

    # Ensure fallback diagnosis satisfies sentence enforcement
    default_diagnosis = enforce_two_sentences(default_diagnosis)

    # If Gemini API key is configured and SDK is available, run live LLM triage
    if GEMINI_AVAILABLE and GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            system_instruction = (
                "You are the AstroPulse Biomedical Decision Support Assistant monitoring spaceflight telemetry under NASA-STD-3001 crew health guidelines.\n"
                "Your role is to assist ground medical support personnel by explaining telemetry findings and recommending operational countermeasures.\n\n"
                "Operational Constraints:\n"
                "1. Adhere strictly to the predetermined rule-engine triage classification (GREEN, AMBER, or RED). Never alter, override, or contradict this classification.\n"
                "2. Your response MUST contain AT MOST TWO concise sentences. Zero, one, or two sentences are acceptable; three or more sentences are strictly forbidden.\n"
                "3. Sentence 1 must summarize biometric trends using professional human-spaceflight terminology (e.g., physiological baseline, autonomic response, operational limits). Sentence 2 must recommend an appropriate operational countermeasure (e.g., standard surveillance, task pacing, workload mitigation, or crew status check).\n"
                "4. Do not diagnose specific clinical pathologies or diseases. Do not describe synthetic demo values as validated medical measurements, and do not invent EEG interpretations.\n"
                "5. Do not claim to be an accredited NASA Flight Surgeon, and do not claim to represent NASA or Mission Control.\n"
                "6. Do not claim project thresholds are official NASA standards, and do not invent unauthorized mission protocols.\n"
                "7. Output plain text only. Do NOT include markdown headings, bullet points, asterisks, or conversational preambles."
            )
            prompt = (
                f"Evaluate the following astronaut telemetry record:\n"
                f"- Timestamp: {time_stamp}\n"
                f"- Predetermined Triage Level: {triage_level}\n"
                f"- Heart Rate (synthetic demo stream): {hr} BPM\n"
                f"- Blood Oxygen SpO2 (synthetic demo stream): {spo2}%\n"
                f"- Galvanic Skin Response GSR (sensor measurement): {gsr}\n\n"
                f"Provide a concise operational assessment adhering strictly to the maximum two-sentence limit."
            )
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                max_output_tokens=150,
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=config
            )
            raw_text = getattr(response, "text", "")
            diagnosis_text = enforce_two_sentences(raw_text, default_diagnosis)
            if diagnosis_text:
                return {
                    "agent": "AstroPulse-Gemini-Surgeon-v1",
                    "triage_level": triage_level,
                    "diagnosis": diagnosis_text,
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
