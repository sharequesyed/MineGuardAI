import { NodeTelemetry, DisplacementLink } from '../types/telemetry';

export class WebSerialProvider {
  private port: any = null;
  private reader: any = null;
  private isConnected: boolean = false;
  private lastPacketTime: string | null = null;
  private onDataCallback: ((nodes: NodeTelemetry[], links: DisplacementLink[]) => void) | null = null;
  private onErrorCallback: ((err: string) => void) | null = null;
  private onStatusChangeCallback: ((connected: boolean, lastPacket: string | null) => void) | null = null;

  // Active state buffer
  private nodeBuffer: Map<string, NodeTelemetry> = new Map();

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serial' in navigator;
  }

  async connect(
    onData: (nodes: NodeTelemetry[], links: DisplacementLink[]) => void,
    onStatusChange: (connected: boolean, lastPacket: string | null) => void,
    onError: (err: string) => void
  ): Promise<boolean> {
    if (!this.isSupported()) {
      onError('Web Serial API is not supported by this browser. Please use Chrome, Edge, or Opera.');
      return false;
    }

    this.onDataCallback = onData;
    this.onStatusChangeCallback = onStatusChange;
    this.onErrorCallback = onError;

    try {
      // Prompt user to select ESP32 serial port
      this.port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x10c4 }, // Silicon Labs CP210x
          { usbVendorId: 0x1a86 }, // CH340 / CH341
          { usbVendorId: 0x303a }, // Espressif USB
        ]
      }).catch(() => (navigator as any).serial.requestPort()); // Fallback prompt without filter

      await this.port.open({ baudRate: 115200 });
      this.isConnected = true;
      this.notifyStatus();

      this.readLoop();
      return true;
    } catch (err: any) {
      this.isConnected = false;
      this.notifyStatus();
      if (err.name !== 'NotFoundError') { // User didn't cancel selection
        onError(`Serial connection error: ${err.message || err}`);
      }
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {
        // Ignore stream cancel error
      }
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {
        // Ignore port close error
      }
      this.port = null;
    }
    this.notifyStatus();
  }

  private async readLoop() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    const streamReader = textDecoder.readable.getReader();
    this.reader = streamReader;

    let buffer = '';

    try {
      while (this.isConnected) {
        const { value, done } = await streamReader.read();
        if (done) {
          break;
        }
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          // Process all complete lines except last partial line
          buffer = lines.pop() || '';

          for (const line of lines) {
            this.processLine(line.trim());
          }
        }
      }
    } catch (error: any) {
      if (this.isConnected) {
        if (this.onErrorCallback) {
          this.onErrorCallback(`Serial stream interrupted: ${error.message || error}`);
        }
      }
    } finally {
      this.isConnected = false;
      this.notifyStatus();
      streamReader.releaseLock();
    }
  }

  private processLine(line: string) {
    if (!line || (!line.startsWith('{') && !line.startsWith('['))) return;

    try {
      const parsed = JSON.parse(line);
      const now = new Date().toISOString();
      this.lastPacketTime = now;

      // Handle single telemetry object or array of telemetry
      const packetArray = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of packetArray) {
        if (!item.node_id) continue;

        const tiltX = item.tilt_x_deg || 0;
        const tiltY = item.tilt_y_deg || 0;
        const tiltMag = Math.sqrt(tiltX * tiltX + tiltY * tiltY);
        const dispMm = item.displacement_mm || 0;
        const crack = Boolean(item.crack_detected);
        const vibRms = item.vibration_rms || 0;

        let status: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
        if (tiltMag > 5.0 || dispMm > 15.0 || crack || vibRms > 1.2) {
          status = 'CRITICAL';
        } else if (tiltMag > 2.5 || dispMm > 6.0 || vibRms > 0.4) {
          status = 'WARNING';
        }

        // Coordinates mapping for standard prototype nodes
        const defaultCoords: Record<string, { lat: number; lng: number }> = {
          'N1': { lat: 23.7585, lng: 86.4145 },
          'N2': { lat: 23.7587, lng: 86.4155 },
          'N3': { lat: 23.7578, lng: 86.4157 },
          'N4': { lat: 23.7575, lng: 86.4146 },
        };

        const coords = defaultCoords[item.node_id] || { lat: 23.7580, lng: 86.4150 };

        const telemetry: NodeTelemetry = {
          node_id: item.node_id,
          tilt_x_deg: tiltX,
          tilt_y_deg: tiltY,
          tilt_magnitude_deg: parseFloat(tiltMag.toFixed(2)),
          vibration_rms: vibRms,
          vibration_peak: item.vibration_peak || vibRms * 1.8,
          vibration_variance: item.vibration_variance || vibRms * 0.1,
          displacement_mm: dispMm,
          crack_detected: crack,
          battery_percent: item.battery_percent ?? 90,
          local_alarm: Boolean(item.local_alarm),
          signal_strength: item.signal_strength || -65,
          sequence: item.sequence || 0,
          timestamp: now,
          status,
          lat: coords.lat,
          lng: coords.lng,
          relay_header: item.relay_header || {
            packet_id: `PKT_${item.sequence || 0}_${item.node_id}`,
            source_node: item.node_id,
            current_relay: 'GW01',
            destination: 'GW01',
            hop_count: 1,
            ttl: 9,
            sequence: item.sequence || 0,
          }
        };

        this.nodeBuffer.set(item.node_id, telemetry);
      }

      this.emitData();
      this.notifyStatus();
    } catch (e) {
      // Malformed serial packet - swallow gracefully without crash
    }
  }

  private emitData() {
    if (!this.onDataCallback) return;

    const nodes = Array.from(this.nodeBuffer.values());
    const links: DisplacementLink[] = [
      this.calculateLink('L12', 'N1', 'N2', 25.0),
      this.calculateLink('L23', 'N2', 'N3', 28.0),
      this.calculateLink('L34', 'N3', 'N4', 24.0),
      this.calculateLink('L14', 'N1', 'N4', 30.0),
    ];

    this.onDataCallback(nodes, links);
  }

  private calculateLink(linkId: string, nodeAId: string, nodeBId: string, baseDistanceM: number): DisplacementLink {
    const nodeA = this.nodeBuffer.get(nodeAId);
    const nodeB = this.nodeBuffer.get(nodeBId);

    const dispA = nodeA ? nodeA.displacement_mm : 0;
    const dispB = nodeB ? nodeB.displacement_mm : 0;
    const relDisp = parseFloat(Math.abs(dispA - dispB).toFixed(1)) + Math.max(dispA, dispB) * 0.5;

    let linkStatus: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
    if (relDisp > 15.0 || (nodeA && nodeA.crack_detected) || (nodeB && nodeB.crack_detected)) {
      linkStatus = 'CRITICAL';
    } else if (relDisp > 6.0) {
      linkStatus = 'WARNING';
    }

    return {
      link_id: linkId,
      node_a: nodeAId,
      node_b: nodeBId,
      relative_displacement_mm: parseFloat(relDisp.toFixed(1)),
      status: linkStatus,
      distance_meters: baseDistanceM,
    };
  }

  private notifyStatus() {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(this.isConnected, this.lastPacketTime);
    }
  }
}

export const webSerialProvider = new WebSerialProvider();
