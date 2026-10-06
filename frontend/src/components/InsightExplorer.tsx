import React, { useState, useEffect } from 'react';
import { Lightbulb, Filter, Search, ArrowUpDown, Tag } from 'lucide-react';
import { api } from '../services/api';
import type { InsightItem } from '../services/api';

interface InsightExplorerProps {
  insightsList?: InsightItem[];
}

export const InsightExplorer: React.FC<InsightExplorerProps> = ({ insightsList: initialInsights }) => {
  const [insights, setInsights] = useState<InsightItem[]>(initialInsights || []);
  const [loading, setLoading] = useState(!initialInsights);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'category' | 'title'>('priority');

  useEffect(() => {
    if (!initialInsights) {
      fetchInsights();
    }
  }, [initialInsights]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getInsights();
      setInsights(res.insights || []);
    } catch (e) {
      console.error("Failed to fetch insights", e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Correlation', 'Missing Values', 'Outliers', 'Trends', 'Distribution', 'Categorical Patterns'];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  const filteredInsights = insights.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPrio = selectedPriority === 'All' || item.priority === selectedPriority;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.related_columns.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesPrio && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const pMap: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
      return (pMap[a.priority] || 9) - (pMap[b.priority] || 9);
    } else if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fadeIn">
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-amber-400" /> Automated Insight Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Structured business insights deterministically generated from EDA statistical computations.
          </p>
        </div>
        <span className="text-xs bg-brand-500/20 text-brand-300 px-3 py-1 rounded-full font-mono border border-brand-500/30">
          {filteredInsights.length} Insights Found
        </span>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search insights or columns..."
              className="w-full bg-navy-950 border border-slate-700 text-xs text-slate-200 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="w-4 h-4 text-brand-400" /> Priority:
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-navy-950 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-brand-500"
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ArrowUpDown className="w-4 h-4 text-purple-400" /> Sort:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-navy-950 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-brand-500"
              >
                <option value="priority">Highest Priority</option>
                <option value="category">Category</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-800/80 pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-navy-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">Generating structured insights...</div>
      ) : filteredInsights.length === 0 ? (
        <div className="p-12 text-center text-slate-400 glass-card rounded-2xl">No insights match the selected filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInsights.map((item) => (
            <div
              key={item.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-brand-500/50 transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-brand-300 bg-brand-500/20 px-2.5 py-1 rounded-md border border-brand-500/30">
                  {item.category}
                </span>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  item.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                  item.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                  'bg-slate-700/40 text-slate-300 border-slate-600'
                }`}>
                  {item.priority} Priority
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-300 transition-colors flex items-center gap-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
              </div>

              <div className="p-3 bg-navy-950/80 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                  Actionable Recommendation
                </span>
                <p className="text-slate-300 text-[11px]">{item.recommendation}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  {item.related_columns?.map(col => (
                    <span key={col} className="bg-navy-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {col}
                    </span>
                  ))}
                </div>
                {item.relevance_score && (
                  <span className="text-purple-300 font-mono">
                    Relevance: {(item.relevance_score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
