"""
Automated Comprehensive Test Suite for AstroPulse AI Agent & Fallback Engine.
Tests all 14 required cases for Prompt 4 Phase 4, plus boundary conditions and dataset regression tests.
"""
import sys
import os
import csv
import unittest
from unittest.mock import MagicMock, patch

# Ensure backend directory is in path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from ai_agent import run_ai_flight_surgeon, enforce_two_sentences

class TestAIAgentAndPayload(unittest.TestCase):

    def setUp(self):
        # Guarantee clean environment without API key by default
        self.patcher = patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def count_sentences(self, text: str) -> int:
        if not text:
            return 0
        import re
        pattern = r"(?<!\be\.g)(?<!\bi\.e)(?<!\bvs)(?<!\bDr)(?<!\bMr)(?<!\bMs)(?<!\d)(?<=[.!?])\s+(?=[A-Z0-9\[\(\"])"
        tokens = [s.strip() for s in re.split(pattern, text) if s.strip()]
        return len(tokens)

    # 1. GREEN fallback
    def test_01_green_fallback(self):
        telem = {"heart_rate": 72, "spo2": 98, "gsr": 780, "timestamp": "10.0s"}
        res = run_ai_flight_surgeon(telem)
        self.assertEqual(res["triage_level"], "GREEN")
        self.assertEqual(res["agent"], "AstroPulse-RuleSurgeon-v1")
        self.assertIn("NOMINAL", res["diagnosis"])
        self.assertLessEqual(self.count_sentences(res["diagnosis"]), 2)

    # 2. AMBER fallback
    def test_02_amber_fallback(self):
        telem = {"heart_rate": 98, "spo2": 95, "gsr": 810, "timestamp": "12.0s"}
        res = run_ai_flight_surgeon(telem)
        self.assertEqual(res["triage_level"], "AMBER")
        self.assertEqual(res["agent"], "AstroPulse-RuleSurgeon-v1")
        self.assertIn("MODERATE ELEVATION", res["diagnosis"])
        self.assertLessEqual(self.count_sentences(res["diagnosis"]), 2)

    # 3. RED fallback
    def test_03_red_fallback(self):
        telem = {"heart_rate": 112, "spo2": 91, "gsr": 850, "timestamp": "14.0s"}
        res = run_ai_flight_surgeon(telem)
        self.assertEqual(res["triage_level"], "RED")
        self.assertEqual(res["agent"], "AstroPulse-RuleSurgeon-v1")
        self.assertIn("CRITICAL ANOMALY", res["diagnosis"])
        self.assertLessEqual(self.count_sentences(res["diagnosis"]), 2)

    # 4. Missing Gemini API key
    def test_04_missing_gemini_api_key(self):
        with patch("ai_agent.GEMINI_API_KEY", ""):
            res = run_ai_flight_surgeon({"heart_rate": 80, "spo2": 97, "gsr": 790, "timestamp": "1.0s"})
            self.assertEqual(res["agent"], "AstroPulse-RuleSurgeon-v1")
            self.assertEqual(res["triage_level"], "GREEN")

    # 5. Gemini API failure
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_05_gemini_api_failure(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = RuntimeError("Quota exceeded or connection error")
        mock_client_cls.return_value = mock_client

        res = run_ai_flight_surgeon({"heart_rate": 110, "spo2": 92, "gsr": 840, "timestamp": "2.0s"})
        self.assertEqual(res["agent"], "AstroPulse-RuleSurgeon-v1")
        self.assertEqual(res["triage_level"], "RED")
        self.assertLessEqual(self.count_sentences(res["diagnosis"]), 2)

    # 6. Empty Gemini response
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_06_empty_gemini_response(self, mock_client_cls):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "   "
        mock_client.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_client

        res = run_ai_flight_surgeon({"heart_rate": 75, "spo2": 98, "gsr": 790, "timestamp": "3.0s"})
        self.assertEqual(res["triage_level"], "GREEN")
        # Should gracefully use default diagnosis with <= 2 sentences
        self.assertLessEqual(self.count_sentences(res["diagnosis"]), 2)
        self.assertTrue(len(res["diagnosis"]) > 0)

    # 7. One-sentence response
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_07_one_sentence_response(self, mock_client_cls):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Biometrics remain stable within normal spaceflight limits."
        mock_client.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_client

        res = run_ai_flight_surgeon({"heart_rate": 75, "spo2": 98, "gsr": 790, "timestamp": "4.0s"})
        self.assertEqual(res["agent"], "AstroPulse-Gemini-Surgeon-v1")
        self.assertEqual(res["diagnosis"], "Biometrics remain stable within normal spaceflight limits.")
        self.assertEqual(self.count_sentences(res["diagnosis"]), 1)

    # 8. Two-sentence response
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_08_two_sentence_response(self, mock_client_cls):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Elevated autonomic response observed. Recommend task pacing mitigation."
        mock_client.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_client

        res = run_ai_flight_surgeon({"heart_rate": 96, "spo2": 96, "gsr": 810, "timestamp": "5.0s"})
        self.assertEqual(res["agent"], "AstroPulse-Gemini-Surgeon-v1")
        self.assertEqual(res["triage_level"], "AMBER")
        self.assertEqual(self.count_sentences(res["diagnosis"]), 2)

    # 9. Three-sentence response (truncated to max two sentences)
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_09_three_sentence_response(self, mock_client_cls):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Sentence one is here. Sentence two follows immediately. Sentence three must be truncated completely."
        mock_client.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_client

        res = run_ai_flight_surgeon({"heart_rate": 115, "spo2": 91, "gsr": 860, "timestamp": "6.0s"})
        self.assertEqual(res["agent"], "AstroPulse-Gemini-Surgeon-v1")
        self.assertEqual(res["diagnosis"], "Sentence one is here. Sentence two follows immediately.")
        self.assertEqual(self.count_sentences(res["diagnosis"]), 2)

    # 10. Long Gemini response (preserves abbreviations and decimals, enforces <= 2)
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_10_long_gemini_response(self, mock_client_cls):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = (
            "Telemetry shows SpO2 at 98.2% and HR at 75.0 BPM (e.g. within baseline). "
            "Continue standard flight crew monitoring per operational flight rules. "
            "Additional sentence four here. Fifth sentence should not appear."
        )
        mock_client.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_client

        res = run_ai_flight_surgeon({"heart_rate": 75, "spo2": 98, "gsr": 790, "timestamp": "7.0s"})
        self.assertEqual(res["agent"], "AstroPulse-Gemini-Surgeon-v1")
        self.assertEqual(self.count_sentences(res["diagnosis"]), 2)
        self.assertIn("98.2%", res["diagnosis"])
        self.assertIn("e.g. within baseline", res["diagnosis"])
        self.assertNotIn("Fifth sentence", res["diagnosis"])

    # 11. Invalid response format (None, unexpected types)
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_11_invalid_response_format(self, mock_client_cls):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = None
        mock_client.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_client

        res = run_ai_flight_surgeon({"heart_rate": 80, "spo2": 97, "gsr": 790, "timestamp": "8.0s"})
        self.assertLessEqual(self.count_sentences(res["diagnosis"]), 2)
        self.assertTrue(len(res["diagnosis"]) > 0)

    # 12. Missing telemetry fields (uses default values without throwing exception)
    def test_12_missing_telemetry_fields(self):
        res = run_ai_flight_surgeon({})
        self.assertEqual(res["triage_level"], "GREEN")
        self.assertLessEqual(self.count_sentences(res["diagnosis"]), 2)

        res_none = run_ai_flight_surgeon(None)
        self.assertEqual(res_none["triage_level"], "GREEN")
        self.assertLessEqual(self.count_sentences(res_none["diagnosis"]), 2)

    # 13. Exact four-field schema
    def test_13_exact_four_field_schema(self):
        res = run_ai_flight_surgeon({"heart_rate": 110, "spo2": 90, "gsr": 850, "timestamp": "9.0s"})
        expected_keys = {"agent", "triage_level", "diagnosis", "timestamp"}
        self.assertEqual(set(res.keys()), expected_keys)
        self.assertIsInstance(res["agent"], str)
        self.assertIsInstance(res["triage_level"], str)
        self.assertIsInstance(res["diagnosis"], str)
        self.assertIsInstance(res["timestamp"], str)
        self.assertIn(res["triage_level"], ["GREEN", "AMBER", "RED"])

    # 14. Triage classification preservation (Gemini cannot override rule engine level)
    @patch("ai_agent.GEMINI_AVAILABLE", True)
    @patch("ai_agent.GEMINI_API_KEY", "mock-fake-key")
    @patch("ai_agent.genai.Client")
    def test_14_triage_classification_preservation(self, mock_client_cls):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Astronaut is completely fine. No interventions needed."
        mock_client.models.generate_content.return_value = mock_response
        mock_client_cls.return_value = mock_client

        # HR = 120 (RED by rule engine)
        res = run_ai_flight_surgeon({"heart_rate": 120, "spo2": 90, "gsr": 860, "timestamp": "10.0s"})
        self.assertEqual(res["triage_level"], "RED")
        self.assertEqual(res["agent"], "AstroPulse-Gemini-Surgeon-v1")


class TestBoundaryConditions(unittest.TestCase):
    """
    Validates exact threshold boundary points:
    RED: HR > 108 OR GSR > 835
    AMBER: HR > 95 OR GSR > 805
    GREEN: otherwise
    """

    def setUp(self):
        self.patcher = patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_boundary_hr95_gsr805(self):
        # HR=95 (not >95), GSR=805 (not >805) -> GREEN
        res = run_ai_flight_surgeon({"heart_rate": 95, "gsr": 805})
        self.assertEqual(res["triage_level"], "GREEN")

    def test_boundary_hr96_gsr790(self):
        # HR=96 (>95) -> AMBER
        res = run_ai_flight_surgeon({"heart_rate": 96, "gsr": 790})
        self.assertEqual(res["triage_level"], "AMBER")

    def test_boundary_hr108_gsr790(self):
        # HR=108 (not >108), but HR=108 (>95) -> AMBER
        res = run_ai_flight_surgeon({"heart_rate": 108, "gsr": 790})
        self.assertEqual(res["triage_level"], "AMBER")

    def test_boundary_hr109_gsr790(self):
        # HR=109 (>108) -> RED
        res = run_ai_flight_surgeon({"heart_rate": 109, "gsr": 790})
        self.assertEqual(res["triage_level"], "RED")

    def test_boundary_hr75_gsr805(self):
        # HR=75, GSR=805 (not >805) -> GREEN
        res = run_ai_flight_surgeon({"heart_rate": 75, "gsr": 805})
        self.assertEqual(res["triage_level"], "GREEN")

    def test_boundary_hr75_gsr806(self):
        # HR=75, GSR=806 (>805) -> AMBER
        res = run_ai_flight_surgeon({"heart_rate": 75, "gsr": 806})
        self.assertEqual(res["triage_level"], "AMBER")

    def test_boundary_hr75_gsr835(self):
        # HR=75, GSR=835 (not >835, but >805) -> AMBER
        res = run_ai_flight_surgeon({"heart_rate": 75, "gsr": 835})
        self.assertEqual(res["triage_level"], "AMBER")

    def test_boundary_hr75_gsr836(self):
        # HR=75, GSR=836 (>835) -> RED
        res = run_ai_flight_surgeon({"heart_rate": 75, "gsr": 836})
        self.assertEqual(res["triage_level"], "RED")


class TestDatasetRegression(unittest.TestCase):
    """
    Validates dataset row counts and rule-engine classifications
    using the deterministic offline path against 5_SS.csv, 5_DA.csv, and 5_CA.csv.
    """

    def setUp(self):
        self.patcher = patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def process_csv(self, filename):
        path = os.path.join(current_dir, filename)
        counts = {"GREEN": 0, "AMBER": 0, "RED": 0}
        total = 0
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader)
            col_map = {col: i for i, col in enumerate(header)}
            for idx, row in enumerate(reader):
                if not row:
                    continue
                total += 1
                ecg_val = float(row[col_map["ECG"]]) if "ECG" in col_map and row[col_map["ECG"]] else 0.0
                gsr_val = float(row[col_map["GSR"]]) if "GSR" in col_map and row[col_map["GSR"]] else 0.0
                hr = int(72 + (abs(ecg_val) % 45))
                spo2 = int(97 - (idx % 3))
                res = run_ai_flight_surgeon({"heart_rate": hr, "spo2": spo2, "gsr": gsr_val, "timestamp": "0.0s"})
                counts[res["triage_level"]] += 1
        return total, counts

    def test_primary_dataset_5_ss(self):
        total, counts = self.process_csv("5_SS.csv")
        self.assertEqual(total, 39563)
        self.assertEqual(counts["GREEN"], 10773)
        self.assertEqual(counts["AMBER"], 8606)
        self.assertEqual(counts["RED"], 20184)
        self.assertEqual(sum(counts.values()), total)

    def test_compatibility_dataset_5_da(self):
        total, counts = self.process_csv("5_DA.csv")
        self.assertEqual(total, 92077)
        self.assertEqual(counts["GREEN"], 92077)
        self.assertEqual(counts["AMBER"], 0)
        self.assertEqual(counts["RED"], 0)
        self.assertEqual(sum(counts.values()), total)

    def test_compatibility_dataset_5_ca(self):
        total, counts = self.process_csv("5_CA.csv")
        self.assertEqual(total, 92131)
        self.assertEqual(counts["GREEN"], 20868)
        self.assertEqual(counts["AMBER"], 22891)
        self.assertEqual(counts["RED"], 48372)
        self.assertEqual(sum(counts.values()), total)


if __name__ == "__main__":
    unittest.main()
