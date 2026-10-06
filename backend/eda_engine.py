"""
AnalyticaX EDA Engine
Performs comprehensive deterministic Exploratory Data Analysis (EDA).
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

class EDAEngine:
    """Automated Exploratory Data Analysis Engine"""

    def __init__(self, df: pd.DataFrame, correlation_threshold: float = 0.5):
        self.df = df.copy()
        self.correlation_threshold = correlation_threshold

    def run_full_eda(self) -> Dict[str, Any]:
        """Runs numerical, categorical, correlation, missing, outlier, and time-series trend analysis"""
        num_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()
        date_cols = self.df.select_dtypes(include=['datetime64', 'datetime']).columns.tolist()

        return {
            "numerical_analysis": self._analyze_numerical(num_cols),
            "categorical_analysis": self._analyze_categorical(cat_cols),
            "correlation_matrix": self._analyze_correlations(num_cols),
            "missing_values_analysis": self._analyze_missing_values(),
            "outliers_analysis": self._analyze_outliers(num_cols),
            "trend_analysis": self._analyze_trends(num_cols, date_cols),
            "summary_metrics": self._compute_kpis(num_cols)
        }

    def _analyze_numerical(self, num_cols: List[str]) -> Dict[str, Any]:
        result = {}
        for col in num_cols:
            s = self.df[col].dropna()
            if len(s) == 0:
                continue
            mean_val = float(s.mean())
            median_val = float(s.median())
            std_val = float(s.std()) if len(s) > 1 else 0.0
            min_val = float(s.min())
            max_val = float(s.max())
            q25 = float(s.quantile(0.25))
            q75 = float(s.quantile(0.75))
            skew_val = float(s.skew()) if len(s) > 2 else 0.0

            result[col] = {
                "mean": round(mean_val, 2),
                "median": round(median_val, 2),
                "std": round(std_val, 2),
                "min": round(min_val, 2),
                "max": round(max_val, 2),
                "q25": round(q25, 2),
                "q75": round(q75, 2),
                "iqr": round(q75 - q25, 2),
                "skewness": round(skew_val, 2),
                "distribution_shape": "symmetric" if abs(skew_val) < 0.5 else ("right_skewed" if skew_val >= 0.5 else "left_skewed")
            }
        return result

    def _analyze_categorical(self, cat_cols: List[str]) -> Dict[str, Any]:
        result = {}
        for col in cat_cols:
            vc = self.df[col].value_counts(dropna=False, normalize=False)
            vc_pct = self.df[col].value_counts(dropna=False, normalize=True) * 100
            
            top_cats = []
            for cat_name, count in vc.head(10).items():
                pct = float(vc_pct[cat_name])
                top_cats.append({
                    "category": str(cat_name),
                    "count": int(count),
                    "percentage": round(pct, 2)
                })

            dominant = top_cats[0] if top_cats else {"category": "N/A", "percentage": 0.0}
            result[col] = {
                "num_categories": int(self.df[col].nunique()),
                "dominant_category": dominant["category"],
                "dominant_percentage": dominant["percentage"],
                "top_categories": top_cats
            }
        return result

    def _analyze_correlations(self, num_cols: List[str]) -> Dict[str, Any]:
        if len(num_cols) < 2:
            return {"matrix": {}, "strong_relationships": []}

        corr_df = self.df[num_cols].corr(method='pearson')
        matrix_dict = {}

        for col in num_cols:
            matrix_dict[col] = {other: round(float(corr_df.loc[col, other]), 3) if not np.isnan(corr_df.loc[col, other]) else 0.0 for other in num_cols}

        strong_relationships = []
        visited = set()
        for i, c1 in enumerate(num_cols):
            for j, c2 in enumerate(num_cols):
                if i < j:
                    val = float(corr_df.loc[c1, c2])
                    if not np.isnan(val) and abs(val) >= self.correlation_threshold:
                        direction = "positive" if val > 0 else "negative"
                        strength = "very_strong" if abs(val) >= 0.8 else "strong"
                        strong_relationships.append({
                            "col1": c1,
                            "col2": c2,
                            "correlation": round(val, 3),
                            "direction": direction,
                            "strength": strength
                        })

        strong_relationships.sort(key=lambda x: abs(x["correlation"]), reverse=True)

        return {
            "matrix": matrix_dict,
            "strong_relationships": strong_relationships
        }

    def _analyze_missing_values(self) -> Dict[str, Any]:
        missing_counts = self.df.isnull().sum()
        total_rows = len(self.df)
        result = {}

        for col in self.df.columns:
            cnt = int(missing_counts[col])
            if cnt > 0:
                pct = round((cnt / total_rows) * 100, 2)
                severity = "critical" if pct >= 20.0 else ("needs_attention" if pct >= 5.0 else "low")
                result[col] = {
                    "count": cnt,
                    "percentage": pct,
                    "severity": severity
                }
        return result

    def _analyze_outliers(self, num_cols: List[str]) -> Dict[str, Any]:
        result = {}
        for col in num_cols:
            s = self.df[col].dropna()
            if len(s) < 4:
                continue
            q1 = float(s.quantile(0.25))
            q3 = float(s.quantile(0.75))
            iqr = q3 - q1
            if iqr == 0:
                continue
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outliers = s[(s < lower_bound) | (s > upper_bound)]
            cnt = len(outliers)
            pct = round((cnt / len(s)) * 100, 2)
            if cnt > 0:
                result[col] = {
                    "outliers_count": cnt,
                    "percentage": pct,
                    "lower_bound": round(lower_bound, 2),
                    "upper_bound": round(upper_bound, 2),
                    "min_outlier": round(float(outliers.min()), 2),
                    "max_outlier": round(float(outliers.max()), 2)
                }
        return result

    def _analyze_trends(self, num_cols: List[str], date_cols: List[str]) -> Dict[str, Any]:
        if not date_cols or not num_cols:
            return {}

        date_col = date_cols[0]
        temp_df = self.df[[date_col] + num_cols].dropna().sort_values(by=date_col)
        if len(temp_df) < 10:
            return {}

        result = {}
        # Resample by Month or Day
        try:
            grouped = temp_df.set_index(date_col).resample('ME').sum(numeric_only=True)
            if len(grouped) < 3:
                grouped = temp_df.set_index(date_col).resample('D').sum(numeric_only=True)
        except Exception:
            return {}

        for col in num_cols:
            if col in grouped.columns:
                series = grouped[col].values
                if len(series) >= 3 and series[0] != 0:
                    start_val = float(series[0])
                    end_val = float(series[-1])
                    pct_change = round(((end_val - start_val) / abs(start_val)) * 100, 2)
                    direction = "increasing" if pct_change > 2.0 else ("decreasing" if pct_change < -2.0 else "stable")
                    result[col] = {
                        "date_column": date_col,
                        "direction": direction,
                        "percentage_change": pct_change,
                        "start_value": round(start_val, 2),
                        "end_value": round(end_val, 2)
                    }
        return result

    def _compute_kpis(self, num_cols: List[str]) -> Dict[str, Any]:
        kpis = {}
        for col in num_cols:
            s = self.df[col].dropna()
            if len(s) > 0:
                kpis[col] = {
                    "sum": round(float(s.sum()), 2),
                    "avg": round(float(s.mean()), 2),
                    "max": round(float(s.max()), 2),
                    "min": round(float(s.min()), 2)
                }
        return kpis
