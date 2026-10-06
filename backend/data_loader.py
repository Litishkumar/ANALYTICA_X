"""
AnalyticaX Data Loader
Handles ingestion of CSV, XLSX, XLS, and JSON files with schema detection.
"""

import io
import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional

SAMPLE_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_data")

class DataLoader:
    """Ingests dataset files and extracts metadata"""

    @staticmethod
    def load_from_bytes(file_bytes: bytes, filename: str) -> pd.DataFrame:
        """Parse bytes based on file extension"""
        ext = filename.lower().split('.')[-1]
        
        if ext == 'csv':
            try:
                df = pd.read_csv(io.BytesIO(file_bytes))
            except Exception:
                # Retry with latin-1 encoding
                df = pd.read_csv(io.BytesIO(file_bytes), encoding='latin-1')
        elif ext in ['xlsx', 'xls']:
            df = pd.read_excel(io.BytesIO(file_bytes))
        elif ext == 'json':
            df = pd.read_json(io.BytesIO(file_bytes))
        else:
            raise ValueError(f"Unsupported file format: .{ext}")

        return DataLoader._clean_and_parse_df(df)

    @staticmethod
    def load_sample(sample_name: str = "sales_data.csv") -> Tuple[pd.DataFrame, str]:
        """Load built-in sample dataset"""
        filepath = os.path.join(SAMPLE_DATA_DIR, sample_name)
        if not os.path.exists(filepath):
            # Fallback to default
            filepath = os.path.join(SAMPLE_DATA_DIR, "sales_data.csv")
            sample_name = "sales_data.csv"
            
        df = pd.read_csv(filepath)
        return DataLoader._clean_and_parse_df(df), sample_name

    @staticmethod
    def list_sample_datasets() -> list:
        """List available sample datasets"""
        if not os.path.exists(SAMPLE_DATA_DIR):
            return []
        files = [f for f in os.listdir(SAMPLE_DATA_DIR) if f.endswith(('.csv', '.xlsx', '.json'))]
        return [
            {
                "id": f,
                "name": f.replace("_", " ").replace(".csv", "").title(),
                "filename": f,
                "description": "Retail Sales, Revenue & Profit Performance (1,500 rows)" if "sales" in f else "E-Commerce Traffic, Conversions & ROI (1,200 rows)"
            }
            for f in files
        ]

    @staticmethod
    def _clean_and_parse_df(df: pd.DataFrame) -> pd.DataFrame:
        """Auto-detect date columns and clean column headers"""
        # Clean column names
        df.columns = [str(col).strip() for col in df.columns]

        # Auto-parse datetime strings
        for col in df.columns:
            if df[col].dtype == 'object':
                # Check if looks like date
                sample_vals = df[col].dropna().head(10).astype(str)
                if len(sample_vals) > 0 and all(len(v) >= 8 and any(char in v for char in ['-', '/', ' ']) for v in sample_vals):
                    try:
                        df[col] = pd.to_datetime(df[col], errors='ignore')
                    except Exception:
                        pass
        return df

    @staticmethod
    def get_preview_info(df: pd.DataFrame, filename: str = "dataset.csv") -> Dict[str, Any]:
        """Generate high-level metadata for UI upload preview"""
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        date_cols = df.select_dtypes(include=['datetime64', 'datetime']).columns.tolist()

        missing_total = int(df.isnull().sum().sum())
        memory_mb = round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)

        preview_rows = df.head(10).replace({np.nan: None}).to_dict(orient='records')

        return {
            "filename": filename,
            "rows": int(len(df)),
            "columns": int(len(df.columns)),
            "numerical_columns_count": len(num_cols),
            "categorical_columns_count": len(cat_cols),
            "date_columns_count": len(date_cols),
            "numerical_columns": num_cols,
            "categorical_columns": cat_cols,
            "date_columns": date_cols,
            "missing_values": missing_total,
            "memory_mb": memory_mb,
            "preview_data": preview_rows
        }
