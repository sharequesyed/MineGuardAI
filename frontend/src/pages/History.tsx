import React, { useState } from 'react';
import { History as HistoryIcon, Download, Calendar } from 'lucide-react';
import { NodeTelemetry } from '../types/telemetry';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoryProps {
  nodes: NodeTelemetry[];
}

export const History: React.FC<HistoryProps> = ({ nodes }) => {
  const [timeWindow, setTimeWindow] = useState<string>('LIVE');

  // Generate historical trend points for visualization
  const historyData = [
    { time: '10:00', N1_tilt: 0.2, N2_tilt: 0.3, N3_tilt: 0.5, N4_tilt: 0.4, N3_disp: 1.2 },
    { time: '10:05', N1_tilt: 0.3, N2_tilt: 0.4, N3_tilt: 1.2, N4_tilt: 0.8, N3_disp: 2.5 },
    { time: '10:10', N1_tilt: 0.2, N2_tilt: 0.5, N3_tilt: 2.8, N4_tilt: 1.6, N3_disp: 5.8 },
    { time: '10:15', N1_tilt: 0.4, N2_tilt: 0.6, N3_tilt: 4.5, N4_tilt: 3.2, N3_disp: 12.4 },
    { time: '10:20', N1_tilt: 0.5, N2_tilt: 0.7, N3_tilt: nodes.find(n => n.node_id === 'N3')?.tilt_magnitude_deg || 5.8, N4_tilt: nodes.find(n => n.node_id === 'N4')?.tilt_magnitude_deg || 4.2, N3_disp: nodes.find(n => n.node_id === 'N3')?.displacement_mm || 14.2 },
  ];

  const handleExportCSV = () => {
    const csvRows = [
      ['Node_ID', 'Timestamp', 'Tilt_Magnitude_Deg', 'Tilt_X_Deg', 'Tilt_Y_Deg', 'Displacement_MM', 'Vibration_RMS_G', 'Crack_Detected', 'Status'],
      ...nodes.map(n => [
        n.node_id,
        n.timestamp,
        n.tilt_magnitude_deg,
        n.tilt_x_deg,
        n.tilt_y_deg,
        n.displacement_mm,
        n.vibration_rms,
        n.crack_detected,
        n.status
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MineGuard_Telemetry_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-sky-500" />
            Historical Telemetry & Deformation Trends
          </h2>
          <p className="text-xs text-industrial-500 dark:text-industrial-400">
            Time-series trend analysis for tilt magnitude, displacement delta, and surface vibration.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Window Buttons */}
          <div className="flex bg-industrial-100 dark:bg-industrial-800 p-1 rounded-md text-xs font-mono">
            {['LIVE', '1H', '24H', '7D'].map((window) => (
              <button
                key={window}
                onClick={() => setTimeWindow(window)}
                className={`px-3 py-1 rounded transition ${
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
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
          Surface Node Tilt Magnitude Profile (Degrees)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="N1_tilt" stroke="#10B981" name="Node N1 Tilt (°)" strokeWidth={2} />
              <Line type="monotone" dataKey="N2_tilt" stroke="#3B82F6" name="Node N2 Tilt (°)" strokeWidth={2} />
              <Line type="monotone" dataKey="N3_tilt" stroke="#EF4444" name="Node N3 Tilt (°)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="N4_tilt" stroke="#F59E0B" name="Node N4 Tilt (°)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Relative Displacement Historical Chart */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold font-heading text-industrial-900 dark:text-white">
          Surface Displacement Delta Profile (Node N3–N4 Link)
        </h3>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.4} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
              <Line type="monotone" dataKey="N3_disp" stroke="#DC2626" name="Displacement (mm)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
