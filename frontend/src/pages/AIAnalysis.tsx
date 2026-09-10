import React from 'react';
import { BrainCircuit, ShieldAlert, Cpu, Database, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { AIRiskAssessment, NodeTelemetry } from '../types/telemetry';

interface AIAnalysisProps {
  riskAssessment: AIRiskAssessment;
  nodes: NodeTelemetry[];
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ riskAssessment, nodes }) => {
  return (
    <div className="space-y-6 font-body">
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-500" />
          AI / ML Surface Risk Assessment Engine
        </h2>
        <p className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
          Spatial-temporal feature matrix evaluation via Random Forest classifier & local rule fallback engine.
        </p>
      </div>

      {/* Mandatory Honest Dataset Label Banner (Priority 6) */}
      <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-mono space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-purple-900 dark:text-purple-300 text-sm">
            <Cpu className="w-4 h-4 text-purple-500" />
            <span>DEMONSTRATION ML MODEL — SYNTHETIC TRAINING DATA</span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200 font-bold text-[10px] uppercase">
            Not Field Validated
          </span>
        </div>
        <p className="text-purple-800 dark:text-purple-300 text-xs">
          Assessment Source: <span className="font-bold underline">{riskAssessment.assessment_source || 'Local Rule Engine'}</span> &bull; Status: <span className="font-semibold">{riskAssessment.dataset_label}</span>
        </p>
        <p className="text-[11px] text-purple-700 dark:text-purple-400 leading-relaxed">
          Notice: MineGuard-AI is a student prototype platform. Model accuracy reflects performance on synthetic surface deformation datasets and does not constitute certified mine safety or collapse prediction accuracy.
        </p>
      </div>

      {/* Main AI Classification Result Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Risk Classification Badge */}
        <div className={`p-5 rounded-lg border shadow-sm ${
          riskAssessment.risk_level === 'CRITICAL'
            ? 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900'
            : riskAssessment.risk_level === 'WARNING'
              ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900'
              : 'bg-white border-industrial-200 dark:bg-industrial-900 dark:border-industrial-800'
        }`}>
          <span className="text-xs font-heading font-semibold text-industrial-500">Evaluated Risk Class</span>
          <div className="mt-2 flex items-baseline space-x-3">
            <span className={`text-3xl font-extrabold font-heading ${
              riskAssessment.risk_level === 'CRITICAL' 
                ? 'text-status-critical' 
                : riskAssessment.risk_level === 'WARNING' 
                  ? 'text-status-warning' 
                  : 'text-status-safe'
            }`}>
              {riskAssessment.risk_level}
            </span>
          </div>
          <p className="text-xs font-mono text-industrial-600 dark:text-industrial-400 mt-3">
            Model: {riskAssessment.model_type}
          </p>
        </div>

        {/* Risk Score Probability */}
        <div className="p-5 bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg shadow-sm">
          <span className="text-xs font-heading font-semibold text-industrial-500">Calculated Risk Score</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-heading text-industrial-900 dark:text-white font-mono">
              {(riskAssessment.risk_score * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-industrial-500 font-mono">
              ({riskAssessment.risk_score} / 1.0)
            </span>
          </div>
          
          <div className="w-full h-2 bg-industrial-100 dark:bg-industrial-800 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                riskAssessment.risk_level === 'CRITICAL'
                  ? 'bg-red-500'
                  : riskAssessment.risk_level === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${riskAssessment.risk_score * 100}%` }}
            />
          </div>
        </div>

        {/* Affected Nodes & Primary Factor */}
        <div className="p-5 bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg shadow-sm">
          <span className="text-xs font-heading font-semibold text-industrial-500">Affected Node Cluster</span>
          <div className="mt-2 flex flex-wrap gap-1.5 font-mono">
            {riskAssessment.affected_nodes.length > 0 ? (
              riskAssessment.affected_nodes.map((nodeId) => (
                <span
                  key={nodeId}
                  className="px-2 py-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 rounded text-xs font-bold"
                >
                  Node {nodeId}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 font-semibold">No nodes in risk state</span>
            )}
          </div>
          <p className="text-[11px] font-mono text-industrial-500 mt-3 line-clamp-2">
            Calculated at: {new Date(riskAssessment.calculated_at).toLocaleTimeString()}
          </p>
        </div>

      </div>

      {/* Feature Matrix Table */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
          Spatial-Temporal Feature Matrix Input
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-industrial-50 dark:bg-industrial-950 text-industrial-600 dark:text-industrial-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Node ID</th>
                <th className="p-3">Tilt Mag (°)</th>
                <th className="p-3">Displacement (mm)</th>
                <th className="p-3">Vib RMS (g)</th>
                <th className="p-3">Crack State</th>
                <th className="p-3">Neighbour Anomaly</th>
                <th className="p-3">Node Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-100 dark:divide-industrial-800">
              {nodes.map((node) => {
                const neighbourAnomalies = nodes.filter(n => n.node_id !== node.node_id && n.status !== 'SAFE').length;
                return (
                  <tr key={node.node_id} className="hover:bg-industrial-50/50 dark:hover:bg-industrial-800/50">
                    <td className="p-3 font-bold text-industrial-900 dark:text-white">Node {node.node_id}</td>
                    <td className="p-3">{node.tilt_magnitude_deg}°</td>
                    <td className="p-3">{node.displacement_mm} mm</td>
                    <td className="p-3">{node.vibration_rms} g</td>
                    <td className={`p-3 font-bold ${node.crack_detected ? 'text-red-600' : 'text-emerald-600'}`}>
                      {node.crack_detected ? 'BROKEN' : 'INTACT'}
                    </td>
                    <td className="p-3">{neighbourAnomalies} neighbours</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        node.status === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : node.status === 'WARNING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {node.status}
                      </span>
                    </td>
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
