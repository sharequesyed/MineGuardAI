export type SystemMode = 'USB_SERIAL' | 'LOCAL_GATEWAY' | 'CLOUD' | 'SIMULATION';

export type NodeStatus = 'SAFE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export type IncidentStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface MultiHopHeader {
  packet_id: string;
  source_node: string;
  current_relay: string;
  destination: string;
  hop_count: number;
  ttl: number;
  sequence: number;
  route_status: 'PRIMARY_ACTIVE' | 'BACKUP_ACTIVE' | 'RELAY_FAILED';
}

export interface NodeTelemetry {
  node_id: string;
  tilt_x_deg: number;
  tilt_y_deg: number;
  tilt_magnitude_deg: number;
  vibration_rms: number;
  vibration_peak: number;
  vibration_variance: number;
  displacement_mm: number;
  crack_detected: boolean;
  battery_percent: number;
  local_alarm: boolean;
  signal_strength: number; // RSSI in dBm
  sequence: number;
  timestamp: string; // ISO 8601 string
  relay_header?: MultiHopHeader;
  status: NodeStatus;
  lat: number;
  lng: number;
}

export interface DisplacementLink {
  link_id: string;
  node_a: string;
  node_b: string;
  relative_displacement_mm: number;
  status: NodeStatus;
  distance_meters: number;
}

export interface NetworkTopologyRoute {
  node_id: string;
  primary_relay: string;
  backup_relay: string;
  current_path: string[];
  rssi: number;
  packets_sent: number;
  packets_lost: number;
  status: 'DIRECT' | 'RELAY' | 'BACKUP' | 'DISCONNECTED';
}

export type RiskLevel = 'SAFE' | 'WARNING' | 'CRITICAL';

export interface AIRiskAssessment {
  risk_level: RiskLevel;
  risk_score: number; // 0.0 to 1.0
  affected_nodes: string[];
  primary_factor: string;
  progression_stage?: number; // 1 to 5 for simulation
  assessment_source: 'Assessment: Local Rule Engine' | 'Assessment: ML Model' | 'Assessment: Simulation Engine';
  model_type: 'RANDOM_FOREST_DEMO' | 'RULE_ENGINE_FALLBACK';
  dataset_label: string;
  calculated_at: string;
}

export interface Incident {
  incident_id: string;
  node_ids: string[];
  zone_link: string;
  severity: 'WARNING' | 'CRITICAL';
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  escalated_at?: string;
  resolved_at?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  latest_snapshot: {
    tilt_mag: number;
    disp_mm: number;
    vib_rms: number;
    crack: boolean;
  };
  source_mode: SystemMode;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  node_ids: string[];
  message: string;
  value_summary: string;
  acknowledged: boolean;
  connection_mode: SystemMode;
}

export interface SyncQueueItem {
  id: string;
  payload: NodeTelemetry;
  created_at: string;
  synced: boolean;
}

export interface TelemetryHistoryPoint {
  timestamp: string; // HH:mm:ss
  fullTime: string;  // ISO string
  N1_tilt: number;
  N2_tilt: number;
  N3_tilt: number;
  N4_tilt: number;
  N1_disp: number;
  N2_disp: number;
  N3_disp: number;
  N4_disp: number;
  N3_N4_link_disp: number;
  N1_vib: number;
  N2_vib: number;
  N3_vib: number;
  N4_vib: number;
}


