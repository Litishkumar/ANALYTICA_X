import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Lightbulb, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { InsightItem } from '../services/api';
import { InteractiveChart } from './InteractiveChart';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  intent?: string;
  entities?: any;
  relevant_insights?: InsightItem[];
  optional_chart?: any;
  timestamp: string;
}

interface ConversationalAnalyticsProps {
  datasetColumns?: string[];
}

export const ConversationalAnalytics: React.FC<ConversationalAnalyticsProps> = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: "Hello! I am your AnalyticaX AI Analyst. Ask me anything about your active dataset, trends, correlations, or request custom visualizations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const suggestedPrompts = [
    "What are the major sales trends over time?",
    "Which region generated the highest profit?",
    "Are there any strong correlations between metrics?",
    "Summarize the dataset quality and key findings.",
    "Compare sales between Chennai and Bangalore."
  ];

  const handleSend = async (textToSend?: string) => {
    const activeQuery = textToSend || query;
    if (!activeQuery.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: activeQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await api.sendChat(activeQuery);
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        intent: res.intent,
        entities: res.entities,
        relevant_insights: res.relevant_insights,
        optional_chart: res.optional_chart,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: "I encountered an issue connecting to the analytical engine. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col h-[calc(100vh-6rem)] animate-fadeIn">
      <div className="border-b border-slate-800 pb-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <Bot className="w-6 h-6 text-brand-400" /> Conversational Analytics Assistant
          </h2>
          <p className="text-xs text-slate-400">
            Powered by Gemini 2.5 LLM with deterministic intent classification, entity extraction, and relevance-scored insight retrieval.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-4 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-glow">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-3xl space-y-3 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-glow'
                    : 'glass-panel border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
                }`}
              >
                {m.intent && (
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-2.5 py-0.5 rounded border border-brand-500/30">
                      Intent: {m.intent}
                    </span>

                    {m.entities?.metrics?.map((col: string) => (
                      <span key={col} className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                        Metric: {col}
                      </span>
                    ))}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>

              {m.relevant_insights && m.relevant_insights.length > 0 && (
                <div className="p-3 bg-navy-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Cited Insights (Relevance Ranked)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.relevant_insights.slice(0, 2).map((ins) => (
                      <div key={ins.id} className="p-2 bg-navy-900 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-slate-200">{ins.title}</span>
                          <span className="text-purple-300 font-mono">
                            {((ins.relevance_score || 0.8) * 100).toFixed(0)}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{ins.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {m.optional_chart && (
                <div className="w-full mt-2">
                  <InteractiveChart chartData={m.optional_chart} />
                </div>
              )}

              <span className="text-[10px] text-slate-500 px-1">{m.timestamp}</span>
            </div>

            {m.sender === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 justify-start items-center">
            <div className="w-9 h-9 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="glass-panel px-4 py-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" /> AnalyticaX AI is reasoning over analytical results...
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
        <span className="text-[11px] text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Prompts:
        </span>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="text-[11px] bg-navy-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask any analytical question about your dataset..."
          className="flex-1 bg-navy-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-2xl font-semibold text-xs shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span>Send</span> <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
