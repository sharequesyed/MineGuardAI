import React, { useState } from 'react';
import { Usb, Wifi, Cloud, Cpu, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SystemMode } from '../types/telemetry';
import { simulationEngine, SimulationScenario } from '../services/SimulationEngine';

interface HardwareSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: SystemMode;
  onSelectMode: (mode: SystemMode) => Promise<boolean>;
  onSelectScenario: (scenario: SimulationScenario, stage: number) => void;
}

export const HardwareSelectorModal: React.FC<HardwareSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  onSelectScenario
}) => {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>('PROGRESSIVE_SUBSIDENCE');
  const [subsidenceStage, setSubsidenceStage] = useState<number>(1);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleModeChange = async (mode: SystemMode) => {
    setErrorMsg(null);
    setIsConnecting(true);
    const success = await onSelectMode(mode);
    setIsConnecting(false);
    if (success) {
      if (mode === 'SIMULATION') {
        onSelectScenario(selectedScenario, subsidenceStage);
      }
      onClose();
    } else {
      setErrorMsg(`Failed to establish ${mode} connection.`);
    }
  };

  const handleScenarioChange = (scenario: SimulationScenario, stage: number) => {
    setSelectedScenario(scenario);
    setSubsidenceStage(stage);
    onSelectScenario(scenario, stage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg shadow-xl w-full max-w-xl overflow-hidden font-body">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-industrial-200 dark:border-industrial-800 bg-industrial-50 dark:bg-industrial-950">
          <div className="flex items-center space-x-2">
            <Usb className="w-5 h-5 text-industrial-700 dark:text-industrial-300" />
            <h2 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
              Hardware & Data Provider Selector
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-industrial-400 hover:text-industrial-600 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-md flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode 1: USB Web Serial */}
          <div className="border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 bg-industrial-50/50 dark:bg-industrial-900/50 hover:border-industrial-400 transition">
            <div className="flex items-start justify-between">
              <div className="flex space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                  <Usb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
                    USB Serial Mode (Primary Presentation Path)
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      RECOMMENDED FOR DEMO
                    </span>
                  </h3>
                  <p className="text-xs text-industrial-500 dark:text-industrial-400 mt-1 leading-relaxed">
                    Direct browser hardware connection over USB cable via Web Serial API. Reads newline-delimited JSON telemetry from ESP32 Gateway. Requires zero local server or Python setup.
                  </p>
                </div>
              </div>
              <button
                disabled={isConnecting}
                onClick={() => handleModeChange('USB_SERIAL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition ${
                  currentMode === 'USB_SERIAL'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-industrial-800 text-white hover:bg-industrial-900 dark:bg-industrial-700'
                }`}
              >
                {currentMode === 'USB_SERIAL' ? 'Active' : 'Connect USB'}
              </button>
            </div>
          </div>

          {/* Mode 2: Local Wi-Fi AP Mode */}
          <div className="border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 bg-industrial-50/50 dark:bg-industrial-900/50">
            <div className="flex items-start justify-between">
              <div className="flex space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-industrial-900 dark:text-white">
                    Local Wi-Fi Gateway Mode (AP Address: 192.168.4.1)
                  </h3>
                  <p className="text-xs text-industrial-500 dark:text-industrial-400 mt-1 leading-relaxed">
                    ESP32 Gateway Access Point for offline local Wi-Fi telemetry. Note: Hosted HTTPS pages (e.g. Vercel) block insecure HTTP calls. Use gateway local landing page or local http.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleModeChange('LOCAL_GATEWAY')}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-industrial-200 text-industrial-700 dark:bg-industrial-800 dark:text-industrial-300 hover:bg-industrial-300"
              >
                {currentMode === 'LOCAL_GATEWAY' ? 'Active' : 'Select'}
              </button>
            </div>
          </div>

          {/* Mode 3: Cloud Mode */}
          <div className="border border-industrial-200 dark:border-industrial-800 rounded-lg p-4 bg-industrial-50/50 dark:bg-industrial-900/50">
            <div className="flex items-start justify-between">
              <div className="flex space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-industrial-900 dark:text-white">
                    Cloud Backend Mode (FastAPI + MQTT)
                  </h3>
                  <p className="text-xs text-industrial-500 dark:text-industrial-400 mt-1 leading-relaxed">
                    Connects to deployed remote FastAPI REST/WebSocket endpoints and Mosquitto MQTT broker.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleModeChange('CLOUD')}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-industrial-200 text-industrial-700 dark:bg-industrial-800 dark:text-industrial-300 hover:bg-industrial-300"
              >
                {currentMode === 'CLOUD' ? 'Active' : 'Select'}
              </button>
            </div>
          </div>

          {/* Mode 4: Dedicated Simulation Engine */}
          <div className="border border-amber-300 dark:border-amber-800 rounded-lg p-4 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex space-x-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-md">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-heading text-industrial-900 dark:text-white">
                    Simulation Engine (Manually Triggered)
                  </h3>
                  <p className="text-xs text-industrial-500 dark:text-industrial-400 mt-1 leading-relaxed">
                    Synthetic telemetry generator for demonstration of deformation stages, node failures, and offline queues.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleModeChange('SIMULATION')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition ${
                  currentMode === 'SIMULATION'
                    ? 'bg-amber-600 text-white'
                    : 'bg-industrial-800 text-white hover:bg-industrial-900'
                }`}
              >
                {currentMode === 'SIMULATION' ? 'Active' : 'Activate Simulation'}
              </button>
            </div>

            {/* Simulation Scenario Controls */}
            {currentMode === 'SIMULATION' && (
              <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/60 space-y-3">
                <p className="text-xs font-semibold text-industrial-700 dark:text-industrial-300 font-heading">
                  Select Active Simulation Scenario:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleScenarioChange('NORMAL', 1)}
                    className={`px-3 py-2 text-xs rounded-md border text-left font-medium transition ${
                      selectedScenario === 'NORMAL'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-industrial-200 bg-white text-industrial-700 dark:bg-industrial-800 dark:border-industrial-700 dark:text-industrial-300'
                    }`}
                  >
                    1. Normal Baseline
                  </button>
                  <button
                    onClick={() => handleScenarioChange('PROGRESSIVE_SUBSIDENCE', subsidenceStage)}
                    className={`px-3 py-2 text-xs rounded-md border text-left font-medium transition ${
                      selectedScenario === 'PROGRESSIVE_SUBSIDENCE'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'border-industrial-200 bg-white text-industrial-700 dark:bg-industrial-800 dark:border-industrial-700 dark:text-industrial-300'
                    }`}
                  >
                    2. Progressive Subsidence
                  </button>
                  <button
                    onClick={() => handleScenarioChange('NODE_FAILURE', 1)}
                    className={`px-3 py-2 text-xs rounded-md border text-left font-medium transition ${
                      selectedScenario === 'NODE_FAILURE'
                        ? 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'border-industrial-200 bg-white text-industrial-700 dark:bg-industrial-800 dark:border-industrial-700 dark:text-industrial-300'
                    }`}
                  >
                    3. Node Failure (N2)
                  </button>
                  <button
                    onClick={() => handleScenarioChange('NETWORK_INTERRUPTION', 1)}
                    className={`px-3 py-2 text-xs rounded-md border text-left font-medium transition ${
                      selectedScenario === 'NETWORK_INTERRUPTION'
                        ? 'border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'border-industrial-200 bg-white text-industrial-700 dark:bg-industrial-800 dark:border-industrial-700 dark:text-industrial-300'
                    }`}
                  >
                    4. Network Interruption
                  </button>
                </div>

                {/* Progressive Subsidence Stage Slider (Priority 13) */}
                {selectedScenario === 'PROGRESSIVE_SUBSIDENCE' && (
                  <div className="bg-white dark:bg-industrial-800 p-3.5 rounded-md border border-amber-200 dark:border-amber-900/60 mt-2 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-industrial-900 dark:text-white font-heading">
                        Presentation Stage: <span className="text-amber-600 font-mono">Stage {subsidenceStage} of 5</span>
                      </span>
                    </div>
                    
                    <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/40 rounded border border-amber-200/80 dark:border-amber-900/40 text-xs font-mono text-amber-900 dark:text-amber-300">
                      {subsidenceStage === 1 && 'Stage 1: NORMAL BASELINE — All monitored surface nodes safe. No active incidents.'}
                      {subsidenceStage === 2 && 'Stage 2: EARLY DEFORMATION — Small tilt change near Node N3. Generates 1 Warning Incident.'}
                      {subsidenceStage === 3 && 'Stage 3: PROGRESSING DEFORMATION — Correlated displacement N3 & N4. GIS risk region expands.'}
                      {subsidenceStage === 4 && 'Stage 4: HIGH RISK — Deformation severity increases. Warning escalates to Critical (1 escalation notification).'}
                      {subsidenceStage === 5 && 'Stage 5: CRITICAL / CRACK EVENT — Surface crack initiation. Local alarm active. Incident remains coherent single entry.'}
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={subsidenceStage}
                      onChange={(e) => handleScenarioChange('PROGRESSIVE_SUBSIDENCE', parseInt(e.target.value))}
                      className="w-full h-2 bg-industrial-200 dark:bg-industrial-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-industrial-200 dark:border-industrial-800 bg-industrial-50 dark:bg-industrial-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-industrial-800 text-white dark:bg-industrial-700 hover:bg-industrial-900 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
