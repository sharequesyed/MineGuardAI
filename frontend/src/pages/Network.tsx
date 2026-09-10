import React from 'react';
import { Network as NetworkIcon, Server, Radio, ArrowRight, ShieldCheck, Cpu, AlertTriangle, RefreshCw } from 'lucide-react';
import { NodeTelemetry } from '../types/telemetry';
import { hardwareDataProvider } from '../services/HardwareDataProvider';

interface NetworkProps {
  nodes: NodeTelemetry[];
}

export const Network: React.FC<NetworkProps> = ({ nodes }) => {
  const n2Node = nodes.find(n => n.node_id === 'N2');
  const isN2Offline = n2Node?.status === 'OFFLINE';

  const handleSetRelayScenario = (offline: boolean) => {
    if (offline) {
      hardwareDataProvider.setSimulationScenario('NODE_FAILURE', 1);
    } else {
      hardwareDataProvider.setSimulationScenario('NORMAL', 1);
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <NetworkIcon className="w-6 h-6 text-sky-500" />
            Deterministic Multi-Hop Relay Network (ESP-NOW)
          </h2>
          <p className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
            Deterministic multi-hop routing protocol specification with primary and backup paths.
          </p>
        </div>

        {/* Demo Relay Control */}
        <div className="flex items-center space-x-2 bg-white dark:bg-industrial-900 p-2 rounded-lg border border-industrial-200 dark:border-industrial-800 shadow-sm">
          <span className="text-xs font-semibold text-industrial-600 dark:text-industrial-400 font-mono">Relay Demo State:</span>
          {!isN2Offline ? (
            <button
              onClick={() => handleSetRelayScenario(true)}
              className="px-3 py-1.5 rounded text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate N2 Relay Failure
            </button>
          ) : (
            <button
              onClick={() => handleSetRelayScenario(false)}
              className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restore Primary Path (N2 Safe)
            </button>
          )}
        </div>
      </div>

      {/* Honest Network Protocol Notice */}
      <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-xs font-mono space-y-2">
        <div className="flex items-center space-x-2 font-bold text-sky-900 dark:text-sky-300 text-sm">
          <Cpu className="w-4 h-4 text-sky-500" />
          <span>DETERMINISTIC MULTI-HOP RELAY PROTOCOL SPECIFICATION</span>
        </div>
        <p className="text-sky-800 dark:text-sky-300 text-xs">
          Routing Mechanism: <span className="font-bold underline">Deterministic multi-hop relay with primary & backup paths</span> (Not dynamic self-healing mesh).
        </p>
        <p className="text-xs text-sky-700 dark:text-sky-400">
          Supported packet headers: <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">source_node</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">current_relay</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">destination</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">hop_count</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">ttl</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">packet_id</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">sequence</code>.
        </p>
      </div>

      {/* Active Failover Banner if N2 is Offline */}
      {isN2Offline && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                PRIMARY ROUTE UNAVAILABLE — BACKUP ROUTE ACTIVE
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-mono">
                Node N2 is OFFLINE. Packet traffic from N1 has failover-routed to Backup Relay (N3 → GW01).
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-600 text-white font-mono text-xs font-bold uppercase">
            Backup Route Active
          </span>
        </div>
      )}

      {/* Topology Map Visualization */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
          Active Multi-Hop Network Topology Graph
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Surface Sensor Nodes Cluster */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-bold text-industrial-500 text-center uppercase tracking-wider">Surface Sensor Nodes</p>
            <div className="space-y-2.5">
              {nodes.map(n => (
                <div key={n.node_id} className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded-md border border-industrial-200 dark:border-industrial-800 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <Radio className={`w-4 h-4 ${n.status === 'OFFLINE' ? 'text-red-500' : 'text-emerald-500'}`} />
                    <span className="font-bold text-industrial-900 dark:text-white text-sm">Node {n.node_id}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      n.status === 'OFFLINE' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {n.status}
                    </span>
                    <span className="text-[10px] text-industrial-500 block mt-0.5">RSSI: {n.signal_strength} dBm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-hop Relay Connections */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            
            {/* Primary Path Box */}
            <div className={`p-4 rounded-lg border w-full max-w-xs text-xs font-mono space-y-1.5 transition ${
              !isN2Offline
                ? 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                : 'bg-industrial-100 border-industrial-300 dark:bg-industrial-800/40 dark:border-industrial-700 opacity-60'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-industrial-900 dark:text-white text-sm">Primary Relay Path</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${!isN2Offline ? 'bg-emerald-600 text-white' : 'bg-industrial-400 text-white'}`}>
                  {!isN2Offline ? 'ACTIVE' : 'UNAVAILABLE'}
                </span>
              </div>
              <p className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 pt-1">
                N1 <ArrowRight className="w-3.5 h-3.5" /> N2 <ArrowRight className="w-3.5 h-3.5" /> GW01
              </p>
              <p className="text-[10px] text-industrial-500">Deterministically routes N1 packets via relay N2 (2 hops)</p>
            </div>

            {/* Backup Path Box */}
            <div className={`p-4 rounded-lg border w-full max-w-xs text-xs font-mono space-y-1.5 transition ${
              isN2Offline
                ? 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
                : 'bg-industrial-50 border-industrial-200 dark:bg-industrial-950/60 dark:border-industrial-800'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-industrial-900 dark:text-white text-sm">Backup Relay Path</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isN2Offline ? 'bg-amber-600 text-white' : 'bg-industrial-400 text-white'}`}>
                  {isN2Offline ? 'ACTIVE FAILOVER' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1 pt-1">
                N1 <ArrowRight className="w-3.5 h-3.5" /> N3 <ArrowRight className="w-3.5 h-3.5" /> GW01
              </p>
              <p className="text-[10px] text-industrial-500">Backup route activates if N2 relay becomes unresponsive</p>
            </div>

          </div>

          {/* ESP32 Gateway Node */}
          <div className="flex flex-col items-center justify-center p-6 bg-industrial-800 dark:bg-industrial-950 text-white rounded-lg border border-industrial-700 text-center space-y-3">
            <Server className="w-10 h-10 text-amber-400" />
            <div>
              <h4 className="font-heading font-bold text-base">ESP32 Gateway (MG-GW-01)</h4>
              <p className="text-xs font-mono text-industrial-300 mt-1">
                Aggregates surface node ESP-NOW packets & outputs Web Serial JSON stream
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-600 text-white font-mono text-xs font-bold">
              Gateway Aggregator Online
            </span>
          </div>

        </div>
      </div>

      {/* Packet Header Audit Table */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
            Latest Multi-Hop Packet Headers Parsed
          </h3>
          <span className="text-xs text-industrial-500 font-mono">Live ESP-NOW Protocol Decoder</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-industrial-50 dark:bg-industrial-950 text-industrial-600 dark:text-industrial-400 uppercase text-[11px]">
              <tr>
                <th className="p-3">Packet ID</th>
                <th className="p-3">Source Node</th>
                <th className="p-3">Current Relay</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Hop Count</th>
                <th className="p-3">TTL</th>
                <th className="p-3">Sequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-100 dark:divide-industrial-800">
              {nodes.map(n => {
                const header = n.relay_header;
                return (
                  <tr key={n.node_id} className="hover:bg-industrial-50/50 dark:hover:bg-industrial-800/50">
                    <td className="p-3 font-bold text-industrial-900 dark:text-white">{header?.packet_id || `PKT_${n.sequence}_${n.node_id}`}</td>
                    <td className="p-3 font-bold text-industrial-800 dark:text-industrial-200">{n.node_id}</td>
                    <td className="p-3 font-bold text-sky-600 dark:text-sky-400">
                      {header?.current_relay || 'GW01'}
                    </td>
                    <td className="p-3 text-industrial-700 dark:text-industrial-300">{header?.destination || 'GW01'}</td>
                    <td className="p-3 font-bold text-industrial-900 dark:text-white">{header?.hop_count || 1} hop(s)</td>
                    <td className="p-3">{header?.ttl || 9}</td>
                    <td className="p-3">#{n.sequence}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

