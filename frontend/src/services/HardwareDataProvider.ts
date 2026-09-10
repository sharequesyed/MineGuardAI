import { SystemMode, NodeTelemetry, DisplacementLink, SystemAlert, AIRiskAssessment, TelemetryHistoryPoint, Incident } from '../types/telemetry';
import { simulationEngine, SimulationScenario } from './SimulationEngine';
import { webSerialProvider } from './WebSerialProvider';
import { offlineStore } from './IndexedDBStore';
import { BrowserRiskCalculator } from './BrowserRiskCalculator';

export type ModeChangeListener = (
  mode: SystemMode,
  nodes: NodeTelemetry[],
  links: DisplacementLink[],
  isHardwareConnected: boolean,
  lastPacketTime: string | null,
  historyBuffer: TelemetryHistoryPoint[],
  incidents: Incident[]
) => void;

export class HardwareDataProvider {
  private currentMode: SystemMode = 'SIMULATION'; // Default simulation
  private nodes: NodeTelemetry[] = [];
  private links: DisplacementLink[] = [];
  private alerts: SystemAlert[] = [];
  private incidents: Incident[] = [];
  private historyBuffer: TelemetryHistoryPoint[] = [];
  private listeners: Set<ModeChangeListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isBroadcastingRemote: boolean = false;

