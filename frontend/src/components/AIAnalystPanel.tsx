import React, { useState } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface AIAnalystPanelProps {
  isOpen: boolean;
  onClose: () => void;
  datasetColumns?: string[];
}

export const AIAnalystPanel: React.FC<AIAnalystPanelProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ q: string; a: string }>>([
    {
      q: "Summarize dataset",
      a: "Dataset active with high quality score. Ask me about trends, correlations, or request custom charts!"
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (qText?: string) => {
    const activeQ = qText || query;
    if (!activeQ.trim() || loading) return;

    setLoading(true);
    setQuery('');
    try {
      const res = await api.sendChat(activeQ);
      setConversation((prev) => [...prev, { q: activeQ, a: res.answer }]);
    } catch (e) {
      setConversation((prev) => [...prev, { q: activeQ, a: "Unable to process question. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const dynamicPrompts = [
    "Why did sales decrease?",
    "Show sales by region.",
    "Summarize key data insights."
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-navy-950/95 border-l border-slate-800 shadow-2xl z-50 backdrop-blur-xl flex flex-col justify-between animate-slideLeft">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Bot className="w-5 h-5 text-brand-400" />
          <span>AnalyticaX AI Assistant</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
        {conversation.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="p-3 bg-brand-600/20 text-brand-200 rounded-xl border border-brand-500/30 text-right">
              {item.q}
            </div>
            <div className="p-3 bg-navy-900 text-slate-200 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
              {item.a}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" /> Gemini AI is retrieving context...
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3 bg-navy-950">
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Suggested Prompts</span>
          <div className="space-y-1">
            {dynamicPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="w-full text-left text-[11px] bg-navy-900 hover:bg-slate-800 text-slate-300 p-2 rounded-lg border border-slate-800 transition-all truncate"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your data..."
            className="flex-1 bg-navy-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
