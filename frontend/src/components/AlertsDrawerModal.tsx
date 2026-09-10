import React from 'react';
import { BellRing, X, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SystemAlert } from '../types/telemetry';

interface AlertsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onAcknowledge: (id: string) => void;
}

export const AlertsDrawerModal: React.FC<AlertsDrawerModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white dark:bg-industrial-900 border-l border-industrial-200 dark:border-industrial-800 w-full max-w-md h-full flex flex-col shadow-2xl font-body">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-industrial-200 dark:border-industrial-800 bg-industrial-50 dark:bg-industrial-950">
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
              System Alert Audit Center
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-industrial-400 hover:text-industrial-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Alert History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-industrial-400">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-industrial-300 dark:text-industrial-600" />
              <p className="text-xs font-semibold font-heading">No Active Safety Alerts</p>
              <p className="text-[11px] text-industrial-500 mt-1">
                Surface sensor network parameters are normal.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border text-xs transition ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-50/70 border-red-200 dark:bg-red-950/40 dark:border-red-900/60'
                    : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-mono text-[10px] text-industrial-500 dark:text-industrial-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="px-2 py-1 text-[10px] font-semibold rounded bg-industrial-800 text-white hover:bg-industrial-900 dark:bg-industrial-700 transition"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      <span>Acked</span>
                    </span>
                  )}
                </div>

                <p className="font-semibold text-industrial-900 dark:text-white mt-2 leading-snug">
                  {alert.message}
                </p>
                
                <div className="mt-2 pt-2 border-t border-industrial-200/60 dark:border-industrial-800/60 flex justify-between text-[10px] text-industrial-500 font-mono">
                  <span>Metrics: {alert.value_summary}</span>
                  <span>Mode: {alert.connection_mode}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-industrial-200 dark:border-industrial-800 bg-industrial-50 dark:bg-industrial-950">
          <p className="text-[10px] text-industrial-500 dark:text-industrial-400 text-center font-mono">
            Alert logs persist in offline IndexedDB audit store.
          </p>
        </div>

      </div>
    </div>
  );
};
