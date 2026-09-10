import React from 'react';
import { Radio, Battery, Signal, AlertOctagon, CheckCircle2, Zap, Activity } from 'lucide-react';
import { NodeTelemetry, DisplacementLink } from '../types/telemetry';

interface SensorNodesProps {
  nodes: NodeTelemetry[];
  links: DisplacementLink[];
}

export const SensorNodes: React.FC<SensorNodesProps> = ({ nodes, links }) => {
  return (
    <div className="space-y-6 font-body">
      <div>
        <h2 className="text-lg font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-amber-500" />
          Surface Sensor Nodes (N1–N4)
        </h2>
        <p className="text-xs text-industrial-500 dark:text-industrial-400">
          Telemetry feeds from surface sensor nodes deployed above Coal Panel A-01.
        </p>
      </div>

      {/* Nodes Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div
            key={node.node_id}
            className={`p-5 rounded-lg border shadow-sm transition space-y-4 ${
              node.status === 'CRITICAL'
                ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/60'
                : node.status === 'WARNING'
                  ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60'
                  : 'bg-white border-industrial-200 dark:bg-industrial-900 dark:border-industrial-800'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-industrial-200 dark:border-industrial-800">
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold font-heading text-industrial-900 dark:text-white">
                  Node {node.node_id}
                </span>
                <span className="text-xs font-mono text-industrial-500">
                  Seq #{node.sequence}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                  node.status === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : node.status === 'WARNING'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                }`}>
                  {node.status}
                </span>
              </div>
            </div>

            {/* Telemetry Parameter Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 space-y-1">
                <span className="text-[10px] text-industrial-500 font-heading block">SURFACE TILT</span>
                <p className="text-sm font-bold text-industrial-900 dark:text-white">
                  {node.tilt_magnitude_deg}°
                </p>
                <p className="text-[10px] text-industrial-400">
                  X: {node.tilt_x_deg}° | Y: {node.tilt_y_deg}°
                </p>
              </div>

              <div className="p-2.5 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 space-y-1">
                <span className="text-[10px] text-industrial-500 font-heading block">DISPLACEMENT</span>
                <p className="text-sm font-bold text-industrial-900 dark:text-white">
                  {node.displacement_mm} mm
                </p>
                <p className="text-[10px] text-industrial-400">
                  Delta vs Baseline
                </p>
              </div>

              <div className="p-2.5 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 space-y-1">
                <span className="text-[10px] text-industrial-500 font-heading block">VIBRATION RMS</span>
                <p className="text-sm font-bold text-industrial-900 dark:text-white">
                  {node.vibration_rms} g
                </p>
                <p className="text-[10px] text-industrial-400">
                  Peak: {node.vibration_peak}g
                </p>
              </div>

              <div className="p-2.5 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 space-y-1">
                <span className="text-[10px] text-industrial-500 font-heading block">CRACK DETECTOR</span>
                <p className={`text-xs font-bold ${node.crack_detected ? 'text-red-600' : 'text-emerald-600'}`}>
                  {node.crack_detected ? 'BRIDGE SEPARATED' : 'INTACT'}
                </p>
                <p className="text-[10px] text-industrial-400">
                  Continuity check
                </p>
              </div>
            </div>

            {/* Footer status bar */}
            <div className="pt-2 border-t border-industrial-200 dark:border-industrial-800 flex justify-between items-center text-[11px] text-industrial-500 font-mono">
              <div className="flex items-center space-x-1">
                <Battery className="w-3.5 h-3.5 text-industrial-400" />
                <span>{node.battery_percent}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Signal className="w-3.5 h-3.5 text-industrial-400" />
                <span>{node.signal_strength} dBm</span>
              </div>
              <div>
                <span>Buzzer: </span>
                <span className={`font-bold ${node.local_alarm ? 'text-red-600 animate-pulse' : 'text-industrial-400'}`}>
                  {node.local_alarm ? 'ALARM ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Relative Displacement Link Overview */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
          Surface Displacement Links (Node Pairs)
        </h3>
        <p className="text-xs text-industrial-500 dark:text-industrial-400">
          Measures change in relative distance between pairs of surface monitored points.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          {links.map((link) => (
            <div
              key={link.link_id}
              className={`p-3 rounded border ${
                link.status === 'CRITICAL'
                  ? 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900'
                  : link.status === 'WARNING'
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900'
                    : 'bg-industrial-50 border-industrial-200 dark:bg-industrial-950 dark:border-industrial-800'
              }`}
            >
              <div className="flex justify-between font-bold">
                <span>Link {link.link_id}</span>
                <span className={`text-[10px] px-1 rounded ${
                  link.status === 'CRITICAL' ? 'bg-red-600 text-white' : link.status === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {link.status}
                </span>
              </div>
              <p className="text-[10px] text-industrial-500 mt-1">Nodes: {link.node_a} &bull; {link.node_b}</p>
              <p className="text-sm font-extrabold mt-1 text-industrial-900 dark:text-white">
                {link.relative_displacement_mm} mm
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
