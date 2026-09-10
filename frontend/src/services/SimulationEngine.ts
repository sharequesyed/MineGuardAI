import { NodeTelemetry, DisplacementLink, MultiHopHeader, NodeStatus } from '../types/telemetry';

export type SimulationScenario = 'NORMAL' | 'PROGRESSIVE_SUBSIDENCE' | 'NODE_FAILURE' | 'NETWORK_INTERRUPTION';

export class SimulationEngine {
  private scenario: SimulationScenario = 'NORMAL';
  private stage: number = 1; // 1 to 5 for progressive subsidence
  private sequence: number = 1000;
  private timer: number | null = null;
  private onDataCallback: ((nodes: NodeTelemetry[], links: DisplacementLink[]) => void) | null = null;

  // Monitored Surface Coordinates (Above Underground Coal Panel A-01)
  // Demo surface site: Lat 23.7580, Lng 86.4150 (Jharia Coalfield Surface Demo Area)
  private initialNodes: Record<string, { lat: number; lng: number }> = {
    'N1': { lat: 23.7585, lng: 86.4145 },
    'N2': { lat: 23.7587, lng: 86.4155 },
    'N3': { lat: 23.7578, lng: 86.4157 },
    'N4': { lat: 23.7575, lng: 86.4146 },
  };

  setScenario(scenario: SimulationScenario, stage: number = 1) {
    this.scenario = scenario;
    this.stage = Math.min(Math.max(stage, 1), 5);
  }

  getScenario(): { scenario: SimulationScenario; stage: number } {
    return { scenario: this.scenario, stage: this.stage };
  }

