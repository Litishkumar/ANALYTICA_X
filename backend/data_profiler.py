"""
AnalyticaX Data Profiler
Calculates comprehensive dataset profiling statistics and deterministic quality scores.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List

class DataProfiler:
    """Computes dataset schema statistics and deterministic data quality score"""

    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()



    def run_profiling(self) -> Dict[str, Any]:
        total_rows = len(self.df)
        total_cols = len(self.df.columns)
        total_cells = total_rows * total_cols if total_rows > 0 and total_cols > 0 else 1

        num_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()
        date_cols = self.df.select_dtypes(include=['datetime64', 'datetime']).columns.tolist()

        missing_counts = self.df.isnull().sum()
        total_missing = int(missing_counts.sum())
        missing_pct = round((total_missing / total_cells) * 100, 2)

        duplicate_rows = int(self.df.duplicated().sum())
        duplicate_pct = round((duplicate_rows / total_rows) * 100, 2) if total_rows > 0 else 0.0

        # Memory calculation
        memory_usage_bytes = self.df.memory_usage(deep=True).sum()
        memory_mb = round(memory_usage_bytes / (1024 * 1024), 2)

        # Column profile details
        columns_detail = []
        outlier_count_total = 0

        for col in self.df.columns:
            missing_val = int(missing_counts[col])
            missing_col_pct = round((missing_val / total_rows) * 100, 2) if total_rows > 0 else 0.0
            unique_val = int(self.df[col].nunique(dropna=True))

            col_type = "numerical" if col in num_cols else ("datetime" if col in date_cols else "categorical")
            outliers_col = 0

            if col in num_cols and total_rows > 3:
                s = self.df[col].dropna()
                if len(s) > 0:
                    q1 = s.quantile(0.25)
                    q3 = s.quantile(0.75)
                    iqr = q3 - q1
                    if iqr > 0:
                        lower_bound = q1 - 1.5 * iqr
                        upper_bound = q3 + 1.5 * iqr
                        outliers_col = int(((s < lower_bound) | (s > upper_bound)).sum())
                        outlier_count_total += outliers_col

            columns_detail.append({
                "column_name": col,
                "data_type": str(self.df[col].dtype),
                "type_category": col_type,
                "missing_count": missing_val,
                "missing_percentage": missing_col_pct,
                "unique_values": unique_val,
                "outliers_count": outliers_col
            })

        # Calculate Deterministic Quality Score (0 to 100)
        # Deductions:
        # Missing values ratio deduction (up to 30 points)
        missing_deduction = min(30.0, (total_missing / total_cells) * 100 * 1.5)
        # Duplicate rows deduction (up to 20 points)
        duplicate_deduction = min(20.0, duplicate_pct * 2.0)
        # Outlier ratio deduction (up to 15 points)
        outlier_pct = (outlier_count_total / total_cells) * 100
        outlier_deduction = min(15.0, outlier_pct * 3.0)

        quality_score = max(0.0, min(100.0, round(100.0 - missing_deduction - duplicate_deduction - outlier_deduction, 1)))

        # Assign Quality Status Rating based on calculated score
        if quality_score >= 90.0:
            quality_status = "Excellent"
            status_color = "#10B981"  # Emerald
        elif quality_score >= 75.0:
            quality_status = "Good"
            status_color = "#3B82F6"  # Blue
        elif quality_score >= 55.0:
            quality_status = "Needs Attention"
            status_color = "#F59E0B"  # Amber
        else:
            quality_status = "Critical"
            status_color = "#EF4444"  # Red

        return {
            "overview": {
                "rows": total_rows,
                "columns": total_cols,
                "numerical_count": len(num_cols),
                "categorical_count": len(cat_cols),
                "datetime_count": len(date_cols),
                "memory_mb": memory_mb,
                "memory_bytes": int(memory_usage_bytes)
            },
            "quality": {
                "score": quality_score,
                "status": quality_status,
                "status_color": status_color,
                "total_missing": total_missing,
                "missing_percentage": missing_pct,
                "duplicate_rows": duplicate_rows,
                "duplicate_percentage": duplicate_pct,
                "total_outliers": outlier_count_total
            },
            "columns": columns_detail
        }
