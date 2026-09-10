# MineGuard-AI — Demonstration ML Pipeline

> [!NOTE]
> **STUDENT PROTOTYPE NOTICE**: The Random Forest model in this directory is a demonstration model trained using a synthetic surface deformation dataset. All validation metrics must be explicitly labelled: `"Synthetic dataset validation — not field prediction accuracy"`.

---

## Overview

The AI/ML engine evaluates spatial-temporal surface deformation features collected from 4 surface sensor nodes deployed above underground coal panels.

### Features
1. `tilt_x_deg`: $X$-axis inclination (degrees)
2. `tilt_y_deg`: $Y$-axis inclination (degrees)
3. `tilt_magnitude_deg`: $\sqrt{\text{tilt}_x^2 + \text{tilt}_y^2}$
4. `vibration_rms`: Windowed surface vibration RMS ($g$)
5. `displacement_mm`: Relative displacement delta between surface points ($mm$)
6. `crack_detected`: Continuity line bridge status (0=intact, 1=broken)
7. `neighbour_anomaly_count`: Number of neighbouring surface nodes in non-safe states (spatial correlation feature)

---

## Running Dataset Generation & Model Training

```bash
cd ml
python generate_synthetic_dataset.py
python train_risk_model.py
```
