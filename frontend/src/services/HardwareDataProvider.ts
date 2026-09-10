import { SystemMode, NodeTelemetry, DisplacementLink, SystemAlert, AIRiskAssessment, TelemetryHistoryPoint } from '../types/telemetry';
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
  historyBuffer: TelemetryHistoryPoint[]
) => void;

export class HardwareDataProvider {
  private currentMode: SystemMode = 'SIMULATION'; // Default simulation
  private nodes: NodeTelemetry[] = [];
  private links: DisplacementLink[] = [];
  private alerts: SystemAlert[] = [];
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

  subscribe(listener: ModeChangeListener): () => void {
    this.listeners.add(listener);
    // Initial notification
    listener(this.currentMode, this.nodes, this.links, this.isHardwareConnected, this.lastPacketTime, this.historyBuffer);
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
      this.statusMessage = 'REQUIRES CONFIGURATION — ESP32 Local Wi-Fi Gateway Endpoint';
      this.notifyListeners();
      return true;
    } else if (newMode === 'CLOUD') {
      this.isHardwareConnected = false;
      this.statusMessage = 'REQUIRES CONFIGURATION — Cloud MQTT / Backend Endpoint';
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
      });
    }

    // Check for alerts
    this.evaluateAlerts(nodes);

    // Queue readings to IndexedDB if offline or storing history
    for (const node of nodes) {
      offlineStore.queueTelemetry(node);
    }

    this.notifyListeners();
  }


  private evaluateAlerts(nodes: NodeTelemetry[]) {
    for (const node of nodes) {
      if (node.status === 'CRITICAL' || node.status === 'WARNING') {
        const existingRecent = this.alerts.find(
          a => a.node_ids.includes(node.node_id) && 
          (Date.now() - new Date(a.timestamp).getTime()) < 30000 // 30 sec debounce
        );

        if (!existingRecent) {
          const alert: SystemAlert = {
            id: `ALT_${Date.now()}_${node.node_id}`,
            timestamp: new Date().toISOString(),
            severity: node.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            node_ids: [node.node_id],
            message: node.crack_detected 
              ? `CRITICAL: Surface crack bridge continuity broken at ${node.node_id}`
              : `${node.status}: Abnormal surface deformation detected at ${node.node_id} (Tilt: ${node.tilt_magnitude_deg}°, Disp: ${node.displacement_mm}mm)`,
            value_summary: `Tilt: ${node.tilt_magnitude_deg}°, Disp: ${node.displacement_mm}mm, Vib: ${node.vibration_rms}g`,
            acknowledged: false,
            connection_mode: this.currentMode,
          };

          this.alerts.unshift(alert);
          offlineStore.saveAlert(alert);

          // Browser Web Notification API trigger
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`MineGuard-AI ${alert.severity}`, {
              body: alert.message,
              icon: '/pwa-192x192.png',
            });
          }
        }
      }
    }
  }

  getRiskAssessment(): AIRiskAssessment {
    return BrowserRiskCalculator.evaluate(this.nodes);
  }

  getAlerts(): SystemAlert[] {
    return this.alerts;
  }

  async acknowledgeAlert(id: string) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      await offlineStore.acknowledgeAlert(id);
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentMode, this.nodes, this.links, this.isHardwareConnected, this.lastPacketTime, this.historyBuffer);
    }
  }
}

export const hardwareDataProvider = new HardwareDataProvider();

