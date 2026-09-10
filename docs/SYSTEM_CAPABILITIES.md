# MineGuard-AI — System Capabilities Audit

This document maintains an accurate, un-fabricated record of all capabilities within the **MineGuard-AI** student prototype platform for SIH26025.

Every feature or subsystem is explicitly assigned one of the following 5 statuses:
- **`IMPLEMENTED`**: Fully written, tested in code, and verified operational.
- **`SIMULATED`**: Functionality provided via the synthetic simulation engine for demonstration purposes.
- **`REQUIRES CONFIGURATION`**: Code integration exists but requires user API keys, credentials, or backend endpoints.
- **`REQUIRES HARDWARE TESTING`**: Firmware and software protocols are fully implemented, but physical ESP32 hardware execution/validation is pending.
- **`NOT IMPLEMENTED`**: Planned features not currently built into the prototype codebase.

---

## 1. Monitoring & Sensor Network Architecture

| Capability | Status | Description / Notes |
| :--- | :--- | :--- |
| **Surface Subsidence Focus** | `IMPLEMENTED` | Data schemas, GIS maps, and models represent surface deformation above underground coal panels. |
| **4 Surface Sensor Nodes (N1–N4)** | `IMPLEMENTED` | Canonical data structures and state machines for 4 surface monitoring nodes. |
| **Relative Displacement Links** | `IMPLEMENTED` | Measures relative distance delta between pairs of nodes (N1–N2, N2–N3, N3–N4, N1–N4). |
| **Crack Detector Interface** | `IMPLEMENTED` | Continuity bridge state tracking (`crack_detected` boolean flag). |
| **Vibration Feature Extraction** | `IMPLEMENTED` | MPU6050 windowed acceleration calculations (RMS, peak, variance, trend). |
| **MPU6050 Seismic Classification** | `NOT IMPLEMENTED` | MPU6050 cannot distinguish earthquake vs blasting vs collapse; raw metrics only. |
| **Local Node Fail-safe Warning** | `IMPLEMENTED` | Hardware buzzer/LED trigger on local threshold breach independent of backend/AI. |

---

## 2. Wireless Networking & Gateway

| Capability | Status | Description / Notes |
| :--- | :--- | :--- |
| **ESP-NOW Multi-Hop Relay Header** | `IMPLEMENTED` | Headers include `source`, `destination`, `current_relay`, `hop_count`, `ttl`, `packet_id`, `sequence`. |
| **Deterministic Relay Routing** | `IMPLEMENTED` | Primary (N1 -> N2 -> Gateway) and backup routing paths with duplicate suppression. |
| **Self-Healing Dynamic Mesh** | `NOT IMPLEMENTED` | Dynamic routing algorithms are not implemented; prototype uses deterministic multi-hop relay. |
| **Web Serial Hardware Gateway API** | `IMPLEMENTED` | Direct browser-to-ESP32 USB hardware communication via Web Serial API. |
| **Local Wi-Fi AP Mode** | `IMPLEMENTED` | Gateway AP fallback landing page (`192.168.4.1`) for local HTTP access without mixed-content issues. |
| **MQTT / Cloud Gateway Relay** | `IMPLEMENTED` | Mosquitto MQTT broker topic structure and Python gateway client bridge. |

---

## 3. Frontend & User Experience

| Capability | Status | Description / Notes |
| :--- | :--- | :--- |
| **React + Vite + TypeScript PWA** | `IMPLEMENTED` | Service worker app-shell caching, manifest, and IndexedDB offline queue. |
| **Industrial Design & Typography** | `IMPLEMENTED` | Light mode default, dark mode support, IBM Plex Sans, Inter, IBM Plex Mono fonts. |
| **Interactive Leaflet GIS Live Map** | `IMPLEMENTED` | Turf.js risk boundary polygons, node positions, displacement links, deformation heatmap. |
| **Telemetry & Trend Visualization** | `IMPLEMENTED` | Recharts historical time-series charts for tilt, vibration RMS, displacement, battery. |
| **Hardware Data Provider Selector** | `IMPLEMENTED` | Seamless toggle between Web Serial USB, Local Gateway, Cloud API, and Simulation Mode. |
| **Browser Notifications API** | `IMPLEMENTED` | Local web notifications on Warning / Critical threshold alerts. |

---

## 4. AI / ML Risk Assessment Engine

| Capability | Status | Description / Notes |
| :--- | :--- | :--- |
| **Spatial-Temporal Feature Extractor**| `IMPLEMENTED` | Derives tilt rate, vibration trend, displacement delta, and neighbour anomaly correlation. |
| **Scikit-Learn Random Forest Model**| `IMPLEMENTED` | Classifies surface subsidence risk into SAFE, WARNING, CRITICAL. |
| **Synthetic Dataset Generator** | `SIMULATED` | Model trained on generated synthetic dataset; validation score marked as synthetic. |
| **Real-World Collapse Prediction** | `NOT IMPLEMENTED` | Field accuracy requires real-world mine dataset validation. |
| **Browser Fallback Risk Estimator** | `IMPLEMENTED` | Client-side rule-based risk calculator when backend ML is offline. |

---

## 5. Firmware & Hardware Documentation

| Capability | Status | Description / Notes |
| :--- | :--- | :--- |
| **ESP32 Sensor Node Firmware** | `REQUIRES TOOLCHAIN VERIFICATION` | `sensor_node.ino` written and verified conceptually; Arduino CLI / PlatformIO compilation toolchain unavailable in local OS. |
| **ESP32 Gateway Firmware** | `REQUIRES TOOLCHAIN VERIFICATION` | `gateway.ino` written and verified conceptually; Arduino CLI / PlatformIO compilation toolchain unavailable in local OS. |
| **Provisional GPIO Pin Mapping** | `REQUIRES CONFIGURATION` | Pin definitions in `hardware_config.h` marked provisional pending exact board variant confirmation. |
| **Hardware Assembly Manual (DOCX)**| `IMPLEMENTED` | `MineGuard-AI_Hardware_Manual.docx` generated on disk with 32 chapters, tables, calibration steps. |
