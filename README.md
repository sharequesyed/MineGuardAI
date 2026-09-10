# MineGuard-AI — Surface Subsidence Monitoring & Early-Warning System
**Smart India Hackathon 2026 — Problem Statement SIH26025**

> [!NOTE]
> **STUDENT PROTOTYPE PLATFORM NOTICE**: MineGuard-AI is a student prototype platform designed toward a scalable field architecture for surface mine subsidence monitoring. It does not possess mine certification, intrinsic safety ratings, environmental qualification, or field-validated collapse prediction accuracy.

---

## Executive Summary

MineGuard-AI is an AI-assisted, low-cost, real-time surface mine subsidence monitoring, prediction, and early-warning platform for underground coal mines. Designed for deployment on the **SURFACE ABOVE underground coal panels** (not underground tunnels), the system utilizes 4 prototype wireless surface sensor nodes (N1–N4), an ESP32 multi-hop relay gateway, an offline-first PWA frontend with Web Serial API support, a FastAPI backend with a demonstration ML risk engine, and comprehensive hardware/firmware specifications.

---

## Key System Architecture & Innovations

1. **Wireless Surface Multi-Hop Relay Network**: Distributed low-cost ESP32 surface nodes measuring tilt ($X/Y$ inclination), vibration RMS/trend, relative displacement delta between surface node links (N1–N2, N2–N3, N3–N4, N1–N4), and crack continuity.
2. **Direct Hardware Connection (Web Serial API)**: Presentation laptops connect directly to the ESP32 Gateway over USB via Web Serial API without requiring local Python or Node.js installations.
3. **PWA & Offline-First Storage**: Full Progressive Web App supporting service worker application-shell caching and IndexedDB offline queue synchronization.
4. **Interactive GIS & Risk Heatmap**: Leaflet map displaying surface panel boundaries, node coordinates, relative displacement links, deformation heatmaps, and spatial risk polygons via Turf.js.
5. **Demonstration ML Engine**: Spatial-temporal feature extraction with scikit-learn Random Forest model trained on a synthetic dataset for demonstration risk classification (SAFE, WARNING, CRITICAL).

---

## Project Structure

```
MineGuard-AI/
├── frontend/             # React + Vite + TypeScript PWA (Tailwind CSS, Leaflet, Recharts)
├── backend/              # FastAPI Python backend (SQLite, WebSockets, REST APIs)
├── ml/                   # Scikit-learn demonstration ML pipeline & synthetic dataset generator
├── firmware/             # ESP32 C++ firmware (sensor-node & gateway with multi-hop relay)
├── hardware/             # BOM, Pin Mapping, Calibration, and docx manual generator
└── docs/                 # System architecture, communication protocols, demo procedures
```

---

## Quick Start & Development Setup

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. Connect ESP32 Gateway over USB and click **[ Connect Hardware ]** $\rightarrow$ **Web Serial**.

### 2. Backend & ML Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
To generate the synthetic ML dataset and train the demonstration model:
```bash
cd ml
python generate_synthetic_dataset.py
python train_risk_model.py
```

### 3. Hardware Manual Generation
```bash
cd hardware
python build_docx_manual.py
```
This builds `hardware/MineGuard-AI_Hardware_Manual.docx` with 32 comprehensive assembly chapters.

---

## Status & Capabilities Audit

Refer to [SYSTEM_CAPABILITIES.md](file:///c:/Shareque%20Coding/Mine_Guard_AI/docs/SYSTEM_CAPABILITIES.md) for the complete 5-tier capability audit (`IMPLEMENTED`, `SIMULATED`, `REQUIRES CONFIGURATION`, `REQUIRES HARDWARE TESTING`, `NOT IMPLEMENTED`).
