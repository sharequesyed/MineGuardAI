import React, { useState } from 'react';
import { History as HistoryIcon, Download } from 'lucide-react';
import { NodeTelemetry, TelemetryHistoryPoint } from '../types/telemetry';
import { LineChart as ReLineChart, Line as ReLine, XAxis as ReXAxis, YAxis as ReYAxis, CartesianGrid as ReCartesianGrid, Tooltip as ReTooltip, Legend as ReLegend, ResponsiveContainer as ReResponsiveContainer } from 'recharts';

interface HistoryProps {
  nodes: NodeTelemetry[];
  historyBuffer: TelemetryHistoryPoint[];
}

export const History: React.FC<HistoryProps> = ({ nodes, historyBuffer }) => {
  const [timeWindow, setTimeWindow] = useState<string>('LIVE');

  // Use real-time dynamic history buffer or fallback snapshot
  const chartData = historyBuffer.length > 0 ? historyBuffer : [
    { timestamp: new Date().toLocaleTimeString(), fullTime: new Date().toISOString(), N1_tilt: 0.2, N2_tilt: 0.3, N3_tilt: 0.5, N4_tilt: 0.4, N1_disp: 0.5, N2_disp: 0.5, N3_disp: 1.2, N4_disp: 0.5, N3_N4_link_disp: 1.2, N1_vib: 0.05, N2_vib: 0.05, N3_vib: 0.05, N4_vib: 0.05 }
  ];

  const handleExportCSV = () => {
    const csvRows = [
      ['Timestamp', 'Node_N1_Tilt', 'Node_N2_Tilt', 'Node_N3_Tilt', 'Node_N4_Tilt', 'Node_N3_Displacement', 'N3_N4_Link_Displacement'],
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
    link.setAttribute('download', `MineGuard_Realtime_Telemetry_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-sky-500" />
            Live Telemetry & Deformation Trends
          </h2>
          <p className="text-xs text-industrial-500 dark:text-industrial-400">
            Real-time streaming time-series trend analysis. X-axis timestamps update live as packets arrive.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Window Buttons */}
          <div className="flex bg-industrial-100 dark:bg-industrial-800 p-1 rounded-md text-xs font-mono">
            {['LIVE', '1H', '24H', '7D'].map((window) => (
              <button
                key={window}
                onClick={() => setTimeWindow(window)}
                className={`px-2.5 py-1 rounded transition text-xs ${
                  timeWindow === window
                    ? 'bg-industrial-800 text-white dark:bg-industrial-700 font-bold'
                    : 'text-industrial-600 dark:text-industrial-400 hover:text-industrial-900'
                }`}
              >
                {window}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Surface Tilt Historical Chart */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 md:p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs md:text-sm font-bold font-heading text-industrial-900 dark:text-white">
            Surface Node Tilt Magnitude Profile (Degrees)
          </h3>
          <span className="text-[10px] font-mono text-emerald-600 font-bold animate-pulse">
            LIVE STREAMING ({chartData.length} pts)
          </span>
        </div>

        <div className="h-64 w-full">
          <ReResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData}>
              <ReCartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} />
              <ReXAxis dataKey="timestamp" stroke="#64748B" fontSize={10} interval="preserveStartEnd" />
              <ReYAxis stroke="#64748B" fontSize={10} domain={[0, 'auto']} />
              <ReTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <ReLegend wrapperStyle={{ fontSize: '11px' }} />
              <ReLine type="monotone" dataKey="N1_tilt" stroke="#10B981" name="Node N1 Tilt (°)" strokeWidth={2} isAnimationActive={false} />
              <ReLine type="monotone" dataKey="N2_tilt" stroke="#3B82F6" name="Node N2 Tilt (°)" strokeWidth={2} isAnimationActive={false} />
              <ReLine type="monotone" dataKey="N3_tilt" stroke="#EF4444" name="Node N3 Tilt (°)" strokeWidth={2.5} isAnimationActive={false} />
              <ReLine type="monotone" dataKey="N4_tilt" stroke="#F59E0B" name="Node N4 Tilt (°)" strokeWidth={2} isAnimationActive={false} />
            </ReLineChart>
          </ReResponsiveContainer>
        </div>
      </div>

      {/* Relative Displacement Historical Chart */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 md:p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs md:text-sm font-bold font-heading text-industrial-900 dark:text-white">
            Surface Displacement Delta Profile (Node N3–N4 Link)
          </h3>
          <span className="text-[10px] font-mono text-emerald-600 font-bold animate-pulse">
            LIVE STREAMING
          </span>
        </div>

        <div className="h-56 w-full">
          <ReResponsiveContainer width="100%" height="100%">
            <ReLineChart data={chartData}>
              <ReCartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} />
              <ReXAxis dataKey="timestamp" stroke="#64748B" fontSize={10} interval="preserveStartEnd" />
              <ReYAxis stroke="#64748B" fontSize={10} domain={[0, 'auto']} />
              <ReTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <ReLine type="monotone" dataKey="N3_N4_link_disp" stroke="#DC2626" name="Displacement Delta (mm)" strokeWidth={2.5} isAnimationActive={false} />
            </ReLineChart>
          </ReResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

