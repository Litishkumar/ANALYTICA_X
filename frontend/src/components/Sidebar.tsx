import React from 'react';
import { Home, LayoutDashboard, Upload, ShieldCheck, BarChart3, Lightbulb, Bot, Wand2, Sparkles, Database } from 'lucide-react';
import type { DatasetPreview } from '../services/api';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  datasetInfo: DatasetPreview | null;
  onToggleAiPanel: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, datasetInfo, onToggleAiPanel }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'upload', label: 'Data Workspace', icon: Upload },
    { id: 'profiling', label: 'Data Profiling', icon: ShieldCheck },
    { id: 'eda', label: 'EDA Dashboard', icon: BarChart3 },
    { id: 'insights', label: 'Insight Explorer', icon: Lightbulb },
    { id: 'conversational-analytics', label: 'AI Analyst', icon: Bot },
    { id: 'conversational-bi', label: 'Conversational BI', icon: Wand2 },
    { id: 'dashboard', label: 'BI Dashboard', icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
      <div>
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">Analytica<span className="text-brand-400">X</span></h1>
              <span className="text-[10px] text-slate-500 font-mono">v1.0 • Enterprise BI</span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={onToggleAiPanel}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600/20 to-purple-600/20 hover:from-brand-600/30 hover:to-purple-600/30 border border-brand-500/30 text-brand-300 px-3 py-2 rounded-xl text-xs font-medium transition-all"
        >
          <Bot className="w-4 h-4 text-brand-400" />
          <span>Quick AI Assistant</span>
        </button>

        <div className="p-3 bg-navy-900 rounded-2xl border border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <Database className="w-3.5 h-3.5 text-brand-400" /> Active Dataset
          </div>
          <p className="font-semibold text-slate-200 truncate">{datasetInfo?.filename || 'sales_data.csv'}</p>
          <p className="text-[10px] text-slate-400 font-mono">
            {datasetInfo?.rows ? datasetInfo.rows.toLocaleString() : '1,500'} rows • {datasetInfo?.columns || 12} cols
          </p>
        </div>
      </div>
    </aside>
  );
};
