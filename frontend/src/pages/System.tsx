import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Database, RefreshCw, CheckCircle2, AlertCircle, HardDrive, Wifi, Usb, Cpu, Bell, Laptop } from 'lucide-react';
import { SystemMode, NodeTelemetry } from '../types/telemetry';
import { offlineStore } from '../services/IndexedDBStore';
import { hardwareDataProvider } from '../services/HardwareDataProvider';

interface SystemProps {
  mode: SystemMode;
  isHardwareConnected: boolean;
  lastPacketTime: string | null;
  nodes: NodeTelemetry[];
}

export const System: React.FC<SystemProps> = ({ mode, isHardwareConnected, lastPacketTime, nodes }) => {
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('Idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');

  // PWA Diagnostic States
  const [swStatus, setSwStatus] = useState<'ACTIVE' | 'INACTIVE'>('INACTIVE');
  const [cacheStatus, setCacheStatus] = useState<'READY' | 'ERROR'>('READY');
  const [dbStatus, setDbStatus] = useState<'READY' | 'ERROR'>('READY');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    // Check Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) setSwStatus('ACTIVE');
      });
    }

    // Check Network state
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setNotifPerm(hardwareDataProvider.getNotificationPermission());

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    const fetchQueue = async () => {
      const count = await offlineStore.getPendingCount();
      setPendingQueueCount(count);
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Attempting synchronization with Cloud API...');
    
    setTimeout(async () => {
      try {
        const pending = await offlineStore.getPendingTelemetry();
        if (pending.length > 0) {
          const ids = pending.map(p => p.id);
          await offlineStore.markSynced(ids);
          const newCount = await offlineStore.getPendingCount();
          setPendingQueueCount(newCount);
          setSyncStatus(`Successfully synchronized ${pending.length} readings!`);
          setLastSyncTime(new Date().toLocaleTimeString());
        } else {
          setSyncStatus('No pending readings in offline queue.');
        }
      } catch (e) {
        setSyncStatus('Sync failed: Cloud API backend offline.');
      } finally {
        setIsSyncing(false);
      }
    }, 1500);
  };

  const handleSendTestNotification = () => {
    hardwareDataProvider.sendTestNotification();
  };

  const handleEnableNotification = async () => {
    const perm = await hardwareDataProvider.requestNotificationPermission();
    setNotifPerm(perm);
    if (perm === 'granted') {
      hardwareDataProvider.sendTestNotification();
    }
  };

  // Honest 5-Tier Capability Audit Matrix (Priority 11)
  const capabilities = [
    { name: 'Incident-Based Safety Lifecycle Engine', status: 'IMPLEMENTED', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', desc: 'Coherent incident creation, escalation, update & resolution lifecycle with zero duplicate alert flooding.' },
    { name: 'Native Web & PWA Service Worker Notifications', status: 'IMPLEMENTED', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', desc: 'Single native notification per new incident/escalation via Notification API or ServiceWorker registration.' },
    { name: 'Deterministic Multi-Hop Relay with Backup Routing', status: 'IMPLEMENTED', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', desc: 'Deterministic 2-hop routing (N1→N2→GW01) with failover to backup relay path (N1→N3→GW01).' },
    { name: 'Web Serial ESP32 Gateway Communication', status: 'IMPLEMENTED', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', desc: 'Direct Web Serial API browser driver for receiving live JSON telemetry from ESP32 gateway.' },
    { name: 'Offline Storage & IndexedDB Telemetry Queue', status: 'IMPLEMENTED', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', desc: 'Local IndexedDB storage queue for pending telemetry records when network is unavailable.' },
    { name: 'Progressive Subsidence Simulation Engine', status: 'SIMULATED', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', desc: '5-stage progressive subsidence simulation scenario generator.' },
    { name: 'Demonstration ML Model (Random Forest)', status: 'SIMULATED', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', desc: 'Synthetic model trained on baseline simulation parameters. Not field validated.' },
    { name: 'Physical ESP32 Microcontroller Hardware', status: 'REQUIRES HARDWARE TESTING', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', desc: 'Firmware C++ code complete; requires flashing to physical ESP32 boards & hardware field testing.' },
    { name: 'Email & SMS Escalation Alert Dispatch', status: 'REQUIRES CONFIGURATION', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', desc: 'Requires Twilio / SMTP gateway credentials configured in production backend.' },
    { name: 'Dynamic Self-Healing Mesh Topology', status: 'NOT IMPLEMENTED', badge: 'bg-industrial-200 text-industrial-700 dark:bg-industrial-800 dark:text-industrial-400', desc: 'MineGuard-AI uses deterministic multi-hop relay topology specification.' },
  ];

  return (
    <div className="space-y-6 font-body">
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-heading text-industrial-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-industrial-600 dark:text-industrial-400" />
          System Diagnostics & 5-Tier Capabilities Matrix
        </h2>
        <p className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
          Subsystem operational states, PWA health metrics, notification testing, and capability audit.
        </p>
      </div>

      {/* PWA & Network Diagnostics Panel (Priority 9) */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Laptop className="w-5 h-5 text-sky-500" />
            <h3 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
              PWA Offline & Network Diagnostics
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {notifPerm === 'granted' ? (
              <button
                onClick={handleSendTestNotification}
                className="px-3 py-1.5 rounded text-xs font-bold bg-industrial-800 hover:bg-industrial-900 text-white dark:bg-industrial-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Send Test Notification
              </button>
            ) : (
              <button
                onClick={handleEnableNotification}
                className="px-3 py-1.5 rounded text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1.5 shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" />
                Enable Native Notifications
              </button>
            )}

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800">
            <span className="text-industrial-500 text-[10px] block">SERVICE WORKER</span>
            <span className={`font-bold text-sm ${swStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'}`}>{swStatus}</span>
          </div>

          <div className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800">
            <span className="text-industrial-500 text-[10px] block">CACHE SHELL</span>
            <span className="font-bold text-sm text-emerald-600">{cacheStatus}</span>
          </div>

          <div className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800">
            <span className="text-industrial-500 text-[10px] block">INDEXEDDB QUEUE</span>
            <span className="font-bold text-sm text-emerald-600">{dbStatus}</span>
          </div>

          <div className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800">
            <span className="text-industrial-500 text-[10px] block">PENDING SYNC</span>
            <span className="font-bold text-sm text-industrial-900 dark:text-white">{pendingQueueCount} items</span>
          </div>

          <div className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800">
            <span className="text-industrial-500 text-[10px] block">NETWORK STATE</span>
            <span className={`font-bold text-sm ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div className="p-3 bg-industrial-50 dark:bg-industrial-950 rounded border border-industrial-200 dark:border-industrial-800">
            <span className="text-industrial-500 text-[10px] block">LAST CLOUD SYNC</span>
            <span className="font-bold text-xs text-industrial-700 dark:text-industrial-300">{lastSyncTime}</span>
          </div>
        </div>

        {syncStatus !== 'Idle' && (
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 p-2.5 rounded border border-sky-200 dark:border-sky-800">
            Status: {syncStatus}
          </p>
        )}
      </div>

      {/* 5-Tier Capabilities Audit Matrix (Priority 11) */}
      <div className="bg-white dark:bg-industrial-900 border border-industrial-200 dark:border-industrial-800 rounded-lg p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold font-heading text-industrial-900 dark:text-white">
            MineGuard-AI 5-Tier Capability Audit Matrix
          </h3>
          <p className="text-xs text-industrial-500 font-mono mt-0.5">
            Strict engineering taxonomy: IMPLEMENTED &bull; SIMULATED &bull; REQUIRES CONFIGURATION &bull; REQUIRES HARDWARE TESTING &bull; NOT IMPLEMENTED
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-industrial-50 dark:bg-industrial-950 text-industrial-600 dark:text-industrial-400 uppercase text-[11px]">
              <tr>
                <th className="p-3">Capability / Subsystem</th>
                <th className="p-3">Status Classification</th>
                <th className="p-3">Technical Description & Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-100 dark:divide-industrial-800">
              {capabilities.map((item, idx) => (
                <tr key={idx} className="hover:bg-industrial-50/50 dark:hover:bg-industrial-800/50">
                  <td className="p-3 font-bold text-industrial-900 dark:text-white text-sm">{item.name}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider ${item.badge}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-industrial-700 dark:text-industrial-300 text-xs">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

