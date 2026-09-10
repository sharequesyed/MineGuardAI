# MineGuard-AI — System Architecture Specification

---

## 1. Surface Deployment Topology

MineGuard-AI is designed for deployment on the **SURFACE GROUND LEVEL ABOVE underground coal panels**.

```
[ SURFACE MONITORING LEVEL ]
    N1 <====== displacement link ======> N2
    ||                                   ||
    ||                                   ||
    N4 <====== displacement link ======> N3
                   ||
         ESP-NOW Multi-Hop Relay
                   ||
             ESP32 Gateway (MG-GW-01)
                   ||
        +----------+----------+
        |                     |
   USB Serial API      Local Wi-Fi AP (192.168.4.1)
   (Presentation Path)   (Local Monitoring Fallback)

----------------------------------------------------
[ UNDERGROUND MINING LEVEL ]
(Coal Extraction Panels A-01 exist beneath monitored surface)
```

## 2. Shared Canonical Data Model

Single JSON telemetry schema shared across ESP32 Firmware $\rightarrow$ Gateway $\rightarrow$ Web Serial / MQTT $\rightarrow$ SQLite Database $\rightarrow$ ML Pipeline $\rightarrow$ React Frontend PWA:

```json
{
  "node_id": "N03",
  "tilt_x_deg": 2.41,
  "tilt_y_deg": 1.18,
  "tilt_magnitude_deg": 2.68,
  "vibration_rms": 0.34,
  "vibration_peak": 0.61,
  "vibration_variance": 0.034,
  "displacement_mm": 3.2,
  "crack_detected": false,
  "battery_percent": 84,
  "local_alarm": false,
  "signal_strength": -62,
  "sequence": 1234,
  "timestamp": "2026-09-10T22:00:00Z",
  "relay_header": {
    "packet_id": "PKT_1234_N03",
    "source_node": "N03",
    "current_relay": "GW01",
    "destination": "GW01",
    "hop_count": 1,
    "ttl": 9,
    "sequence": 1234
  }
}
```

## 3. Data Providers Architecture

```
                       [ React Frontend PWA ]
                                 |
                 +---------------+---------------+
                 |                               |
     HardwareDataProvider               SimulationEngine
                 |                               |
   +-------------+-------------+          (4 Scenarios)
   |                           |
WebSerialProvider        LocalGatewayProvider
(Direct USB Cable)        (AP 192.168.4.1)
```
