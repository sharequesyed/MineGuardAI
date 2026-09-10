import React, { useState } from 'react';
import { BellRing, ShieldAlert, CheckCircle, Filter } from 'lucide-react';
import { SystemAlert } from '../types/telemetry';

interface AlertsProps {
  alerts: SystemAlert[];
  onAcknowledge: (id: string) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ alerts, onAcknowledge }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            Safety Alert Audit Log
          </h2>
          <p className="text-xs text-industrial-500 dark:text-industrial-400">
            Historical audit trail of threshold breaches, surface crack events, and operator acknowledgements.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2 text-xs font-heading">
          <Filter className="w-4 h-4 text-industrial-400" />
          <span className="text-industrial-600 dark:text-industrial-400">Filter:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-industrial-200 dark:border-industrial-700 bg-white dark:bg-industrial-800 text-industrial-900 dark:text-white font-mono text-xs shadow-sm focus:outline-none"
          >
            <option value="ALL">All Severities ({alerts.length})</option>
            <option value="CRITICAL">Critical ({alerts.filter(a => a.severity === 'CRITICAL').length})</option>
            <option value="WARNING">Warning ({alerts.filter(a => a.severity === 'WARNING').length})</option>
          </select>
        </div>
      </div>

      {/* Alerts Table / List */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-industrial-400">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-industrial-300 dark:text-industrial-600" />
            <p className="text-xs font-semibold font-heading">No Safety Alerts Logged</p>
            <p className="text-[11px] text-industrial-500 mt-1">
              All monitored surface parameters are within normal baseline thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border text-xs transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-50/70 border-red-200 dark:bg-red-950/40 dark:border-red-900/60'
                    : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono text-[11px] text-industrial-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-industrial-400 bg-industrial-200/60 dark:bg-industrial-800 px-1.5 py-0.5 rounded">
                      Node: {alert.node_ids.join(', ')}
                    </span>
                  </div>
                  <p className="font-semibold text-industrial-900 dark:text-white text-sm">
                    {alert.message}
                  </p>
                  <p className="text-[11px] font-mono text-industrial-600 dark:text-industrial-400">
                    Telemetry Snapshot: {alert.value_summary}
                  </p>
                </div>

                <div className="shrink-0 flex items-center space-x-3">
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-industrial-800 text-white hover:bg-industrial-900 dark:bg-industrial-700 transition shadow-sm"
                    >
                      Acknowledge Alert
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Acknowledged</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
