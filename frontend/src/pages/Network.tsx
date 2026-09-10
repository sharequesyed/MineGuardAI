import React from 'react';
import { Network as NetworkIcon, Server, Radio, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { NodeTelemetry } from '../types/telemetry';

interface NetworkProps {
  nodes: NodeTelemetry[];
}

export const Network: React.FC<NetworkProps> = ({ nodes }) => {
  return (
    <div className="space-y-6 font-body">
      <div>
        <h2 className="text-lg font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
          <NetworkIcon className="w-5 h-5 text-sky-500" />
          Multi-Hop Relay Network Topology (ESP-NOW)
        </h2>
        <p className="text-xs text-industrial-500 dark:text-industrial-400">
          Deterministic surface relay network, packet header analysis, and ESP-NOW signal health.
        </p>
      </div>

      {/* Honest Network Protocol Notice */}
      <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-xs font-mono space-y-1">
        <div className="flex items-center space-x-2 font-bold text-sky-900 dark:text-sky-300">
          <Cpu className="w-4 h-4 text-sky-500" />
          <span>PROTOTYPE MULTI-HOP RELAY PROTOCOL SPECIFICATION</span>
        </div>
        <p className="text-sky-800 dark:text-sky-300">
          Routing Mechanism: <span className="font-semibold">Deterministic multi-hop relay with primary & backup paths</span> (Not dynamic mesh / self-healing).
        </p>
        <p className="text-[10px] text-sky-700 dark:text-sky-400">
          Headers supported: <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">source_node</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">current_relay</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">destination</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">hop_count</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">ttl</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">packet_id</code>, <code className="bg-sky-100 dark:bg-sky-900 px-1 py-0.5 rounded">sequence</code>.
        </p>
      </div>

      {/* Topology Map Visualization */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
          Active Multi-Hop Network Topology Graph
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Surface Sensor Nodes Cluster */}
          <div className="space-y-3">
            <p className="text-xs font-mono font-bold text-industrial-500 text-center">SURFACE NODES</p>
            <div className="space-y-2">
              {nodes.map(n => (
                <div key={n.node_id} className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-industrial-900 dark:text-white">Node {n.node_id}</span>
                  </div>
                  <span className="text-[10px] text-industrial-500">RSSI: {n.signal_strength} dBm</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-hop Relay Connections */}
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="p-3 bg-industrial-100 dark:bg-industrial-800 rounded-lg border border-industrial-300 dark:border-industrial-700 w-full max-w-xs text-xs font-mono space-y-1">
              <span className="font-bold text-industrial-900 dark:text-white">Primary Relay Path</span>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                N1 <ArrowRight className="w-3 h-3" /> N2 <ArrowRight className="w-3 h-3" /> GW01
              </p>
            </div>

            <div className="p-3 bg-industrial-100 dark:bg-industrial-800 rounded-lg border border-industrial-300 dark:border-industrial-700 w-full max-w-xs text-xs font-mono space-y-1">
              <span className="font-bold text-industrial-900 dark:text-white">Backup Relay Path</span>
              <p className="text-[11px] text-sky-600 font-semibold flex items-center justify-center gap-1">
                N1 <ArrowRight className="w-3 h-3" /> N3 <ArrowRight className="w-3 h-3" /> GW01
              </p>
            </div>
          </div>

          {/* ESP32 Gateway Node */}
          <div className="flex flex-col items-center justify-center p-6 bg-industrial-800 dark:bg-industrial-950 text-white rounded-lg border border-industrial-700 text-center space-y-2">
            <Server className="w-8 h-8 text-amber-400" />
            <h4 className="font-heading font-bold text-sm">ESP32 Gateway (MG-GW-01)</h4>
            <p className="text-[10px] font-mono text-industrial-300">
              Aggregates surface node ESP-NOW packets & outputs Web Serial JSON
            </p>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
              Aggregator Online
            </span>
          </div>

        </div>
      </div>

      {/* Packet Header Audit Table */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
          Latest Multi-Hop Packet Headers Parsed
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-industrial-50 dark:bg-industrial-950 text-industrial-600 dark:text-industrial-400 uppercase text-[10px]">
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
                    <td className="p-3">{n.node_id}</td>
                    <td className="p-3 font-bold text-sky-600">{header?.current_relay || 'GW01'}</td>
                    <td className="p-3">{header?.destination || 'GW01'}</td>
                    <td className="p-3">{header?.hop_count || 1} hop</td>
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
