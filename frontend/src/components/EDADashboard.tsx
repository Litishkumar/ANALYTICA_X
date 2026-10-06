import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Layers, Activity, Sliders } from 'lucide-react';
import { api } from '../services/api';

interface EDADashboardProps {
  edaData: any;
}

export const EDADashboard: React.FC<EDADashboardProps> = ({ edaData: initialEda }) => {
  const [eda, setEda] = useState<any>(initialEda);
  const [loading, setLoading] = useState(!initialEda);
  const [activeTab, setActiveTab] = useState<'numerical' | 'categorical' | 'correlation' | 'outliers' | 'trends'>('numerical');

  useEffect(() => {
    if (!initialEda) {
      fetchEDA();
    }
  }, [initialEda]);

  const fetchEDA = async () => {
    setLoading(true);
    try {
      const res = await api.getEDA();
      setEda(res.eda);
    } catch (e) {
      console.error("Failed to fetch EDA data", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !eda) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="animate-pulse">Running Exploratory Data Analysis engine...</p>
      </div>
    );
  }

  const { numerical_analysis, categorical_analysis, correlation_matrix, outliers_analysis, trend_analysis } = eda;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fadeIn">
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-brand-400" /> Exploratory Data Analysis (EDA Engine)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated statistical summaries, distribution metrics, pairwise correlations, missing value severity, and IQR outlier detection.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'numerical', label: 'Numerical Analysis', icon: Activity },
          { id: 'categorical', label: 'Categorical Analysis', icon: Layers },
          { id: 'correlation', label: 'Correlation Matrix', icon: TrendingUp },
          { id: 'outliers', label: 'IQR Outliers', icon: AlertCircle },
          { id: 'trends', label: 'Time Trends', icon: Sliders },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-navy-800/60 text-slate-400 hover:text-white hover:bg-navy-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'numerical' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Numerical Descriptive Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">Mean</th>
                  <th className="py-3 px-4">Median</th>
                  <th className="py-3 px-4">Std Dev</th>
                  <th className="py-3 px-4">Min</th>
                  <th className="py-3 px-4">Max</th>
                  <th className="py-3 px-4">Q25 (25%)</th>
                  <th className="py-3 px-4">Q75 (75%)</th>
                  <th className="py-3 px-4">Skewness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {Object.entries(numerical_analysis || {}).map(([col, stats]: [string, any]) => (
                  <tr key={col} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-brand-300">{col}</td>
                    <td className="py-3 px-4 text-white font-bold">{stats.mean?.toLocaleString()}</td>
                    <td className="py-3 px-4">{stats.median?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400">{stats.std?.toLocaleString()}</td>
                    <td className="py-3 px-4">{stats.min?.toLocaleString()}</td>
                    <td className="py-3 px-4">{stats.max?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400">{stats.q25?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400">{stats.q75?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        Math.abs(stats.skewness) > 1.0 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                      }`}>
                        {stats.skewness} ({stats.distribution_shape})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categorical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categorical_analysis || {}).map(([col, info]: [string, any]) => (
            <div key={col} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-semibold text-slate-100">{col}</h4>
                <span className="text-xs text-purple-300 font-mono">{info.num_categories} Categories</span>
              </div>
              <div className="text-xs text-slate-400">
                Dominant Category: <strong className="text-brand-300">{info.dominant_category}</strong> ({info.dominant_percentage}%)
              </div>

              <div className="space-y-2 pt-2">
                {info.top_categories?.map((cat: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">{cat.category}</span>
                      <span className="text-slate-400">{cat.count.toLocaleString()} ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'correlation' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Pairwise Correlation Matrix (Numerical Columns Only)</h3>
            <span className="text-xs text-slate-400 font-mono">Threshold: |r| ≥ 0.50</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {correlation_matrix?.strong_relationships?.map((rel: any, idx: number) => (
              <div key={idx} className="p-4 bg-navy-950/80 rounded-2xl border border-brand-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{rel.col1} ↔ {rel.col2}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{rel.strength.replace('_', ' ')} {rel.direction} correlation</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${rel.correlation > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {rel.correlation > 0 ? `+${rel.correlation}` : rel.correlation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'outliers' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">IQR Statistical Outlier Detection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(outliers_analysis || {}).map(([col, info]: [string, any]) => (
              <div key={col} className="p-4 bg-navy-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">{col}</span>
                  <span className="text-amber-400">{info.outliers_count} Outliers ({info.percentage}%)</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Bounds: [{info.lower_bound} to {info.upper_bound}] • Min: {info.min_outlier} • Max: {info.max_outlier}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Time Series Change Trends</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(trend_analysis || {}).map(([col, info]: [string, any]) => (
              <div key={col} className="p-4 bg-navy-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">{col}</span>
                  <span className={info.percentage_change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {info.percentage_change >= 0 ? `+${info.percentage_change}%` : `${info.percentage_change}%`}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Direction: <strong className="capitalize text-white">{info.direction}</strong> • Date Dim: {info.date_column}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
