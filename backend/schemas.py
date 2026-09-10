from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MultiHopHeaderSchema(BaseModel):
    packet_id: str
    source_node: str
    current_relay: str
    destination: str = "GW01"
    hop_count: int = 1
    ttl: int = 9
    sequence: int

class NodeTelemetrySchema(BaseModel):
    node_id: str
    tilt_x_deg: float
    tilt_y_deg: float
    tilt_magnitude_deg: float
    vibration_rms: float
    vibration_peak: float = 0.0
    vibration_variance: float = 0.0
    displacement_mm: float
    crack_detected: bool = False
    battery_percent: int = 90
    local_alarm: bool = False
    signal_strength: int = -65
    sequence: int
    timestamp: Optional[str] = None
    relay_header: Optional[MultiHopHeaderSchema] = None
    status: str = "SAFE" # SAFE, WARNING, CRITICAL, OFFLINE
    lat: Optional[float] = 23.7580
    lng: Optional[float] = 86.4150

class SyncPayloadSchema(BaseModel):
    items: List[NodeTelemetrySchema]

class AlertAckSchema(BaseModel):
    alert_id: str
    acknowledged_by: str = "Operator"

class AIRiskResponseSchema(BaseModel):
    risk_level: str
    risk_score: float
    affected_nodes: List[str]
    primary_factor: str
    model_type: str = "RANDOM_FOREST_DEMO"
    dataset_label: str = "Synthetic dataset validation — not field prediction accuracy"
    calculated_at: str
