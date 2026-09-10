import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

DATASET_PATH = os.path.join(os.path.dirname(__file__), "datasets", "synthetic_mine_subsidence.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.joblib")

def train_model():
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found. Generating dataset first...")
        from generate_synthetic_dataset import generate_dataset
        generate_dataset()

    # Read CSV skipping header comments
    df = pd.read_csv(DATASET_PATH, comment="#")

    feature_cols = [
        "tilt_x_deg", "tilt_y_deg", "tilt_magnitude_deg", 
        "vibration_rms", "displacement_mm", "crack_detected", 
        "neighbour_anomaly_count"
    ]
    X = df[feature_cols]
    y = df["risk_label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("\n============================================================")
    print("MINEGUARD-AI DEMONSTRATION ML MODEL TRAINING RESULTS")
    print("============================================================")
    print(f"Model Type: Random Forest Classifier (n_estimators=100)")
    print(f"Synthetic Dataset Validation Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["SAFE (0)", "WARNING (1)", "CRITICAL (2)"]))
    print("------------------------------------------------------------")
    print("MANDATORY NOTICE: Synthetic dataset validation — not field prediction accuracy.")
    print("============================================================\n")

    joblib.dump(clf, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
