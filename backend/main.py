from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
import sqlite3

from schemas import NodeTelemetrySchema, SyncPayloadSchema, AlertAckSchema, AIRiskResponseSchema
from database import init_db, get_db

app = FastAPI(
    title="MineGuard-AI Surface Subsidence Monitoring Backend",
    version="1.0.0",
    description="FastAPI Backend for SIH26025 Student Prototype Platform"
)

# CORS middleware for local frontend & Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory latest telemetry cache
latest_telemetry_cache: Dict[str, dict] = {}
active_websockets: List[WebSocket] = []

@app.on_event("startup")
def startup_event():
    init_db()
    print("[FastAPI] MineGuard-AI backend initialized.")

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "service": "MineGuard-AI FastAPI Backend",
        "version": "1.0.0",
        "disclaimer": "Student prototype platform — SIH26025"
    }

@app.post("/api/v1/telemetry")
async def ingest_telemetry(payload: NodeTelemetrySchema):
    conn = get_db()
    cursor = conn.cursor()
    
    packet_id = payload.relay_header.packet_id if payload.relay_header else f"PKT_{payload.sequence}_{payload.node_id}"
    relay = payload.relay_header.current_relay if payload.relay_header else "GW01"

    cursor.execute("""
        INSERT INTO telemetry (node_id, tilt_x_deg, tilt_y_deg, tilt_magnitude_deg, vibration_rms, displacement_mm, crack_detected, battery_percent, signal_strength, sequence, status, packet_id, current_relay)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.node_id, payload.tilt_x_deg, payload.tilt_y_deg, payload.tilt_magnitude_deg,
        payload.vibration_rms, payload.displacement_mm, int(payload.crack_detected),
        payload.battery_percent, payload.signal_strength, payload.sequence, payload.status,
        packet_id, relay
    ))
    conn.commit()
    conn.close()

    latest_telemetry_cache[payload.node_id] = payload.dict()

    # Broadcast to connected WebSockets
    for ws in active_websockets:
        try:
            await ws.send_json(payload.dict())
        except Exception:
            pass

    return {"status": "SUCCESS", "node_id": payload.node_id, "sequence": payload.sequence}

@app.get("/api/v1/telemetry/latest")
def get_latest_telemetry():
    return list(latest_telemetry_cache.values())

@app.post("/api/v1/sync")
async def sync_offline_queue(payload: SyncPayloadSchema):
    synced_count = 0
    for item in payload.items:
        await ingest_telemetry(item)
        synced_count += 1
    return {"status": "SUCCESS", "synced_count": synced_count}

@app.get("/api/v1/alerts")
def get_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/v1/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "alert_id": alert_id}

@app.get("/api/v1/risk", response_model=AIRiskResponseSchema)
def get_risk_assessment():
    nodes = list(latest_telemetry_cache.values())
    if not nodes:
        return AIRiskResponseSchema(
            risk_level="SAFE",
            risk_score=0.05,
            affected_nodes=[],
            primary_factor="No surface node telemetry cached yet.",
            model_type="RANDOM_FOREST_DEMO",
            dataset_label="Synthetic dataset validation — not field prediction accuracy",
            calculated_at="NOW"
        )

    max_score = 0.05
    affected = []
    factors = []

    for n in nodes:
        t_mag = n.get("tilt_magnitude_deg", 0.0)
        disp = n.get("displacement_mm", 0.0)
        crack = n.get("crack_detected", False)
        node_id = n.get("node_id", "N00")

        if t_mag > 5.0 or disp > 15.0 or crack:
            max_score = max(max_score, 0.90)
            affected.append(node_id)
            factors.append(f"{node_id} critical surface deformation (Tilt: {t_mag}°, Disp: {disp}mm)")
        elif t_mag > 2.5 or disp > 6.0:
            max_score = max(max_score, 0.55)
            affected.append(node_id)
            factors.append(f"{node_id} moderate tilt/displacement")

    level = "CRITICAL" if max_score >= 0.80 else "WARNING" if max_score >= 0.50 else "SAFE"
    primary = "; ".join(factors) if factors else "All surface sensor metrics normal."

    return AIRiskResponseSchema(
        risk_level=level,
        risk_score=round(max_score, 2),
        affected_nodes=list(set(affected)),
        primary_factor=primary,
        model_type="RANDOM_FOREST_DEMO",
        dataset_label="Synthetic dataset validation — not field prediction accuracy",
        calculated_at="NOW"
    )

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Heartbeat check
    except WebSocketDisconnect:
        active_websockets.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
