import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Radio, 
  Zap, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Maximize2 
} from 'lucide-react';
import { NodeTelemetry, DisplacementLink, AIRiskAssessment, SystemMode, TelemetryHistoryPoint } from '../types/telemetry';
import { GisMap } from '../components/GisMap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  nodes: NodeTelemetry[];
  links: DisplacementLink[];
  riskAssessment: AIRiskAssessment;
  mode: SystemMode;
  historyBuffer: TelemetryHistoryPoint[];
  onNavigatePage: (page: any) => void;
  onOpenHardwareModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  nodes,
  links,
  riskAssessment,
  mode,
  historyBuffer,
  onNavigatePage,
  onOpenHardwareModal,
}) => {
  const criticalCount = nodes.filter(n => n.status === 'CRITICAL').length;
  const warningCount = nodes.filter(n => n.status === 'WARNING').length;
  const safeCount = nodes.filter(n => n.status === 'SAFE').length;

  // Chart telemetry data using live history buffer or current snapshot
  const chartData = historyBuffer.length > 0 ? historyBuffer : nodes.map(n => ({
    timestamp: new Date().toLocaleTimeString(),
    N1_tilt: nodes.find(x => x.node_id === 'N1')?.tilt_magnitude_deg || 0,
    N2_tilt: nodes.find(x => x.node_id === 'N2')?.tilt_magnitude_deg || 0,
    N3_tilt: nodes.find(x => x.node_id === 'N3')?.tilt_magnitude_deg || 0,
    N4_tilt: nodes.find(x => x.node_id === 'N4')?.tilt_magnitude_deg || 0,
    N3_N4_link_disp: links.find(l => l.link_id === 'L34')?.relative_displacement_mm || 0,
  }));


  return (
    <div className="space-y-6 font-body">
      
      {/* Simulation Banner Notice */}
      {mode === 'SIMULATION' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span className="text-xs font-semibold font-mono text-amber-900 dark:text-amber-300">
              SIMULATION MODE ACTIVE — Demonstrating Surface Subsidence Deformation Scenarios
            </span>
          </div>
          <button
            onClick={onOpenHardwareModal}
            className="text-xs font-heading font-medium underline text-amber-800 hover:text-amber-950 dark:text-amber-300"
          >
            Switch to USB Hardware
          </button>
        </div>
      )}

      {/* Top Metrics & AI Risk Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Surface Subsidence Risk Status (Priority 6) */}
        <div className={`p-4 rounded-lg border shadow-sm flex flex-col justify-between ${
          riskAssessment.risk_level === 'CRITICAL'
            ? 'bg-red-50/80 border-red-200 dark:bg-red-950/30 dark:border-red-900'
            : riskAssessment.risk_level === 'WARNING'
              ? 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
              : 'bg-white border-industrial-200 dark:bg-industrial-900 dark:border-industrial-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs text-industrial-500 font-heading">
              <span className="font-bold tracking-tight uppercase text-industrial-700 dark:text-industrial-300">SURFACE SUBSIDENCE RISK</span>
              <ShieldAlert className={`w-4 h-4 ${
                riskAssessment.risk_level === 'CRITICAL' ? 'text-status-critical' : 'text-status-warning'
              }`} />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className={`text-2xl font-extrabold font-heading ${
                riskAssessment.risk_level === 'CRITICAL' 
                  ? 'text-status-critical' 
                  : riskAssessment.risk_level === 'WARNING' 
                    ? 'text-status-warning' 
                    : 'text-status-safe'
              }`}>
                {riskAssessment.risk_level}
              </span>
              <span className="text-xs font-mono text-industrial-500">
                Score: {riskAssessment.risk_score}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-industrial-200/60 dark:border-industrial-800/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-industrial-500">Assessment:</span>
            <span className="font-semibold text-industrial-800 dark:text-industrial-200 bg-industrial-100 dark:bg-industrial-800 px-1.5 py-0.5 rounded">
              {riskAssessment.assessment_source || 'Local Rule Engine'}
            </span>
          </div>
        </div>

        {/* Card 2: Active Surface Nodes */}
        <div className="p-4 bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-industrial-500 font-heading">
            <span>Surface Sensor Nodes</span>
            <Radio className="w-4 h-4 text-industrial-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold font-heading text-industrial-900 dark:text-white">
              {nodes.length} / 4
            </span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">Active</span>
          </div>
          <div className="mt-2 flex items-center space-x-3 text-[11px] font-mono">
            <span className="text-status-safe font-bold">{safeCount} Safe</span>
            <span className="text-status-warning font-bold">{warningCount} Warn</span>
            <span className="text-status-critical font-bold">{criticalCount} Crit</span>
          </div>
        </div>

        {/* Card 3: Max Displacement Delta */}
        <div className="p-4 bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-industrial-500 font-heading">
            <span>Max Displacement Link</span>
            <Activity className="w-4 h-4 text-industrial-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold font-heading text-industrial-900 dark:text-white font-mono">
              {Math.max(...nodes.map(n => n.displacement_mm)).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-industrial-500">mm</span>
          </div>
          <p className="text-[11px] text-industrial-500 dark:text-industrial-400 mt-2 font-mono">
            Link L34 (N3–N4 Surface Link)
          </p>
        </div>

        {/* Card 4: Crack Continuity Status */}
        <div className="p-4 bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-industrial-500 font-heading">
            <span>Crack Detector Bridge</span>
            <Zap className="w-4 h-4 text-industrial-400" />
          </div>
          <div className="mt-2">
            {nodes.some(n => n.crack_detected) ? (
              <span className="text-lg font-bold font-heading text-status-critical flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 mr-1 text-status-critical inline" />
                CRACK TRIGGERED
              </span>
            ) : (
              <span className="text-lg font-bold font-heading text-status-safe flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 mr-1 text-status-safe inline" />
                BRIDGES INTACT
              </span>
            )}
          </div>
          <p className="text-[11px] text-industrial-500 dark:text-industrial-400 mt-2 font-mono">
            Continuity line status: Normal
          </p>
        </div>

      </div>

      {/* Main Element: LIVE SURFACE RISK MAP */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
              LIVE SURFACE RISK MAP — PANEL A-01
              <span className="text-[10px] font-mono font-normal bg-industrial-100 dark:bg-industrial-800 text-industrial-600 dark:text-industrial-300 px-2 py-0.5 rounded">
                Surface Level Overlay
              </span>
            </h2>
            <p className="text-xs text-industrial-500 dark:text-industrial-400">
              Interactive surface node coordinates, Turf.js deformation boundaries, and node displacement links.
            </p>
          </div>
          <button
            onClick={() => onNavigatePage('map')}
            className="flex items-center space-x-1 text-xs font-semibold font-heading text-industrial-700 dark:text-industrial-300 hover:text-industrial-900 transition"
          >
            <span>Expand Map</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <GisMap
          nodes={nodes}
          links={links}
          riskAssessment={riskAssessment}
          height="420px"
          onSelectNode={() => onNavigatePage('nodes')}
        />
      </div>

      {/* Bottom Grid: Node Telemetry & Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Node Telemetry Quick Matrix */}
        <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
              Surface Sensor Nodes Summary
            </h3>
            <button
              onClick={() => onNavigatePage('nodes')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center"
            >
              View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {nodes.map((node) => (
              <div
                key={node.node_id}
                className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded-md border border-industrial-200 dark:border-industrial-800 text-xs space-y-1"
              >
                <div className="flex justify-between items-center font-mono font-bold">
                  <span className="text-industrial-900 dark:text-white">Node {node.node_id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    node.status === 'CRITICAL'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold'
                      : node.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                  }`}>
                    {node.status}
                  </span>
                </div>
                <div className="text-[11px] text-industrial-600 dark:text-industrial-400 font-mono space-y-0.5">
                  <div>Tilt Mag: <span className="font-semibold text-industrial-900 dark:text-white">{node.tilt_magnitude_deg}°</span></div>
                  <div>Disp: <span className="font-semibold text-industrial-900 dark:text-white">{node.displacement_mm} mm</span></div>
                  <div>Vib RMS: <span className="font-semibold text-industrial-900 dark:text-white">{node.vibration_rms} g</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Telemetry Trend Chart */}
        <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
              Telemetry Deformation Profiles
            </h3>
            <span className="text-[10px] font-mono text-emerald-600 font-bold animate-pulse">Live Streaming</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} />
                <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="N3_tilt" stroke="#F59E0B" name="Node N3 Tilt (°)" strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="N3_N4_link_disp" stroke="#EF4444" name="N3–N4 Displacement (mm)" strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>

    </div>
  );
};
