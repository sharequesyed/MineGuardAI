import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActivePage } from './components/Sidebar';
import { HardwareSelectorModal } from './components/HardwareSelectorModal';
import { AlertsDrawerModal } from './components/AlertsDrawerModal';

import { hardwareDataProvider } from './services/HardwareDataProvider';
import { NodeTelemetry, DisplacementLink, SystemAlert, SystemMode } from './types/telemetry';

import { Dashboard } from './pages/Dashboard';
import { LiveMap } from './pages/LiveMap';
import { SensorNodes } from './pages/SensorNodes';
import { AIAnalysis } from './pages/AIAnalysis';
import { Network } from './pages/Network';
import { Alerts } from './pages/Alerts';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { System } from './pages/System';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mineguard_theme') === 'dark';
  });

  const [mode, setMode] = useState<SystemMode>(hardwareDataProvider.getMode());
  const [nodes, setNodes] = useState<NodeTelemetry[]>([]);
  const [links, setLinks] = useState<DisplacementLink[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isHardwareConnected, setIsHardwareConnected] = useState<boolean>(false);
  const [lastPacketTime, setLastPacketTime] = useState<string | null>(null);

  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mineguard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mineguard_theme', 'light');
    }
  }, [darkMode]);

  // Subscribe to hardware data provider
  useEffect(() => {
    const unsubscribe = hardwareDataProvider.subscribe(
      (currentMode, updatedNodes, updatedLinks, connected, lastPacket) => {
        setMode(currentMode);
        setNodes(updatedNodes);
        setLinks(updatedLinks);
        setIsHardwareConnected(connected);
        setLastPacketTime(lastPacket);
        setAlerts([...hardwareDataProvider.getAlerts()]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSelectMode = async (newMode: SystemMode) => {
    return await hardwareDataProvider.setMode(newMode);
  };

  const handleSelectScenario = (scenario: any, stage: number) => {
    hardwareDataProvider.setSimulationScenario(scenario, stage);
  };

  const handleAcknowledgeAlert = async (id: string) => {
    await hardwareDataProvider.acknowledgeAlert(id);
    setAlerts([...hardwareDataProvider.getAlerts()]);
  };

  const riskAssessment = hardwareDataProvider.getRiskAssessment();

  return (
    <div className="min-h-screen bg-industrial-50 dark:bg-industrial-950 text-industrial-900 dark:text-white flex flex-col font-body transition-colors">
      
      {/* Top Application Header */}
      <Header
        mode={mode}
        isHardwareConnected={isHardwareConnected}
        lastPacketTime={lastPacketTime}
        alerts={alerts}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar activePage={activePage} onSelectPage={(p) => setActivePage(p)} />

        {/* Page Content Container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activePage === 'dashboard' && (
            <Dashboard
              nodes={nodes}
              links={links}
              riskAssessment={riskAssessment}
              mode={mode}
              onNavigatePage={(p) => setActivePage(p)}
              onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
            />
          )}

          {activePage === 'map' && (
            <LiveMap
              nodes={nodes}
              links={links}
              riskAssessment={riskAssessment}
            />
          )}

          {activePage === 'nodes' && (
            <SensorNodes nodes={nodes} links={links} />
          )}

          {activePage === 'ai' && (
            <AIAnalysis riskAssessment={riskAssessment} nodes={nodes} />
          )}

          {activePage === 'network' && (
            <Network nodes={nodes} />
          )}

          {activePage === 'alerts' && (
            <Alerts alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
          )}

          {activePage === 'history' && (
            <History nodes={nodes} />
          )}

          {activePage === 'reports' && (
            <Reports nodes={nodes} links={links} riskAssessment={riskAssessment} alerts={alerts} />
          )}

          {activePage === 'system' && (
            <System
              mode={mode}
              isHardwareConnected={isHardwareConnected}
              lastPacketTime={lastPacketTime}
              nodes={nodes}
            />
          )}
        </main>
      </div>

      {/* Hardware / Data Provider Selector Modal */}
      <HardwareSelectorModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        currentMode={mode}
        onSelectMode={handleSelectMode}
        onSelectScenario={handleSelectScenario}
      />

      {/* Alert Audit Drawer Modal */}
      <AlertsDrawerModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onAcknowledge={handleAcknowledgeAlert}
      />

    </div>
  );
}
export default App;
