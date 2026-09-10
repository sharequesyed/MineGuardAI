import React, { useState } from 'react';
import { History as HistoryIcon, Download, Eye, EyeOff, Info } from 'lucide-react';
import { NodeTelemetry, TelemetryHistoryPoint } from '../types/telemetry';
import { hardwareDataProvider } from '../services/HardwareDataProvider';
import { LineChart as ReLineChart, Line as ReLine, XAxis as ReXAxis, YAxis as ReYAxis, CartesianGrid as ReCartesianGrid, Tooltip as ReTooltip, Legend as ReLegend, ResponsiveContainer as ReResponsiveContainer } from 'recharts';

interface HistoryProps {
  nodes: NodeTelemetry[];
  historyBuffer: TelemetryHistoryPoint[];
}

export const History: React.FC<HistoryProps> = ({ nodes, historyBuffer }) => {
  const [timeWindow, setTimeWindow] = useState<string>('LIVE');
  const [visibleNodes, setVisibleNodes] = useState<Record<string, boolean>>({
    N1: true,
    N2: true,
    N3: true,
    N4: true,
  });

  const activeMode = hardwareDataProvider.getMode();

  const getSourceBadgeText = () => {
    switch (activeMode) {
      case 'SIMULATION': return 'SIMULATION DATA (Live Engine)';
      case 'USB_SERIAL': return 'LIVE USB DATA (ESP32 Gateway)';
      case 'LOCAL_GATEWAY': return 'LOCAL GATEWAY DATA';
      case 'CLOUD': return 'CLOUD / HISTORICAL DATA';
      default: return 'TELEMETRY STREAM';
    }
  };

  // Time window slicing logic
  const rawData = historyBuffer.length > 0 ? historyBuffer : [
    { timestamp: new Date().toLocaleTimeString(), fullTime: new Date().toISOString(), N1_tilt: 0.2, N2_tilt: 0.3, N3_tilt: 0.5, N4_tilt: 0.4, N1_disp: 0.5, N2_disp: 0.5, N3_disp: 1.2, N4_disp: 0.5, N3_N4_link_disp: 1.2, N1_vib: 0.05, N2_vib: 0.05, N3_vib: 0.05, N4_vib: 0.05 }
  ];

  const getFilteredData = () => {
    if (timeWindow === 'LIVE') return rawData;
    if (timeWindow === '1H') return rawData.slice(-15);
    if (timeWindow === '24H') return rawData.slice(-30);
    if (timeWindow === '7D') return rawData;
    return rawData;
  };

  const chartData = getFilteredData();

  const toggleNode = (nodeId: string) => {
    setVisibleNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Timestamp', 'Node_N1_Tilt_deg', 'Node_N2_Tilt_deg', 'Node_N3_Tilt_deg', 'Node_N4_Tilt_deg', 'Node_N3_Disp_mm', 'N3_N4_Link_Disp_mm'],
      ...chartData.map(pt => [
        pt.timestamp,
        pt.N1_tilt,
        pt.N2_tilt,
        pt.N3_tilt,
        pt.N4_tilt,
        pt.N3_disp,
        pt.N3_N4_link_disp
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MineGuard_Telemetry_History_${activeMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-sky-500" />
            Telemetry History & Time-Series Trends
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {getSourceBadgeText()}
            </span>
            <span className="text-xs text-industrial-500">
              Real-time streaming telemetry analysis. Units: Tilt (°), Disp (mm), Vib (g).
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Window Buttons */}
          <div className="flex bg-industrial-100 dark:bg-industrial-800 p-1 rounded-md text-xs font-mono border border-industrial-200 dark:border-industrial-700">
            {['LIVE', '1H', '24H', '7D'].map((window) => (
              <button
                key={window}
                onClick={() => setTimeWindow(window)}
                className={`px-3 py-1 rounded transition text-xs ${
                  timeWindow === window
                    ? 'bg-industrial-800 text-white dark:bg-industrial-700 font-bold shadow-sm'
                    : 'text-industrial-600 dark:text-industrial-400 hover:text-industrial-900'
                }`}
              >
                {window}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Node Series Visibility Controls */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-3.5 shadow-sm flex flex-wrap items-center gap-3 text-xs font-mono">
        <span className="font-bold text-industrial-700 dark:text-industrial-300">Toggle Node Series:</span>
        {[
          { id: 'N1', label: 'Node N1', color: 'bg-emerald-500' },
          { id: 'N2', label: 'Node N2', color: 'bg-blue-500' },
          { id: 'N3', label: 'Node N3', color: 'bg-red-500' },
          { id: 'N4', label: 'Node N4', color: 'bg-amber-500' },
        ].map(n => (
          <button
            key={n.id}
            onClick={() => toggleNode(n.id)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition ${
              visibleNodes[n.id]
                ? 'bg-industrial-50 border-industrial-300 text-industrial-900 dark:bg-industrial-800 dark:border-industrial-600 dark:text-white font-bold'
                : 'bg-industrial-100/50 border-industrial-200 text-industrial-400 dark:bg-industrial-950 dark:border-industrial-900 opacity-50 line-through'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${n.color}`} />
            <span>{n.label}</span>
            {visibleNodes[n.id] ? <Eye className="w-3 h-3 ml-1" /> : <EyeOff className="w-3 h-3 ml-1 text-industrial-400" />}
          </button>
        ))}
      </div>

      {/* Surface Tilt Historical Chart */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
              Surface Node Tilt Magnitude Profile (Degrees °)
            </h3>
            <p className="text-xs text-industrial-500 font-mono">Monitored tri-axial accelerometer tilt angles across surface points</p>
          </div>
          <span className="text-xs font-mono text-emerald-600 font-bold animate-pulse">
            STREAMING ({chartData.length} pts)
          </span>
        </div>

        <div className="h-72 w-full">
          <ReResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData}>
              <ReCartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} />
              <ReXAxis dataKey="timestamp" stroke="#64748B" fontSize={11} interval="preserveStartEnd" />
              <ReYAxis stroke="#64748B" fontSize={11} domain={[0, 'auto']} unit="°" />
              <ReTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '12px', fontFamily: 'IBM Plex Mono' }} />
              <ReLegend wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter' }} />
              {visibleNodes['N1'] && <ReLine type="monotone" dataKey="N1_tilt" stroke="#10B981" name="Node N1 Tilt (°)" strokeWidth={2} isAnimationActive={false} />}
              {visibleNodes['N2'] && <ReLine type="monotone" dataKey="N2_tilt" stroke="#3B82F6" name="Node N2 Tilt (°)" strokeWidth={2} isAnimationActive={false} />}
              {visibleNodes['N3'] && <ReLine type="monotone" dataKey="N3_tilt" stroke="#EF4444" name="Node N3 Tilt (°)" strokeWidth={2.5} isAnimationActive={false} />}
              {visibleNodes['N4'] && <ReLine type="monotone" dataKey="N4_tilt" stroke="#F59E0B" name="Node N4 Tilt (°)" strokeWidth={2} isAnimationActive={false} />}
            </ReLineChart>
          </ReResponsiveContainer>
        </div>
      </div>

      {/* Relative Displacement Historical Chart */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
              Surface Displacement Delta Profile (Node N3–N4 Link in mm)
            </h3>
            <p className="text-xs text-industrial-500 font-mono">Relative surface shear/separation delta measured between surface monitoring anchors</p>
          </div>
          <span className="text-xs font-mono text-emerald-600 font-bold animate-pulse">
            STREAMING
          </span>
        </div>

        <div className="h-64 w-full">
          <ReResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData}>
              <ReCartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} />
              <ReXAxis dataKey="timestamp" stroke="#64748B" fontSize={11} interval="preserveStartEnd" />
              <ReYAxis stroke="#64748B" fontSize={11} domain={[0, 'auto']} unit=" mm" />
              <ReTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '12px', fontFamily: 'IBM Plex Mono' }} />
              <ReLine type="monotone" dataKey="N3_N4_link_disp" stroke="#DC2626" name="Displacement Delta (mm)" strokeWidth={2.5} isAnimationActive={false} />
            </ReLineChart>
          </ReResponsiveContainer>
        </div>
      </div>

    </div>
  );
};


