import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, Eye, CheckCircle, X, Volume2 } from 'lucide-react';
import { Incident } from '../types/telemetry';

interface OnScreenAlertBannerProps {
  incidents: Incident[];
  onAcknowledge: (id: string) => void;
  onViewZone: (nodeId?: string) => void;
}

export const OnScreenAlertBanner: React.FC<OnScreenAlertBannerProps> = ({
  incidents,
  onAcknowledge,
  onViewZone,
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const lastIncidentIdRef = useRef<string | null>(null);

  // Find the highest priority active, unacknowledged incident that hasn't been dismissed manually
  const activeUnackIncidents = incidents.filter(
    (inc) => inc.status === 'ACTIVE' && !inc.acknowledged && !dismissedIds.has(inc.incident_id)
  );

  const activeIncident = activeUnackIncidents.length > 0 ? activeUnackIncidents[0] : null;

  // Synthesize Web Audio API alert sound on new high-risk incident arrival
  useEffect(() => {
    if (activeIncident && activeIncident.incident_id !== lastIncidentIdRef.current) {
      lastIncidentIdRef.current = activeIncident.incident_id;
      playAlertChime(activeIncident.severity);
    }
  }, [activeIncident]);

  const playAlertChime = (severity: 'CRITICAL' | 'WARNING') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = severity === 'CRITICAL' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(severity === 'CRITICAL' ? 880 : 660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(severity === 'CRITICAL' ? 440 : 440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio play silently caught if browser context suspended
    }
  };

  if (!activeIncident) return null;

  const isCritical = activeIncident.severity === 'CRITICAL';

  const handleDismiss = () => {
    setDismissedIds((prev) => new Set(prev).add(activeIncident.incident_id));
  };

  return (
    <div className="fixed top-16 md:top-20 right-3 md:right-6 z-[8000] max-w-md w-[calc(100%-1.5rem)] animate-in fade-in slide-in-from-top-4 duration-300 font-body">
      <div
        className={`rounded-lg border-2 shadow-2xl p-4 transition-all ${
          isCritical
            ? 'bg-red-950/95 border-red-500 text-white shadow-red-900/50 ring-4 ring-red-500/20'
            : 'bg-amber-950/95 border-amber-500 text-white shadow-amber-900/50 ring-4 ring-amber-500/20'
        } backdrop-blur-md`}
      >
        {/* Banner Top Bar */}
        <div className="flex items-start justify-between gap-2 border-b border-white/20 pb-2.5">
          <div className="flex items-center space-x-2">
            {isCritical ? (
              <ShieldAlert className="w-6 h-6 text-red-400 animate-bounce shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  HIGH RISK {activeIncident.severity}
                </span>
                <span className="text-[10px] font-mono text-industrial-300">
                  {new Date(activeIncident.created_at).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="font-heading font-bold text-sm text-white mt-0.5">
                {activeIncident.source_mode === 'SIMULATION' ? 'SIMULATION ' : ''}
                {isCritical ? 'CRITICAL DEFORMATION ALERT' : 'WARNING DEFORMATION DETECTED'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded text-industrial-400 hover:text-white hover:bg-white/10 transition"
            title="Dismiss Alert Toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner Details */}
        <div className="py-3 space-y-2 text-xs">
          <p className="font-semibold text-white">
            {activeIncident.zone_link} &bull; Nodes: <span className="font-mono font-bold">{activeIncident.node_ids.join(', ')}</span>
          </p>

          <div className="p-2.5 bg-black/40 rounded border border-white/10 font-mono text-[11px] grid grid-cols-2 gap-2 text-industrial-200">
            <div>
              <span className="text-industrial-400 block text-[9px] uppercase">Tilt Magnitude</span>
              <span className="font-bold text-white text-xs">{activeIncident.latest_snapshot.tilt_mag}°</span>
            </div>
            <div>
              <span className="text-industrial-400 block text-[9px] uppercase">Displacement Delta</span>
              <span className="font-bold text-white text-xs">{activeIncident.latest_snapshot.disp_mm} mm</span>
            </div>
            <div>
              <span className="text-industrial-400 block text-[9px] uppercase">Vibration RMS</span>
              <span className="font-bold text-white text-xs">{activeIncident.latest_snapshot.vib_rms} g</span>
            </div>
            <div>
              <span className="text-industrial-400 block text-[9px] uppercase">Surface Crack</span>
              <span className={`font-bold text-xs ${activeIncident.latest_snapshot.crack ? 'text-red-400' : 'text-emerald-400'}`}>
                {activeIncident.latest_snapshot.crack ? 'CRACK DETECTED' : 'INTACT'}
              </span>
            </div>
          </div>
        </div>

        {/* Banner Actions */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={() => onViewZone(activeIncident.node_ids[0])}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded font-semibold bg-white/15 hover:bg-white/25 text-white transition border border-white/20"
          >
            <Eye className="w-4 h-4 text-amber-300" />
            <span>Inspect in GIS</span>
          </button>

          <button
            onClick={() => onAcknowledge(activeIncident.incident_id)}
            className={`px-3.5 py-1.5 rounded font-bold transition shadow-sm ${
              isCritical
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            Acknowledge Incident
          </button>
        </div>
      </div>
    </div>
  );
};
