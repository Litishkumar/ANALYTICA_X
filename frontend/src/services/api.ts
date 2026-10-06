import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api`;

export interface DatasetPreview {
  filename: string;
  rows: number;
  columns: number;
  numerical_columns_count: number;
  categorical_columns_count: number;
  date_columns_count: number;
  numerical_columns: string[];
  categorical_columns: string[];
  date_columns: string[];
  missing_values: number;
  memory_mb: number;
  preview_data: Record<string, any>[];
}

export interface ColumnQuality {
  column_name: string;
  data_type: string;
  type_category: string;
  missing_count: number;
  missing_percentage: number;
  unique_values: number;
  outliers_count: number;
}

export interface QualityProfile {
  score: number;
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  status_color: string;
  total_missing: number;
  missing_percentage: number;
  duplicate_rows: number;
  duplicate_percentage: number;
  total_outliers: number;
}

export interface ProfilingData {
  overview: {
    rows: number;
    columns: number;
    numerical_count: number;
    categorical_count: number;
    datetime_count: number;
    memory_mb: number;
    memory_bytes: number;
  };
  quality: QualityProfile;
  columns: ColumnQuality[];
}

export interface InsightItem {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
  related_columns: string[];
  details: Record<string, any>;
  relevance_score?: number;
}

export interface ChartResult {
  chart_type: string;
  title: string;
  x_axis: string;
  y_axis: string;
  aggregation: string;
  data_summary: {
    rows_rendered: number;
    x_values: string[];
  };
  plotly_json: any;
}

export const api = {
  async getSampleDatasets() {
    const res = await axios.get(`${API_BASE}/sample-datasets`);
    return res.data;
  },

  async loadSample(sample_name: string) {
    const res = await axios.post(`${API_BASE}/load-sample`, { sample_name });
    return res.data;
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async getProfiling(): Promise<{ filename: string; preview: DatasetPreview; profiling: ProfilingData }> {
    const res = await axios.get(`${API_BASE}/profile`);
    return res.data;
  },

  async getEDA() {
    const res = await axios.get(`${API_BASE}/eda`);
    return res.data;
  },

  async getInsights(): Promise<{ filename: string; total_insights: number; insights: InsightItem[] }> {
    const res = await axios.get(`${API_BASE}/insights`);
    return res.data;
  },

  async sendChat(query: string) {
    const res = await axios.post(`${API_BASE}/chat`, { query });
    return res.data;
  },

  async sendConversationalBI(query: string) {
    const res = await axios.post(`${API_BASE}/conversational-bi`, { query });
    return res.data;
  },

  async getAutoDashboard() {
    const res = await axios.get(`${API_BASE}/auto-dashboard`);
    return res.data;
  },

  async sendChartQA(query: string, chart_info: any) {
    const res = await axios.post(`${API_BASE}/chart-qa`, { query, chart_info });
    return res.data;
  }
};
