import React from 'react';
import { ShieldCheck, AlertTriangle, Layers, Hash, HardDrive, CheckCircle2, XCircle } from 'lucide-react';
import type { ProfilingData } from '../services/api';

interface DataProfilingProps {
  profiling: ProfilingData | null;
}

export const DataProfiling: React.FC<DataProfilingProps> = ({ profiling }) => {
  if (!profiling) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No profiling data available. Please upload a dataset first.</p>
      </div>
    );
  }

  const { overview, quality, columns } = profiling;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-brand-400" /> Automated Data Profiling & Health Assessment
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic data quality score calculated from missing values, duplicate records, data type consistency, and IQR outliers.
          </p>
        </div>

        <div
          className="glass-panel px-6 py-3 rounded-2xl border flex items-center gap-4 shadow-lg"
          style={{ borderColor: quality.status_color }}
        >
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Data Quality Score</span>
            <span className="text-2xl font-extrabold text-white">{quality.score} <span className="text-xs text-slate-400">/ 100</span></span>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${quality.status_color}20`, color: quality.status_color }}
          >
            {quality.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 text-slate-400 text-xs mb-2">
            <Layers className="w-4 h-4 text-brand-400" /> Total Rows
          </div>
          <h3 className="text-2xl font-extrabold text-white">{overview.rows.toLocaleString()}</h3>
          <span className="text-[11px] text-slate-500">Record Count</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 text-slate-400 text-xs mb-2">
            <Hash className="w-4 h-4 text-purple-400" /> Columns Breakdown
          </div>
          <h3 className="text-2xl font-extrabold text-white">{overview.columns}</h3>
          <span className="text-[11px] text-slate-400">
            {overview.numerical_count} Num • {overview.categorical_count} Cat • {overview.datetime_count} Date
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 text-slate-400 text-xs mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Total Missing Cells
          </div>
          <h3 className="text-2xl font-extrabold text-amber-400">{quality.total_missing}</h3>
          <span className="text-[11px] text-slate-400">{quality.missing_percentage}% cell ratio</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 text-slate-400 text-xs mb-2">
            <HardDrive className="w-4 h-4 text-cyan-400" /> Memory Footprint
          </div>
          <h3 className="text-2xl font-extrabold text-white">{overview.memory_mb} MB</h3>
          <span className="text-[11px] text-slate-400">{overview.memory_bytes.toLocaleString()} Bytes</span>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Column Health & Metadata Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unique Values</th>
                <th className="py-3 px-4">Missing Count (%)</th>
                <th className="py-3 px-4">IQR Outliers</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-100">{col.column_name}</td>
                  <td className="py-3 px-4 text-slate-400">{col.data_type}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      col.type_category === 'numerical' ? 'bg-brand-500/20 text-brand-300' :
                      col.type_category === 'datetime' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {col.type_category}
                    </span>
                  </td>
                  <td className="py-3 px-4">{col.unique_values.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {col.missing_count > 0 ? (
                      <span className="text-amber-400 font-semibold">{col.missing_count} ({col.missing_percentage}%)</span>
                    ) : (
                      <span className="text-emerald-400">0 (0%)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{col.outliers_count > 0 ? <span className="text-amber-400">{col.outliers_count}</span> : <span className="text-slate-500">0</span>}</td>
                  <td className="py-3 px-4">
                    {col.missing_percentage > 15 ? (
                      <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3.5 h-3.5" /> High Missing</span>
                    ) : col.missing_percentage > 0 ? (
                      <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> Needs Review</span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Clean</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
