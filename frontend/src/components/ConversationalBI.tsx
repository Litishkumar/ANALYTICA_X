import React, { useState } from 'react';
import { Sparkles, Code, ShieldCheck, RefreshCw, Wand2 } from 'lucide-react';
import { api } from '../services/api';
import type { ChartResult } from '../services/api';
import { InteractiveChart } from './InteractiveChart';

export const ConversationalBI: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<any | null>(null);
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);

  const predefinedRequests = [
    "Show sales by region",
    "Create a monthly sales trend",
    "Compare profit across products",
    "Show the top 5 products by revenue",
    "Plot sales against profit"
  ];

  const handleGenerate = async (queryText?: string) => {
    const activeQuery = queryText || query;
    if (!activeQuery.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.sendConversationalBI(activeQuery);
      setSpec(res.specification);
      setChartResult(res.chart);
    } catch (e) {
      alert("Failed to generate BI chart. Please ensure dataset is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fadeIn">
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wand2 className="w-7 h-7 text-purple-400" /> Conversational BI & Interactive Visualization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Request custom charts using plain natural language. Gemini plans the JSON specification; BI Orchestrator validates and executes Pandas transformations safely.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'Show top 5 products by revenue in 2026' or 'Plot sales against profit'..."
            className="flex-1 bg-navy-950 border border-slate-700 rounded-2xl px-5 py-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold px-8 py-3.5 rounded-2xl text-xs shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Chart</span>
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pt-2">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
          {predefinedRequests.map((req, i) => (
            <button
              key={i}
              onClick={() => handleGenerate(req)}
              className="text-[11px] bg-navy-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all"
            >
              {req}
            </button>
          ))}
        </div>
      </div>

      {chartResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 min-h-[420px]">
            <InteractiveChart chartData={chartResult} />
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-2 uppercase tracking-wider">
                  <Code className="w-4 h-4" /> Gemini Spec JSON
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Validated
                </span>
              </div>

              {spec && (
                <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-2">
                  <p><span className="text-purple-400">"type"</span>: <span className="text-brand-300">"{spec.type}"</span></p>
                  <p><span className="text-purple-400">"title"</span>: <span className="text-emerald-300">"{spec.title}"</span></p>
                  <p><span className="text-purple-400">"x_axis"</span>: <span className="text-amber-300">"{spec.x_axis}"</span></p>
                  <p><span className="text-purple-400">"y_axis"</span>: <span className="text-amber-300">"{spec.y_axis}"</span></p>
                  <p><span className="text-purple-400">"aggregation"</span>: <span className="text-brand-300">"{spec.aggregation}"</span></p>
                  <p><span className="text-purple-400">"limit"</span>: <span className="text-cyan-300">{spec.limit || 'null'}</span></p>
                </div>
              )}
            </div>

            <div className="p-4 bg-navy-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-200 block">Deterministic Safety Architecture:</span>
              <p>Gemini produces structured JSON instructions. The BI Orchestrator validates chart type, verifies column types, applies Pandas transformations, and renders Plotly visuals.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
