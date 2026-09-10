import os
import joblib
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.joblib")

class SubsidenceRiskPredictor:
    def __init__(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            self.model = None

    def predict_risk(self, tilt_x, tilt_y, tilt_mag, vib_rms, disp_mm, crack_detected, neighbour_anomalies):
        if not self.model:
            # Rule fallback
            if tilt_mag > 5.0 or disp_mm > 15.0 or crack_detected:
                return "CRITICAL", 0.90
            elif tilt_mag > 2.5 or disp_mm > 6.0:
                return "WARNING", 0.60
            return "SAFE", 0.05

        df = pd.DataFrame([{
            "tilt_x_deg": tilt_x,
            "tilt_y_deg": tilt_y,
            "tilt_magnitude_deg": tilt_mag,
            "vibration_rms": vib_rms,
            "displacement_mm": disp_mm,
            "crack_detected": int(crack_detected),
            "neighbour_anomaly_count": neighbour_anomalies
        }])

        pred_class = self.model.predict(df)[0]
        probs = self.model.predict_proba(df)[0]
        max_prob = float(probs[pred_class])

        class_map = {0: "SAFE", 1: "WARNING", 2: "CRITICAL"}
        return class_map[pred_class], round(max_prob, 2)

if __name__ == "__main__":
    predictor = SubsidenceRiskPredictor()
    label, score = predictor.predict_risk( tilt_x=5.2, tilt_y=4.1, tilt_mag=6.6, vib_rms=0.9, disp_mm=16.5, crack_detected=True, neighbour_anomalies=2)
    print(f"Sample Inference Result: Class={label}, Probability={score}")
    print("Label: Synthetic dataset validation — not field prediction accuracy.")
