import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Database, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { DatasetPreview } from '../services/api';

interface UploadWorkspaceProps {
  onDatasetAnalyzed: (preview: DatasetPreview) => void;
}

export const UploadWorkspace: React.FC<UploadWorkspaceProps> = ({ onDatasetAnalyzed }) => {
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>('sales_data.csv');
  const [uploading, setUploading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [activePreview, setActivePreview] = useState<DatasetPreview | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await api.getSampleDatasets();
      setSamples(res.datasets || []);
    } catch (e) {
      console.error("Failed to load sample dataset list", e);
    }
  };

  const handleSampleSelect = async (sampleName: string) => {
    setSelectedSample(sampleName);
    setUploadedFile(null);
    setLoadingSample(true);
    try {
      const res = await api.loadSample(sampleName);
      setActivePreview(res.preview);
    } catch (e) {
      console.error("Failed to load sample dataset", e);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      setActivePreview(res.preview);
    } catch (e) {
      alert("Error parsing uploaded dataset. Please check file format.");
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeClick = () => {
    if (activePreview) {
      onDatasetAnalyzed(activePreview);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fadeIn">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-bold text-white tracking-tight">Data Workspace & Dataset Upload</h2>
        <p className="text-sm text-slate-400">
          Upload your dataset (CSV, Excel, JSON) or select a built-in benchmark dataset to begin automated EDA and conversational BI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`glass-panel border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              dragActive ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center mb-4 border border-brand-500/30">
              {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
            </div>

            <h3 className="text-lg font-semibold text-slate-100">
              {uploadedFile ? uploadedFile.name : 'Drag & drop your dataset file here'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Supports CSV, XLSX, XLS, and JSON formats up to 50MB.
            </p>

            <label className="mt-6 cursor-pointer bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all">
              <span>Browse Computer</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                className="hidden"
                onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
              />
            </label>

            {uploading && (
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-6 max-w-xs overflow-hidden">
                <div className="bg-brand-500 h-full animate-pulse w-3/4"></div>
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300 flex items-center gap-2">
                <Database className="w-4 h-4" /> Or Select Built-in Sample Dataset
              </span>
              <span className="text-[11px] text-slate-400">Ready for instant analysis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSampleSelect(s.filename)}
                  className={`p-3.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                    selectedSample === s.filename && !uploadedFile
                      ? 'bg-brand-600/20 border-brand-500/80 text-white shadow-glow'
                      : 'bg-navy-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{s.name}</span>
                    {selectedSample === s.filename && !uploadedFile && (
                      <CheckCircle className="w-4 h-4 text-brand-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{s.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Dataset Profile Summary
            </h3>

            {loadingSample ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-400" /> Loading dataset schema...
              </div>
            ) : activePreview ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-navy-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Dataset Name:</span>
                  <span className="font-semibold text-slate-200">{activePreview.filename}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-navy-950 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Total Rows</span>
                    <span className="text-lg font-bold text-white">{activePreview.rows.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-navy-950 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Total Columns</span>
                    <span className="text-lg font-bold text-white">{activePreview.columns}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-800/80 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Numerical Columns:</span>
                    <span className="font-medium text-brand-300">{activePreview.numerical_columns_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Categorical Columns:</span>
                    <span className="font-medium text-purple-300">{activePreview.categorical_columns_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date Columns:</span>
                    <span className="font-medium text-cyan-300">{activePreview.date_columns_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Missing Cell Count:</span>
                    <span className="font-medium text-amber-400">{activePreview.missing_values}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Memory Size:</span>
                    <span className="font-medium text-slate-200">{activePreview.memory_mb} MB</span>
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeClick}
                  className="w-full mt-4 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 group"
                >
                  Analyze Dataset <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Select or upload a dataset to view preview info.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
