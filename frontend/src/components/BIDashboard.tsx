import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { InteractiveChart } from './InteractiveChart';

export const BIDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getAutoDashboard();
      setDashboardData(res);
    } catch (e) {
      console.error("Failed to load automatic BI dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-400" />
        <p className="text-sm font-semibold text-white">Generating Multi-Chart Business Intelligence Dashboard...</p>
        <p className="text-xs text-slate-500">Gemini & BI Orchestrator inspecting schema, measures, dimensions, and KPIs.</p>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || [];
  const charts = dashboardData?.charts || [];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-brand-400" /> Interactive Business Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automatically recommended dashboard layout built from dataset measures, dimension breakdowns, and trend series.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Grid
          </button>

          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-glow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Regenerate AI Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi: any, idx: number) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{kpi.title}</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-white">{kpi.formatted || kpi.value}</h3>
              <span className="text-xs text-emerald-400 font-medium flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Measure: {kpi.metric_type}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {charts.map((chart: any, idx: number) => (
          <div key={idx} className="h-96">
            <InteractiveChart chartData={chart} />
          </div>
        ))}
      </div>
    </div>
  );
};
