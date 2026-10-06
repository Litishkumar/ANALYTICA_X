import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Bot } from 'lucide-react';
import { api } from '../services/api';

interface InteractiveChartProps {
  chartData: {
    title: string;
    chart_type?: string;
    x_axis?: string;
    y_axis?: string;
    plotly_json: any;
    data_summary?: any;
  };
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ chartData }) => {
  const [qaOpen, setQaOpen] = useState(false);
  const [qaQuery, setQaQuery] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);

  if (!chartData || !chartData.plotly_json) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-700 rounded-xl bg-slate-900/50 p-6 text-center">
        <p className="text-slate-400 text-sm">No visualization data available</p>
      </div>
    );
  }

  const { data, layout } = chartData.plotly_json;

  const responsiveLayout = {
    ...layout,
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.4)',
    font: { family: 'Inter, sans-serif', color: '#9CA3AF' },
    margin: layout?.margin || { l: 40, r: 40, t: 50, b: 40 },
  };

  const handleAskAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuery.trim()) return;
    setQaLoading(true);
    try {
      const res = await api.sendChartQA(qaQuery, chartData);
      setQaAnswer(res.answer);
    } catch (err) {
      setQaAnswer("Unable to process chart question. Please check backend connection.");
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="relative glass-card rounded-2xl p-4 flex flex-col h-full border border-slate-800/80 shadow-xl overflow-hidden group">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            {chartData.title || "Interactive Visualization"}
          </h3>
          {chartData.x_axis && chartData.y_axis && (
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {chartData.y_axis} vs {chartData.x_axis} ({chartData.chart_type || 'chart'})
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQaOpen(!qaOpen)}
            className="flex items-center gap-1.5 text-xs bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 border border-brand-500/30 px-3 py-1.5 rounded-lg transition-all"
            title="Ask AI about this visualization"
          >
            <Bot className="w-3.5 h-3.5 text-brand-400" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      <div className="w-full h-80 min-h-[300px] relative">
        <Plot
          data={data || []}
          layout={responsiveLayout}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d']
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {qaOpen && (
        <div className="mt-3 p-3 bg-navy-950/90 border border-brand-500/40 rounded-xl animate-fadeIn text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-brand-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> Contextual AI Chart Assistant
            </span>
            <button onClick={() => setQaOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleAskAISubmit} className="flex gap-2 mb-2">
            <input
              type="text"
              value={qaQuery}
              onChange={(e) => setQaQuery(e.target.value)}
              placeholder={`Ask a question about ${chartData.title}...`}
              className="flex-1 bg-navy-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={qaLoading}
              className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {qaLoading ? 'Analyzing...' : 'Ask'}
            </button>
          </form>

          {qaAnswer && (
            <div className="p-2.5 bg-navy-900 border border-slate-800 rounded-lg text-slate-300 space-y-1 leading-relaxed max-h-40 overflow-y-auto">
              <p className="whitespace-pre-wrap">{qaAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
