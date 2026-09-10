import React from 'react';
import { FileText, Printer, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { NodeTelemetry, DisplacementLink, AIRiskAssessment, SystemAlert } from '../types/telemetry';

interface ReportsProps {
  nodes: NodeTelemetry[];
  links: DisplacementLink[];
  riskAssessment: AIRiskAssessment;
  alerts: SystemAlert[];
}

export const Reports: React.FC<ReportsProps> = ({ nodes, links, riskAssessment, alerts }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            Surface Subsidence Monitoring Event Summary
          </h2>
          <p className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
            Generate and export printable surface deformation report summaries for mine operators.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-industrial-800 hover:bg-industrial-900 text-white dark:bg-industrial-700 transition shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Report Document Frame */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-8 shadow-sm space-y-6 font-body text-industrial-900 dark:text-white print:border-none print:shadow-none print:p-0">
        
        {/* Report Document Header */}
        <div className="flex justify-between items-start border-b border-industrial-300 dark:border-industrial-700 pb-4">
          <div>
            <h1 className="text-xl font-bold font-heading">MINEGUARD-AI SURFACE MONITORING REPORT</h1>
            <p className="text-xs font-mono text-industrial-500 mt-1">
              SIH26025 Surface Mine Subsidence Monitoring Platform Prototype
            </p>
          </div>
          <div className="text-right text-xs font-mono text-industrial-600 dark:text-industrial-400 space-y-0.5">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Time: {new Date().toLocaleTimeString()}</div>
            <div>Coalfield: Jharia Coalfield</div>
            <div>Panel: Panel A-01</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-heading text-industrial-500 uppercase tracking-wider">
            1. Executive Summary
          </h3>
          <div className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 text-xs leading-relaxed font-mono">
            Surface monitoring equipment deployed above underground Coal Panel A-01 evaluated current deformation risk as <span className="font-bold">{riskAssessment.risk_level}</span> (Risk Score: {riskAssessment.risk_score}). Primary factor: {riskAssessment.primary_factor}. Total active surface nodes: {nodes.length}.
          </div>
        </div>

        {/* Surface Sensor Telemetry Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-heading text-industrial-500 uppercase tracking-wider">
            2. Surface Sensor Node Status
          </h3>
          <table className="w-full text-left text-xs font-mono border border-industrial-200 dark:border-industrial-800">
            <thead className="bg-industrial-100 dark:bg-industrial-800 text-industrial-700 dark:text-industrial-300 uppercase text-[10px]">
              <tr>
                <th className="p-2 border-b">Node</th>
                <th className="p-2 border-b">Tilt Mag (°)</th>
                <th className="p-2 border-b">Tilt X / Y (°)</th>
                <th className="p-2 border-b">Displacement (mm)</th>
                <th className="p-2 border-b">Vib RMS (g)</th>
                <th className="p-2 border-b">Crack Bridge</th>
                <th className="p-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-200 dark:divide-industrial-800">
              {nodes.map(n => (
                <tr key={n.node_id}>
                  <td className="p-2 font-bold">Node {n.node_id}</td>
                  <td className="p-2">{n.tilt_magnitude_deg}°</td>
                  <td className="p-2">({n.tilt_x_deg}°, {n.tilt_y_deg}°)</td>
                  <td className="p-2">{n.displacement_mm} mm</td>
                  <td className="p-2">{n.vibration_rms} g</td>
                  <td className="p-2">{n.crack_detected ? 'BROKEN' : 'INTACT'}</td>
                  <td className="p-2 font-bold">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Relative Displacement Links Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-heading text-industrial-500 uppercase tracking-wider">
            3. Relative Surface Displacement Links
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {links.map(link => (
              <div key={link.link_id} className="p-2.5 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800 flex justify-between">
                <span>Link {link.link_id} ({link.node_a}–{link.node_b})</span>
                <span className="font-bold">{link.relative_displacement_mm} mm</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI & Validation Disclaimer */}
        <div className="pt-4 border-t border-industrial-200 dark:border-industrial-800 text-[10px] font-mono text-industrial-500 space-y-1">
          <p>Model Evaluation: {riskAssessment.model_type}</p>
          <p>Dataset Label: {riskAssessment.dataset_label}</p>
          <p>* Student Prototype Notice: Generated for prototype demonstration under SIH26025 specification.</p>
        </div>

      </div>
    </div>
  );
};
