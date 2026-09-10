import React, { useState } from 'react';
import { GisMap } from '../components/GisMap';
import { NodeTelemetry, DisplacementLink, AIRiskAssessment } from '../types/telemetry';
import { MapPin, Info, Layers } from 'lucide-react';

interface LiveMapProps {
  nodes: NodeTelemetry[];
  links: DisplacementLink[];
  riskAssessment: AIRiskAssessment;
}

export const LiveMap: React.FC<LiveMapProps> = ({ nodes, links, riskAssessment }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('N3');
  const selectedNode = nodes.find(n => n.node_id === selectedNodeId);

  return (
    <div className="space-y-4 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            GIS Live Surface Deformation Map
          </h2>
          <p className="text-xs text-industrial-500 dark:text-industrial-400">
            Real-time GIS spatial risk interpolation and surface node relative displacement links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Large GIS Map */}
        <div className="lg:col-span-3">
          <GisMap
            nodes={nodes}
            links={links}
            riskAssessment={riskAssessment}
            height="580px"
            onSelectNode={(id) => setSelectedNodeId(id)}
          />
        </div>

        {/* Selected Node Details Drawer */}
        <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-industrial-200 dark:border-industrial-800">
            <Info className="w-4 h-4 text-industrial-500" />
            <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
              Node Inspector
            </h3>
          </div>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold font-mono text-sm text-industrial-900 dark:text-white">
                  Node {selectedNode.node_id}
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                  selectedNode.status === 'CRITICAL'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : selectedNode.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {selectedNode.status}
                </span>
              </div>

              <div className="p-2.5 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-industrial-500">Surface Lat/Lng:</span>
                  <span className="font-semibold text-industrial-800 dark:text-industrial-200">
                    {selectedNode.lat.toFixed(4)}, {selectedNode.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-industrial-500">Tilt Magnitude:</span>
                  <span className="font-semibold text-industrial-800 dark:text-industrial-200">
                    {selectedNode.tilt_magnitude_deg}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-industrial-500">Tilt (X, Y):</span>
                  <span className="font-semibold text-industrial-800 dark:text-industrial-200">
                    ({selectedNode.tilt_x_deg}°, {selectedNode.tilt_y_deg}°)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-industrial-500">Relative Disp:</span>
                  <span className="font-semibold text-industrial-800 dark:text-industrial-200">
                    {selectedNode.displacement_mm} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-industrial-500">Vibration RMS:</span>
                  <span className="font-semibold text-industrial-800 dark:text-industrial-200">
                    {selectedNode.vibration_rms} g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-industrial-500">Crack Bridge:</span>
                  <span className={`font-semibold ${selectedNode.crack_detected ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedNode.crack_detected ? 'BROKEN' : 'INTACT'}
                  </span>
                </div>
              </div>

              {/* Displacement Links for Selected Node */}
              <div>
                <p className="font-semibold text-industrial-700 dark:text-industrial-300 mb-1.5 font-heading text-[11px]">
                  Connected Surface Displacement Links:
                </p>
                <div className="space-y-1">
                  {links.filter(l => l.node_a === selectedNode.node_id || l.node_b === selectedNode.node_id).map(link => (
                    <div key={link.link_id} className="p-2 bg-industrial-100 dark:bg-industrial-800 rounded font-mono text-[10px] flex justify-between">
                      <span>Link {link.link_id} ({link.node_a}–{link.node_b})</span>
                      <span className="font-bold">{link.relative_displacement_mm} mm</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <p className="text-xs text-industrial-400">Click a surface node on the map to inspect telemetry details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
