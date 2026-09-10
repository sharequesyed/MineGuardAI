import React from 'react';
import { 
  ShieldAlert, 
  Usb, 
  Wifi, 
  Cloud, 
  Cpu, 
  Sun, 
  Moon, 
  Bell, 
  Database,
  Radio,
  Menu,
  X
} from 'lucide-react';
import { SystemMode, SystemAlert } from '../types/telemetry';

interface HeaderProps {
  mode: SystemMode;
  isHardwareConnected: boolean;
  lastPacketTime: string | null;
  alerts: SystemAlert[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHardwareModal: () => void;
  onOpenAlertsModal: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  isHardwareConnected,
  lastPacketTime,
  alerts,
  darkMode,
  onToggleDarkMode,
  onOpenHardwareModal,
  onOpenAlertsModal,
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {

  const unackAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <header className="bg-white dark:bg-industrial-900 border-b border-industrial-200 dark:border-industrial-800 px-4 py-3 sticky top-0 z-30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Title & Mine Operational Context */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-industrial-800 dark:bg-industrial-700 text-white p-2 rounded-md shadow-sm">
              <ShieldAlert className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg md:text-xl font-bold font-heading text-industrial-900 dark:text-white tracking-tight">
                  MineGuard-AI
                </h1>
                <span className="text-[10px] md:text-xs font-mono px-1.5 py-0.5 rounded bg-industrial-100 dark:bg-industrial-800 text-industrial-600 dark:text-industrial-400 border border-industrial-200 dark:border-industrial-700">
                  SIH26025
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-industrial-500 dark:text-industrial-400 font-body">
                Surface Subsidence Early-Warning System | <span className="font-semibold text-industrial-700 dark:text-industrial-300">Jharia Coalfield &bull; Mine 04 &bull; Panel A-01</span>
              </p>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-md text-industrial-700 dark:text-industrial-300 hover:bg-industrial-100 dark:hover:bg-industrial-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Status Indicators & Control Actions */}
        <div className="flex flex-wrap items-center gap-2">

          
          {/* Mode & Connection Status Indicator */}
          {mode === 'SIMULATION' ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold font-mono bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
              <Cpu className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
              SIMULATION MODE
            </span>
          ) : mode === 'USB_SERIAL' ? (
            isHardwareConnected ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <Usb className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                LIVE USB GATEWAY
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold font-mono bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse">
                <Radio className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                HARDWARE DISCONNECTED
              </span>
            )
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold font-mono bg-industrial-100 text-industrial-800 border border-industrial-300 dark:bg-industrial-800 dark:text-industrial-300">
              REQUIRES CONFIGURATION
            </span>
          )}

          {/* Connect Hardware Trigger */}
          <button
            onClick={onOpenHardwareModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium font-heading rounded-md bg-industrial-800 hover:bg-industrial-900 text-white dark:bg-industrial-700 dark:hover:bg-industrial-600 transition shadow-sm"
          >
            <Usb className="w-3.5 h-3.5" />
            <span>Connect Hardware</span>
          </button>

          {/* Alert Notifications Button */}
          <button
            onClick={onOpenAlertsModal}
            className="relative p-2 text-industrial-600 dark:text-industrial-300 hover:bg-industrial-100 dark:hover:bg-industrial-800 rounded-md transition"
            title="Alert Center"
          >
            <Bell className="w-4 h-4" />
            {unackAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-critical text-[10px] font-bold text-white">
                {unackAlerts.length}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-industrial-600 dark:text-industrial-300 hover:bg-industrial-100 dark:hover:bg-industrial-800 rounded-md transition"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>

      </div>
    </header>
  );
};
