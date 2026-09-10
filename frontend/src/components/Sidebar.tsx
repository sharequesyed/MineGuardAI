import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Radio, 
  BrainCircuit, 
  Network as NetworkIcon, 
  BellRing, 
  History as HistoryIcon, 
  FileText, 
  Settings 
} from 'lucide-react';

export type ActivePage = 
  | 'dashboard'
  | 'map'
  | 'nodes'
  | 'ai'
  | 'network'
  | 'alerts'
  | 'history'
  | 'reports'
  | 'system';

interface SidebarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live GIS Map', icon: MapPin },
    { id: 'nodes', label: 'Sensor Nodes', icon: Radio },
    { id: 'ai', label: 'AI Risk Engine', icon: BrainCircuit },
    { id: 'network', label: 'Multi-Hop Relay', icon: NetworkIcon },
    { id: 'alerts', label: 'Alert Center', icon: BellRing },
    { id: 'history', label: 'Telemetry History', icon: HistoryIcon },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'system', label: 'System Diagnostics', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-industrial-900 border-r border-industrial-200 dark:border-industrial-800 flex flex-col justify-between shrink-0 transition-colors">
      <div className="py-4">
        <div className="px-4 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-industrial-400 dark:text-industrial-500 font-mono">
            Navigation Console
          </p>
        </div>
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id as ActivePage)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-heading font-medium transition ${
                  isActive
                    ? 'bg-industrial-800 text-white dark:bg-industrial-700 dark:text-white shadow-sm'
                    : 'text-industrial-600 dark:text-industrial-400 hover:bg-industrial-100 dark:hover:bg-industrial-800 hover:text-industrial-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-industrial-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Surface Monitoring Badge Footer */}
      <div className="p-4 border-t border-industrial-100 dark:border-industrial-800/60">
        <div className="bg-industrial-50 dark:bg-industrial-950/60 p-2.5 rounded-md border border-industrial-200 dark:border-industrial-800">
          <p className="text-[11px] font-semibold text-industrial-700 dark:text-industrial-300 font-heading">
            Surface Panel Deployment
          </p>
          <p className="text-[10px] text-industrial-500 dark:text-industrial-400 mt-0.5 font-body leading-relaxed">
            Nodes deployed on surface ground level above coal extraction panels.
          </p>
        </div>
      </div>
    </aside>
  );
};