  start(callback: (nodes: NodeTelemetry[], links: DisplacementLink[]) => void) {
    this.onDataCallback = callback;
    this.stop();
    // Emit telemetry every 2 seconds
    this.timer = window.setInterval(() => {
      this.generateAndEmit();
    }, 2000);
    this.generateAndEmit(); // Immediate first emit
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  generateSnapshot(): { nodes: NodeTelemetry[]; links: DisplacementLink[] } {
    this.sequence++;
    const timestamp = new Date().toISOString();
    const nodes: NodeTelemetry[] = [];

    // Base noise helper
    const noise = (amplitude: number) => (Math.random() - 0.5) * amplitude;

    // Node state definitions per scenario
    const ids = ['N1', 'N2', 'N3', 'N4'];

    for (const id of ids) {
      let tiltX = 0.2 + noise(0.1);
      let tiltY = 0.1 + noise(0.1);
      let vibRms = 0.05 + noise(0.02);
      let vibPeak = 0.12 + noise(0.04);
      let dispMm = 0.5 + noise(0.2);
      let crack = false;
      let status: NodeStatus = 'SAFE';
      let isOffline = false;

      // Multi-hop routing defaults
      let currentRelay = 'GW01';
      let hopCount = 1;

      if (this.scenario === 'NORMAL') {
        // Standard safe baseline
      } else if (this.scenario === 'PROGRESSIVE_SUBSIDENCE') {
        if (this.stage === 2 && id === 'N3') {
          tiltX = 1.8 + noise(0.2);
          tiltY = 1.2 + noise(0.2);
          dispMm = 3.8 + noise(0.5);
          status = 'WARNING';
        } else if (this.stage === 3) {
          if (id === 'N3') {
            tiltX = 3.2 + noise(0.3);
            tiltY = 2.4 + noise(0.3);
            dispMm = 7.5 + noise(0.8);
            vibRms = 0.45 + noise(0.1);
            status = 'WARNING';
          } else if (id === 'N4') {
            tiltX = 2.1 + noise(0.2);
            tiltY = 1.8 + noise(0.2);
            dispMm = 5.2 + noise(0.6);
            status = 'WARNING';
          }
        } else if (this.stage === 4) {
          if (id === 'N3') {
            tiltX = 5.8 + noise(0.4);
            tiltY = 4.1 + noise(0.4);
            dispMm = 14.2 + noise(1.0);
            vibRms = 0.88 + noise(0.15);
            status = 'CRITICAL';
          } else if (id === 'N4') {
            tiltX = 4.5 + noise(0.4);
            tiltY = 3.6 + noise(0.4);
            dispMm = 11.8 + noise(0.9);
            vibRms = 0.65 + noise(0.1);
            status = 'CRITICAL';
          }
        } else if (this.stage === 5) {
          if (id === 'N3' || id === 'N4') {
            tiltX = 7.5 + noise(0.5);
            tiltY = 5.9 + noise(0.5);
            dispMm = 22.4 + noise(1.5);
            vibRms = 1.45 + noise(0.2);
            crack = true;
            status = 'CRITICAL';
          }
        }
      } else if (this.scenario === 'NODE_FAILURE') {
        if (id === 'N2') {
          isOffline = true;
          status = 'OFFLINE';
        } else if (id === 'N1') {
          // N1 relies on N3 as multi-hop relay when N2 is offline
          currentRelay = 'N3';
          hopCount = 2;
        }
      } else if (this.scenario === 'NETWORK_INTERRUPTION') {
        // All nodes simulate degraded/interrupted transmission
        status = 'OFFLINE';
        isOffline = true;
      }

      const tiltMag = Math.sqrt(tiltX * tiltX + tiltY * tiltY);

      const header: MultiHopHeader = {
        packet_id: `PKT_${this.sequence}_${id}`,
        source_node: id,
        current_relay: currentRelay,
        destination: 'GW01',
        hop_count: hopCount,
        ttl: 10 - hopCount,
        sequence: this.sequence,
      };

      nodes.push({
        node_id: id,
        tilt_x_deg: parseFloat(tiltX.toFixed(2)),
        tilt_y_deg: parseFloat(tiltY.toFixed(2)),
        tilt_magnitude_deg: parseFloat(tiltMag.toFixed(2)),
        vibration_rms: parseFloat(vibRms.toFixed(3)),
        vibration_peak: parseFloat(vibPeak.toFixed(3)),
        vibration_variance: parseFloat((vibRms * 0.15).toFixed(4)),
        displacement_mm: parseFloat(dispMm.toFixed(1)),
        crack_detected: crack,
        battery_percent: Math.max(70, Math.floor(95 - (this.sequence % 20))),
        local_alarm: status === 'CRITICAL' || crack,
        signal_strength: isOffline ? -110 : -65 - (hopCount * 12) + Math.floor(noise(5)),
        sequence: this.sequence,
        timestamp,
        relay_header: header,
        status: status,
        lat: this.initialNodes[id].lat,
        lng: this.initialNodes[id].lng,
      });
    }

    // Compute relative displacement links between surface points
    // L12 (N1-N2), L23 (N2-N3), L34 (N3-N4), L14 (N1-N4)
    const links: DisplacementLink[] = [
      this.calculateLink('L12', nodes.find(n => n.node_id === 'N1')!, nodes.find(n => n.node_id === 'N2')!, 25.0),
      this.calculateLink('L23', nodes.find(n => n.node_id === 'N2')!, nodes.find(n => n.node_id === 'N3')!, 28.0),
      this.calculateLink('L34', nodes.find(n => n.node_id === 'N3')!, nodes.find(n => n.node_id === 'N4')!, 24.0),
      this.calculateLink('L14', nodes.find(n => n.node_id === 'N1')!, nodes.find(n => n.node_id === 'N4')!, 30.0),
    ];

    return { nodes, links };
  }

  private calculateLink(linkId: string, nodeA: NodeTelemetry, nodeB: NodeTelemetry, baseDistanceM: number): DisplacementLink {
    const dispA = nodeA.displacement_mm;
    const dispB = nodeB.displacement_mm;
    // Relative displacement delta between the two surface points
    const relDisp = parseFloat(Math.abs(dispA - dispB).toFixed(1)) + Math.max(dispA, dispB) * 0.5;

    let linkStatus: NodeStatus = 'SAFE';
    if (relDisp > 15.0 || nodeA.crack_detected || nodeB.crack_detected) {
      linkStatus = 'CRITICAL';
    } else if (relDisp > 6.0) {
      linkStatus = 'WARNING';
    }

    return {
      link_id: linkId,
      node_a: nodeA.node_id,
      node_b: nodeB.node_id,
      relative_displacement_mm: parseFloat(relDisp.toFixed(1)),
      status: linkStatus,
      distance_meters: baseDistanceM,
    };
  }

  private generateAndEmit() {
    if (!this.onDataCallback) return;
    const snapshot = this.generateSnapshot();
    this.onDataCallback(snapshot.nodes, snapshot.links);
  }
}

export const simulationEngine = new SimulationEngine();
