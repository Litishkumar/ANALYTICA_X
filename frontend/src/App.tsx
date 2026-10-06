import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { UploadWorkspace } from './components/UploadWorkspace';
import { DataProfiling } from './components/DataProfiling';
import { EDADashboard } from './components/EDADashboard';
import { InsightExplorer } from './components/InsightExplorer';
import { ConversationalAnalytics } from './components/ConversationalAnalytics';
import { ConversationalBI } from './components/ConversationalBI';
import { BIDashboard } from './components/BIDashboard';
import { AIAnalystPanel } from './components/AIAnalystPanel';
import { api } from './services/api';
import type { DatasetPreview, ProfilingData } from './services/api';
import { Bot } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [datasetPreview, setDatasetPreview] = useState<DatasetPreview | null>(null);
  const [profilingData, setProfilingData] = useState<ProfilingData | null>(null);
  const [edaData, setEdaData] = useState<any | null>(null);
  const [insightsData, setInsightsData] = useState<any[] | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchInitialProfile();
  }, []);

  const fetchInitialProfile = async () => {
    try {
      const res = await api.getProfiling();
      setDatasetPreview(res.preview);
      setProfilingData(res.profiling);
    } catch (e) {
      console.log("No initial dataset active");
    }
  };

  const handleDatasetAnalyzed = async (preview: DatasetPreview) => {
    setDatasetPreview(preview);
    try {
      const profRes = await api.getProfiling();
      setProfilingData(profRes.profiling);

      const edaRes = await api.getEDA();
      setEdaData(edaRes.eda);

      const insRes = await api.getInsights();
      setInsightsData(insRes.insights);

      setCurrentView('profiling');
    } catch (e) {
      console.error("Failed to analyze dataset", e);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-900 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {currentView !== 'overview' && (
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          datasetInfo={datasetPreview}
          onToggleAiPanel={() => setAiPanelOpen(!aiPanelOpen)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {currentView !== 'overview' && (
          <header className="h-16 border-b border-slate-800/80 bg-navy-950/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">Workspace:</span>
              <span className="text-xs font-semibold text-white bg-navy-800 px-3 py-1 rounded-lg border border-slate-700">
                {datasetPreview?.filename || 'sales_data.csv'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
                className="flex items-center gap-2 bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 border border-brand-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              >
                <Bot className="w-4 h-4 text-brand-400" />
                <span>Ask AI Analyst</span>
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          {currentView === 'overview' && (
            <LandingPage
              onStartAnalyzing={() => setCurrentView('upload')}
              onExploreDemo={() => {
                fetchInitialProfile();
                setCurrentView('dashboard');
              }}
            />
          )}

          {currentView === 'upload' && (
            <UploadWorkspace onDatasetAnalyzed={handleDatasetAnalyzed} />
          )}

          {currentView === 'profiling' && (
            <DataProfiling profiling={profilingData} />
          )}

          {currentView === 'eda' && (
            <EDADashboard edaData={edaData} />
          )}

          {currentView === 'insights' && (
            <InsightExplorer insightsList={insightsData || undefined} />
          )}

          {currentView === 'conversational-analytics' && (
            <ConversationalAnalytics datasetColumns={datasetPreview?.numerical_columns} />
          )}

          {currentView === 'conversational-bi' && (
            <ConversationalBI />
          )}

          {currentView === 'dashboard' && (
            <BIDashboard />
          )}
        </main>
      </div>

      <AIAnalystPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        datasetColumns={datasetPreview?.numerical_columns}
      />
    </div>
  );
}

export default App;