  private isHardwareConnected: boolean = false;
  private lastPacketTime: string | null = null;
  private statusMessage: string = 'SIMULATION MODE Active';

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem('mineguard_mode') as SystemMode;
      if (savedMode) {
        this.currentMode = savedMode;
      }
    }

    // Setup Cross-Tab Realtime Broadcast Channel Synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('mineguard_telemetry_sync');
      this.broadcastChannel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'TELEMETRY_SYNC') {
          this.isBroadcastingRemote = true;
          this.nodes = data.nodes;
          this.links = data.links;
          this.currentMode = data.mode;
          this.isHardwareConnected = data.isHardwareConnected;
          this.lastPacketTime = data.lastPacketTime;
          if (data.incidents) {
            this.incidents = data.incidents;
          }
          
          if (data.historyPoint) {
            this.historyBuffer.push(data.historyPoint);
            if (this.historyBuffer.length > 40) this.historyBuffer.shift();
          }
          this.notifyListeners();
          this.isBroadcastingRemote = false;
        } else if (data.type === 'MODE_CHANGE') {
          this.currentMode = data.mode;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mineguard_mode', data.mode);
          }
          this.notifyListeners();
        } else if (data.type === 'SCENARIO_CHANGE') {
          simulationEngine.setScenario(data.scenario, data.stage);
        }
      };
    }

    // Start simulation engine
    this.initSimulation();
  }

  getMode(): SystemMode {
    return this.currentMode;
  }

  getStatusMessage(): string {
    return this.statusMessage;
  }

  isHardwareOnline(): boolean {
    return this.isHardwareConnected;
  }

  getLastPacketTime(): string | null {
    return this.lastPacketTime;
  }

  getHistoryBuffer(): TelemetryHistoryPoint[] {
    return this.historyBuffer;
  }

  getIncidents(): Incident[] {
    return this.incidents;
  }

  subscribe(listener: ModeChangeListener): () => void {
    this.listeners.add(listener);
    // Initial notification
    listener(this.currentMode, this.nodes, this.links, this.isHardwareConnected, this.lastPacketTime, this.historyBuffer, this.incidents);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async setMode(newMode: SystemMode): Promise<boolean> {
    if (this.currentMode === newMode) return true;

    // Stop current mode activities
    if (this.currentMode === 'SIMULATION') {
      simulationEngine.stop();
    } else if (this.currentMode === 'USB_SERIAL') {
      await webSerialProvider.disconnect();
    }

    this.currentMode = newMode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mineguard_mode', newMode);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'MODE_CHANGE', mode: newMode });
    }

    if (newMode === 'SIMULATION') {
      this.isHardwareConnected = false;
      this.statusMessage = 'SIMULATION MODE Active';
      this.initSimulation();
      return true;
    } else if (newMode === 'USB_SERIAL') {
      this.statusMessage = 'Connecting to ESP32 Hardware via Web Serial...';
      const success = await webSerialProvider.connect(
        (nodes, links) => this.handleTelemetryUpdate(nodes, links),
        (connected, lastPacket) => {
          this.isHardwareConnected = connected;
          this.lastPacketTime = lastPacket;
          if (!connected) {
            this.statusMessage = 'HARDWARE DISCONNECTED';
          } else {
            this.statusMessage = 'LIVE — USB ESP32 Gateway Connected';
          }
          this.notifyListeners();
        },
        (errMessage) => {
          this.statusMessage = `HARDWARE ERROR: ${errMessage}`;
          this.notifyListeners();
        }
      );
      return success;
    } else if (newMode === 'LOCAL_GATEWAY') {
      this.isHardwareConnected = false;
      this.statusMessage = 'LOCAL GATEWAY UNREACHABLE — Requires Configuration';
      this.notifyListeners();
      return true;
    } else if (newMode === 'CLOUD') {
      this.isHardwareConnected = false;
      this.statusMessage = 'CLOUD BACKEND OFFLINE / NOT CONFIGURED';
      this.notifyListeners();
      return true;
    }

    return false;
  }

  setSimulationScenario(scenario: SimulationScenario, stage: number = 1) {
    if (this.currentMode === 'SIMULATION') {
      simulationEngine.setScenario(scenario, stage);
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SCENARIO_CHANGE', scenario, stage });
      }
    }
  }

  private initSimulation() {
    simulationEngine.start((nodes, links) => {
      this.handleTelemetryUpdate(nodes, links);
    });
  }

  private handleTelemetryUpdate(nodes: NodeTelemetry[], links: DisplacementLink[]) {
    if (this.isBroadcastingRemote) return;

    this.nodes = nodes;
    this.links = links;
    this.lastPacketTime = new Date().toISOString();

    // Build real-time dynamic time-series history point
    const now = new Date();
    const timeLabel = now.toTimeString().split(' ')[0]; // HH:mm:ss

    const n1 = nodes.find(n => n.node_id === 'N1');
    const n2 = nodes.find(n => n.node_id === 'N2');
    const n3 = nodes.find(n => n.node_id === 'N3');
    const n4 = nodes.find(n => n.node_id === 'N4');

    const link34 = links.find(l => l.link_id === 'L34');

    const historyPoint: TelemetryHistoryPoint = {
      timestamp: timeLabel,
      fullTime: now.toISOString(),
      N1_tilt: n1 ? n1.tilt_magnitude_deg : 0,
      N2_tilt: n2 ? n2.tilt_magnitude_deg : 0,
      N3_tilt: n3 ? n3.tilt_magnitude_deg : 0,
      N4_tilt: n4 ? n4.tilt_magnitude_deg : 0,
      N1_disp: n1 ? n1.displacement_mm : 0,
      N2_disp: n2 ? n2.displacement_mm : 0,
      N3_disp: n3 ? n3.displacement_mm : 0,
      N4_disp: n4 ? n4.displacement_mm : 0,
      N3_N4_link_disp: link34 ? link34.relative_displacement_mm : (n3 ? n3.displacement_mm : 0),
      N1_vib: n1 ? n1.vibration_rms : 0,
      N2_vib: n2 ? n2.vibration_rms : 0,
      N3_vib: n3 ? n3.vibration_rms : 0,
      N4_vib: n4 ? n4.vibration_rms : 0,
    };

    this.historyBuffer.push(historyPoint);
    // Maintain maximum 40 data points in rolling history buffer
    if (this.historyBuffer.length > 40) {
      this.historyBuffer.shift();
    }

    // Evaluate Incident-Based Lifecycle (Priority 1 & Priority 2)
    this.evaluateIncidentLifecycle(nodes, links);

    // Broadcast update across open browser tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'TELEMETRY_SYNC',
        nodes: this.nodes,
        links: this.links,
        mode: this.currentMode,
        isHardwareConnected: this.isHardwareConnected,
        lastPacketTime: this.lastPacketTime,
        historyPoint,
        incidents: this.incidents,
      });
    }

    // Queue readings to IndexedDB if offline or storing history
    for (const node of nodes) {
      offlineStore.queueTelemetry(node);
    }

    this.notifyListeners();
  }

  // Priority 1: Incident-Based Lifecycle Evaluator (NO ALERT FLOODING)
  private evaluateIncidentLifecycle(nodes: NodeTelemetry[], links: DisplacementLink[]) {
    const abnormalNodes = nodes.filter(n => n.status === 'WARNING' || n.status === 'CRITICAL');
    const nowIso = new Date().toISOString();

    // Check if an existing ACTIVE or ACKNOWLEDGED incident exists
    const activeIncident = this.incidents.find(inc => inc.status === 'ACTIVE' || inc.status === 'ACKNOWLEDGED');

    if (abnormalNodes.length === 0) {
      // All nodes returned to SAFE -> Resolve active incident if present
      if (activeIncident) {
        activeIncident.status = 'RESOLVED';
        activeIncident.resolved_at = nowIso;
        activeIncident.updated_at = nowIso;
      }
      return;
    }

    // Determine highest current severity among abnormal nodes
    const hasCritical = abnormalNodes.some(n => n.status === 'CRITICAL');
    const currentSeverity: 'WARNING' | 'CRITICAL' = hasCritical ? 'CRITICAL' : 'WARNING';
    const abnormalNodeIds = abnormalNodes.map(n => n.node_id);

    const primaryNode = abnormalNodes[0];
    const link34 = links.find(l => l.link_id === 'L34');

    const latestSnapshot = {
      tilt_mag: primaryNode.tilt_magnitude_deg,
      disp_mm: link34 ? link34.relative_displacement_mm : primaryNode.displacement_mm,
      vib_rms: primaryNode.vibration_rms,
      crack: abnormalNodes.some(n => n.crack_detected),
    };

    if (!activeIncident) {
      // 1. SAFE -> WARNING/CRITICAL: Create 1 NEW Incident
      const newIncident: Incident = {
        incident_id: `INC_${Date.now()}_${abnormalNodeIds.join('_')}`,
        node_ids: abnormalNodeIds,
        zone_link: `Zone Panel A-01 (${abnormalNodeIds.join('–')})`,
        severity: currentSeverity,
        status: 'ACTIVE',
        created_at: nowIso,
        updated_at: nowIso,
        acknowledged: false,
        latest_snapshot: latestSnapshot,
        source_mode: this.currentMode,
      };

      this.incidents.unshift(newIncident);

      // Trigger ONE initial native notification
      this.sendNativeNotification(
        `MineGuard-AI — ${this.currentMode === 'SIMULATION' ? 'SIMULATION ' : ''}${currentSeverity}`,
        `Abnormal surface deformation detected near Node ${abnormalNodeIds.join(', ')}. Risk level: ${currentSeverity}. Open MineGuard-AI to inspect affected zone.`
      );

    } else {
      // Incident exists: Check for Escalation or Telemetry Update
      activeIncident.updated_at = nowIso;
      activeIncident.latest_snapshot = latestSnapshot;

      if (activeIncident.severity === 'WARNING' && currentSeverity === 'CRITICAL') {
        // 2. WARNING -> CRITICAL: Escalate Existing Incident
        activeIncident.severity = 'CRITICAL';
        activeIncident.escalated_at = nowIso;
        if (activeIncident.status === 'ACKNOWLEDGED') {
          activeIncident.status = 'ACTIVE'; // Re-activate for escalation visibility
          activeIncident.acknowledged = false;
        }

        // Trigger ONE escalation notification
        this.sendNativeNotification(
          `MineGuard-AI — ${this.currentMode === 'SIMULATION' ? 'SIMULATION ' : ''}CRITICAL`,
          `Critical surface deformation detected near Nodes ${abnormalNodeIds.join('–')}. Immediate inspection recommended.`
        );

      } else {
        // 3. WARNING remains WARNING, or CRITICAL remains CRITICAL:
        // Update telemetry snapshot on existing incident; DO NOT generate duplicate notifications or duplicate incidents!
      }
    }
  }

  // Priority 2: Native Web/Browser Notification Handler
  async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    const permission = await Notification.requestPermission();
    return permission;
  }

  getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  sendTestNotification() {
    this.sendNativeNotification(
      'MineGuard-AI System Test',
      'Notification system test successful. Hardware/Browser notification service ready.'
    );
  }

  private async sendNativeNotification(title: string, body: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      // Prefer Service Worker Notification if registered & active
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: 'mineguard-safety-incident',
            data: { url: '/alerts' },
          });
          return;
        }
      }

      // Standard Notification fallback
      const n = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        tag: 'mineguard-safety-incident',
      });
      n.onclick = () => {
        window.focus();
      };
    } catch (e) {
      // Ignore notification launch block
    }
  }

  getRiskAssessment(): AIRiskAssessment {
    return BrowserRiskCalculator.evaluate(this.nodes, this.currentMode);
  }

  getAlerts(): SystemAlert[] {
    return this.alerts;
  }

  async acknowledgeIncident(id: string) {
    const inc = this.incidents.find(i => i.incident_id === id);
    if (inc) {
      inc.acknowledged = true;
      inc.status = 'ACKNOWLEDGED';
      inc.acknowledged_at = new Date().toISOString();
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentMode, this.nodes, this.links, this.isHardwareConnected, this.lastPacketTime, this.historyBuffer, this.incidents);
    }
  }
}

export const hardwareDataProvider = new HardwareDataProvider();


