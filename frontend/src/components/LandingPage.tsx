import React from 'react';
import { Sparkles, ArrowRight, BarChart3, BrainCircuit, ShieldCheck, Zap } from 'lucide-react';

interface LandingPageProps {
  onStartAnalyzing: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalyzing, onExploreDemo }) => {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-100 overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <header className="max-w-7xl mx-auto px-6 py-6 w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Analytica<span className="text-brand-400">X</span></span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onExploreDemo}
            className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            Explore Demo
          </button>
          <button
            onClick={onStartAnalyzing}
            className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl shadow-glow transition-all flex items-center gap-2"
          >
            Start Analyzing <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20 z-10 flex-1 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <BrainCircuit className="w-4 h-4 text-brand-400" /> Conversational Data Science & BI Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mb-6">
          Turn Raw Data Into <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">Decisions.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
          Upload your dataset, discover hidden patterns, generate intelligent insights, and interact with your data using natural language.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
          <button
            onClick={onStartAnalyzing}
            className="w-full sm:w-auto text-base font-semibold bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 group"
          >
            Start Analyzing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto text-base font-medium glass-card hover:bg-slate-800 text-slate-200 border border-slate-700 px-8 py-4 rounded-xl transition-all"
          >
            Explore Demo Dataset
          </button>
        </div>

        <div className="w-full max-w-5xl glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative group overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-xs font-mono text-slate-400 ml-2">AnalyticaX Enterprise Dashboard — Live Workspace</span>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ● Gemini 2.5 Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left mb-6">
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Total Revenue</p>
              <h4 className="text-2xl font-bold text-white mt-1">₹25.4M</h4>
              <span className="text-xs text-emerald-400 font-medium">+23.5% vs last period</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Net Profit Margin</p>
              <h4 className="text-2xl font-bold text-white mt-1">₹5.2M</h4>
              <span className="text-xs text-brand-400 font-medium">20.4% profit rate</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Total Orders</p>
              <h4 className="text-2xl font-bold text-white mt-1">12,540</h4>
              <span className="text-xs text-indigo-400 font-medium">18 distinct columns</span>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Data Quality Score</p>
              <h4 className="text-2xl font-bold text-emerald-400 mt-1">98.9 / 100</h4>
              <span className="text-xs text-slate-400 font-medium">Rating: Excellent</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="md:col-span-2 glass-card p-4 rounded-2xl border border-slate-800 h-64 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Revenue & Profit Trend Analysis</span>
                <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded">Plotly Engine</span>
              </div>
              <div className="flex items-end justify-between h-40 gap-3 pt-6 px-2">
                {[65, 80, 45, 95, 70, 110, 85, 125, 140, 105, 130, 150].map((h, i) => (
                  <div key={i} className="flex-1 bg-slate-800 rounded-t-md overflow-hidden relative group/bar">
                    <div
                      className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${(h / 150) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 h-64 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                <BrainCircuit className="w-4 h-4 text-brand-400" /> AI Insights Preview
              </div>
              <div className="space-y-3 my-2 text-xs">
                <div className="p-2.5 bg-navy-950/80 rounded-xl border border-brand-500/30">
                  <p className="font-medium text-slate-200">Strong Sales-Profit Relationship</p>
                  <p className="text-[11px] text-slate-400 mt-1">Correlation of 0.82 identified between sales volume and profitability.</p>
                </div>
                <div className="p-2.5 bg-navy-950/80 rounded-xl border border-purple-500/30">
                  <p className="font-medium text-slate-200">Regional Performance Peak</p>
                  <p className="text-[11px] text-slate-400 mt-1">Chennai region generated highest revenue share at 25.4%.</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 text-center">Grounded LLM Reasoning • 0 Fabrication</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-navy-950/80 py-8 z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <div>
              <p className="text-xs font-semibold text-white">Automated EDA</p>
              <p className="text-[11px] text-slate-400">Statistical profiling & IQR outliers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-xs font-semibold text-white">Structured Insights</p>
              <p className="text-[11px] text-slate-400">Prioritized business recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-white">Conversational AI</p>
              <p className="text-[11px] text-slate-400">Intent & entity-driven retrieval</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <div>
              <p className="text-xs font-semibold text-white">Conversational BI</p>
              <p className="text-[11px] text-slate-400">Interactive Plotly visualization specs</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
