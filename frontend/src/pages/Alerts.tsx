import React, { useState } from 'react';
import { BellRing, ShieldAlert, CheckCircle, Filter, ArrowRight, Eye } from 'lucide-react';
import { Incident } from '../types/telemetry';

interface AlertsProps {
  incidents: Incident[];
  onAcknowledge: (id: string) => void;
  onViewZone: (nodeId?: string) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ incidents, onAcknowledge, onViewZone }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterNode, setFilterNode] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');

  const filteredIncidents = incidents.filter(inc => {
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterNode !== 'ALL' && !inc.node_ids.includes(filterNode)) return false;
    if (filterSource !== 'ALL' && inc.source_mode !== filterSource) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-500" />
            Safety Incident Lifecycle & Audit Log
          </h2>
          <p className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
            Incident-based early warning monitoring. Persistent conditions update existing incidents without alert flooding.
          </p>
        </div>
      </div>

      {/* Incident Filters Bar */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center space-x-1.5 text-sm font-semibold text-industrial-700 dark:text-industrial-300 mr-2">
          <Filter className="w-4 h-4 text-industrial-400" />
          <span>Incident Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-industrial-200 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-800 text-industrial-900 dark:text-white font-mono text-xs shadow-sm focus:outline-none"
        >
          <option value="ALL">Status: All ({incidents.length})</option>
          <option value="ACTIVE">Active ({incidents.filter(i => i.status === 'ACTIVE').length})</option>
          <option value="ACKNOWLEDGED">Acknowledged ({incidents.filter(i => i.status === 'ACKNOWLEDGED').length})</option>
          <option value="RESOLVED">Resolved ({incidents.filter(i => i.status === 'RESOLVED').length})</option>
        </select>

        {/* Severity Filter */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-industrial-200 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-800 text-industrial-900 dark:text-white font-mono text-xs shadow-sm focus:outline-none"
        >
          <option value="ALL">Severity: All</option>
          <option value="CRITICAL">Critical ({incidents.filter(i => i.severity === 'CRITICAL').length})</option>
          <option value="WARNING">Warning ({incidents.filter(i => i.severity === 'WARNING').length})</option>
        </select>

        {/* Node Filter */}
        <select
          value={filterNode}
          onChange={(e) => setFilterNode(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-industrial-200 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-800 text-industrial-900 dark:text-white font-mono text-xs shadow-sm focus:outline-none"
        >
          <option value="ALL">Node: All</option>
          <option value="N1">Node N1</option>
          <option value="N2">Node N2</option>
          <option value="N3">Node N3</option>
          <option value="N4">Node N4</option>
        </select>

        {/* Source Filter */}
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-industrial-200 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-800 text-industrial-900 dark:text-white font-mono text-xs shadow-sm focus:outline-none"
        >
          <option value="ALL">Source: All</option>
          <option value="SIMULATION">Simulation Engine</option>
          <option value="USB_SERIAL">USB ESP32 Hardware</option>
          <option value="LOCAL_GATEWAY">Local Gateway</option>
          <option value="CLOUD">Cloud Backend</option>
        </select>
      </div>

      {/* Incident List */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="py-16 text-center text-industrial-400">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-industrial-300 dark:text-industrial-600" />
            <p className="text-base font-bold font-heading text-industrial-700 dark:text-industrial-300">
              No Safety Incidents Found
            </p>
            <p className="text-xs text-industrial-500 mt-1">
              All monitored surface displacement and tilt parameters are within safe operation parameters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map(inc => (
              <div
                key={inc.incident_id}
                className={`p-5 rounded-lg border text-sm transition space-y-3 ${
                  inc.severity === 'CRITICAL'
                    ? 'bg-red-50/70 border-red-200 dark:bg-red-950/40 dark:border-red-900/60'
                    : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60'
                }`}
              >
                {/* Card Top Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-industrial-200/60 dark:border-industrial-800/60 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase tracking-wide ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="font-mono text-xs font-semibold text-industrial-700 dark:text-industrial-300">
                      {inc.incident_id}
                    </span>
                    <span className="text-xs text-industrial-400 font-mono">
                      Source: <b className="text-industrial-600 dark:text-industrial-300">{inc.source_mode}</b>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                      inc.status === 'ACTIVE'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800'
                        : inc.status === 'ACKNOWLEDGED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                </div>

                {/* Main Body Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-industrial-900 dark:text-white text-base">
                      {inc.zone_link}
                    </h3>
                    <p className="text-xs text-industrial-600 dark:text-industrial-400">
                      Affected Monitored Node(s): <span className="font-mono font-bold text-industrial-800 dark:text-industrial-200">{inc.node_ids.join(', ')}</span>
                    </p>
                    <div className="text-xs font-mono space-y-1 text-industrial-500 dark:text-industrial-400 pt-1">
                      <div>First Detected: <span className="text-industrial-700 dark:text-industrial-300">{new Date(inc.created_at).toLocaleString()}</span></div>
                      <div>Latest Telemetry Update: <span className="text-industrial-700 dark:text-industrial-300">{new Date(inc.updated_at).toLocaleString()}</span></div>
                      {inc.escalated_at && (
                        <div className="text-red-600 dark:text-red-400 font-semibold">
                          Escalated to Critical: {new Date(inc.escalated_at).toLocaleString()}
                        </div>
                      )}
                      {inc.resolved_at && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Resolved: {new Date(inc.resolved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Snapshot Box */}
                  <div className="p-3.5 bg-white/90 dark:bg-industrial-950/80 rounded-md border border-industrial-200 dark:border-industrial-800 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-industrial-500 dark:text-industrial-400 mb-2">
                        Latest Telemetry Snapshot
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs text-industrial-800 dark:text-industrial-200">
                        <div className="bg-industrial-50 dark:bg-industrial-900 p-2 rounded">
                          <span className="text-industrial-400 text-[10px] block">TILT MAGNITUDE</span>
                          <span className="font-bold text-sm">{inc.latest_snapshot.tilt_mag}°</span>
                        </div>
                        <div className="bg-industrial-50 dark:bg-industrial-900 p-2 rounded">
                          <span className="text-industrial-400 text-[10px] block">DISPLACEMENT</span>
                          <span className="font-bold text-sm">{inc.latest_snapshot.disp_mm} mm</span>
                        </div>
                        <div className="bg-industrial-50 dark:bg-industrial-900 p-2 rounded">
                          <span className="text-industrial-400 text-[10px] block">VIBRATION RMS</span>
                          <span className="font-bold text-sm">{inc.latest_snapshot.vib_rms} g</span>
                        </div>
                        <div className="bg-industrial-50 dark:bg-industrial-900 p-2 rounded">
                          <span className="text-industrial-400 text-[10px] block">SURFACE CRACK</span>
                          <span className={`font-bold text-sm ${inc.latest_snapshot.crack ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {inc.latest_snapshot.crack ? 'DETECTED' : 'INTACT'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incident Action Buttons */}
                <div className="pt-3 border-t border-industrial-200/60 dark:border-industrial-800/60 flex flex-wrap justify-between items-center gap-2">
                  <button
                    onClick={() => onViewZone(inc.node_ids[0])}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-industrial-100 hover:bg-industrial-200 dark:bg-industrial-800 dark:hover:bg-industrial-700 text-industrial-900 dark:text-white transition"
                  >
                    <Eye className="w-4 h-4 text-industrial-500" />
                    <span>View Zone in GIS</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {inc.status === 'ACTIVE' && (
                      <button
                        onClick={() => onAcknowledge(inc.incident_id)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
                      >
                        Acknowledge Incident
                      </button>
                    )}
                    {inc.status === 'ACKNOWLEDGED' && (
                      <span className="flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
                        <CheckCircle className="w-4 h-4" />
                        <span>Acknowledged at {inc.acknowledged_at ? new Date(inc.acknowledged_at).toLocaleTimeString() : ''}</span>
                      </span>
                    )}
                    {inc.status === 'RESOLVED' && (
                      <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

