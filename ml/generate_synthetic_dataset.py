import os
import csv
import random
import math

os.makedirs(os.path.join(os.path.dirname(__file__), "datasets"), exist_ok=True)
CSV_PATH = os.path.join(os.path.dirname(__file__), "datasets", "synthetic_mine_subsidence.csv")

def generate_dataset(num_samples=1000):
    headers = [
        "node_id", "tilt_x_deg", "tilt_y_deg", "tilt_magnitude_deg", 
        "vibration_rms", "displacement_mm", "crack_detected", 
        "neighbour_anomaly_count", "risk_label"
    ]

    rows = []
    # 0 = SAFE, 1 = WARNING, 2 = CRITICAL

    for i in range(num_samples):
        node_id = f"N0{random.randint(1, 4)}"
        scenario_type = random.choices(["SAFE", "WARNING", "CRITICAL"], weights=[0.5, 0.3, 0.2])[0]

        if scenario_type == "SAFE":
            tilt_x = round(random.uniform(-0.8, 0.8), 2)
            tilt_y = round(random.uniform(-0.8, 0.8), 2)
            vib_rms = round(random.uniform(0.02, 0.15), 3)
            disp = round(random.uniform(0.0, 2.5), 1)
            crack = 0
            neighbours = random.choice([0, 0, 1])
            label = 0

        elif scenario_type == "WARNING":
            tilt_x = round(random.uniform(1.5, 3.8), 2)
            tilt_y = round(random.uniform(1.0, 3.2), 2)
            vib_rms = round(random.uniform(0.2, 0.6), 3)
            disp = round(random.uniform(3.5, 9.0), 1)
            crack = random.choice([0, 0, 1])
            neighbours = random.choice([1, 2])
            label = 1

        else: # CRITICAL
            tilt_x = round(random.uniform(4.5, 9.0), 2)
            tilt_y = round(random.uniform(3.5, 8.0), 2)
            vib_rms = round(random.uniform(0.7, 2.1), 3)
            disp = round(random.uniform(11.0, 35.0), 1)
            crack = random.choice([1, 1, 0])
            neighbours = random.choice([2, 3])
            label = 2

        tilt_mag = round(math.sqrt(tilt_x**2 + tilt_y**2), 2)

        rows.append([
            node_id, tilt_x, tilt_y, tilt_mag, 
            vib_rms, disp, crack, neighbours, label
        ])

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["# MineGuard-AI Synthetic Surface Subsidence Dataset (SIH26025 Demonstration Dataset)"])
        writer.writerow(["# DISCLAIMER: Synthetic dataset validation — not field prediction accuracy."])
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"Synthetic dataset generated successfully at {CSV_PATH} ({num_samples} samples).")

if __name__ == "__main__":
    generate_dataset()
