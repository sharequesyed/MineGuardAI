import React from 'react';
import { BellRing, X, CheckCircle, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Incident } from '../types/telemetry';

interface AlertsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onAcknowledge: (id: string) => void;
  onViewZone: (nodeId: string) => void;
}

export const AlertsDrawerModal: React.FC<AlertsDrawerModalProps> = ({
  isOpen,
  onClose,
  incidents,
  onAcknowledge,
  onViewZone
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end font-body">
      <div className="bg-white dark:bg-industrial-900 border-l border-industrial-200 dark:border-industrial-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-industrial-200 dark:border-industrial-800 bg-industrial-50 dark:bg-industrial-950">
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
              Safety Incident Lifecycle Center
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-industrial-400 hover:text-industrial-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Incidents List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {incidents.length === 0 ? (
            <div className="py-12 text-center text-industrial-400">
              <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-industrial-300 dark:text-industrial-600" />
              <p className="text-xs font-semibold font-heading">No Active Safety Incidents</p>
              <p className="text-[11px] text-industrial-500 mt-1">
                Surface sensor network parameters are normal.
              </p>
            </div>
          ) : (
            incidents.map((inc) => (
              <div
                key={inc.incident_id}
                className={`p-4 rounded-lg border text-xs transition space-y-2.5 ${
                  inc.severity === 'CRITICAL'
                    ? 'bg-red-50/70 border-red-200 dark:bg-red-950/40 dark:border-red-900/60'
                    : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="font-mono text-[10px] text-industrial-500 dark:text-industrial-400">
                      {new Date(inc.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    inc.status === 'ACTIVE'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : inc.status === 'ACKNOWLEDGED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <p className="font-semibold text-industrial-900 dark:text-white text-xs leading-snug">
                  {inc.zone_link} &bull; Affected Nodes: <span className="font-mono font-bold">{inc.node_ids.join(', ')}</span>
                </p>
                
                <div className="p-2 bg-white/80 dark:bg-industrial-950/80 rounded border border-industrial-200/60 dark:border-industrial-800/60 text-[11px] font-mono space-y-0.5 text-industrial-700 dark:text-industrial-300">
                  <div>Tilt: <b>{inc.latest_snapshot.tilt_mag}°</b> | Disp: <b>{inc.latest_snapshot.disp_mm} mm</b></div>
                  <div>Vib: <b>{inc.latest_snapshot.vib_rms} g</b> | Crack: <b>{inc.latest_snapshot.crack ? 'BROKEN' : 'INTACT'}</b></div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-industrial-200/60 dark:border-industrial-800/60 flex justify-between items-center text-[10px] font-mono">
                  <button
                    onClick={() => {
                      onViewZone(inc.node_ids[0] || 'N3');
                      onClose();
                    }}
                    className="flex items-center space-x-1 text-sky-600 dark:text-sky-400 font-bold hover:underline"
                  >
                    <span>View Zone</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {inc.status === 'ACTIVE' && (
                    <button
                      onClick={() => onAcknowledge(inc.incident_id)}
                      className="px-2 py-1 font-semibold rounded bg-industrial-800 text-white hover:bg-industrial-900 dark:bg-industrial-700 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-industrial-200 dark:border-industrial-800 bg-industrial-50 dark:bg-industrial-950">
          <p className="text-[10px] text-industrial-500 dark:text-industrial-400 text-center font-mono">
            Incident audit trail persists in IndexedDB offline storage.
          </p>
        </div>

      </div>
    </div>
  );
};

