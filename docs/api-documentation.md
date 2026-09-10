# MineGuard-AI — REST & WebSocket API Documentation

---

## REST Endpoints

### 1. Ingest Node Telemetry
- **Endpoint**: `POST /api/v1/telemetry`
- **Payload**: Canonical `NodeTelemetrySchema` JSON object.
- **Response**: `{"status": "SUCCESS", "node_id": "N03", "sequence": 1002}`

### 2. Get Latest Telemetry
- **Endpoint**: `GET /api/v1/telemetry/latest`
- **Response**: Array of latest node telemetry objects.

### 3. Sync Offline Queue
- **Endpoint**: `POST /api/v1/sync`
- **Payload**: `{"items": [NodeTelemetrySchema, ...]}`
- **Response**: `{"status": "SUCCESS", "synced_count": N}`

### 4. Get Safety Alerts Log
- **Endpoint**: `GET /api/v1/alerts`
- **Response**: Array of system alert objects.

### 5. Acknowledge Safety Alert
- **Endpoint**: `POST /api/v1/alerts/{alert_id}/ack`
- **Response**: `{"status": "SUCCESS", "alert_id": alert_id}`

### 6. Get AI Risk Assessment
- **Endpoint**: `GET /api/v1/risk`
- **Response**:
```json
{
  "risk_level": "WARNING",
  "risk_score": 0.55,
  "affected_nodes": ["N3"],
  "primary_factor": "N3 moderate surface tilt",
  "model_type": "RANDOM_FOREST_DEMO",
  "dataset_label": "Synthetic dataset validation — not field prediction accuracy",
  "calculated_at": "NOW"
}
```

---

## WebSocket Stream

- **Endpoint**: `ws://localhost:8000/ws/telemetry`
- **Protocol**: Real-time JSON broadcast of incoming telemetry objects.
