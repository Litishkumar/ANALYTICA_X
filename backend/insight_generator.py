"""
AnalyticaX Insight Generator
Transforms deterministic EDA results into structured, categorized, and prioritized business insights.
"""

from typing import Dict, Any, List

class InsightGenerator:
    """Generates structured, actionable insights from EDA output"""

    def __init__(self, eda_results: Dict[str, Any]):
        self.eda = eda_results
        self.insights = []

    def generate_insights(self) -> List[Dict[str, Any]]:
        self.insights = []

        self._generate_correlation_insights()
        self._generate_trend_insights()
        self._generate_outlier_insights()
        self._generate_missing_insights()
        self._generate_distribution_insights()
        self._generate_categorical_insights()

        # Priority ordering: High -> Medium -> Low
        priority_map = {"High": 1, "Medium": 2, "Low": 3}
        self.insights.sort(key=lambda x: priority_map.get(x["priority"], 99))

        return self.insights

    def _generate_correlation_insights(self):
        corr_data = self.eda.get("correlation_matrix", {})
        strong_rels = corr_data.get("strong_relationships", [])

        for idx, rel in enumerate(strong_rels):
            c1, c2 = rel["col1"], rel["col2"]
            val = rel["correlation"]
            direction = rel["direction"]
            strength = rel["strength"]

            priority = "High" if strength == "very_strong" else "Medium"
            title = f"Strong {c1} - {c2} Correlation"
            msg = f"'{c1}' and '{c2}' exhibit a {strength.replace('_', ' ')} {direction} correlation of {val}."
            rec = f"Leverage '{c1}' performance to forecast '{c2}' and optimize cross-metric strategy."

            self.insights.append({
                "id": f"insight_corr_{idx+1}",
                "type": "correlation",
                "category": "Correlation",
                "title": title,
                "message": msg,
                "recommendation": rec,
                "priority": priority,
                "related_columns": [c1, c2],
                "details": {"correlation": val, "direction": direction}
            })

    def _generate_trend_insights(self):
        trends = self.eda.get("trend_analysis", {})
        idx = 1
        for col, t_info in trends.items():
            pct = t_info["percentage_change"]
            direction = t_info["direction"]
            date_col = t_info["date_column"]

            if direction in ["increasing", "decreasing"]:
                priority = "High" if abs(pct) >= 20.0 else "Medium"
                action_word = "surged by" if pct > 0 else "declined by"
                title = f"{direction.capitalize()} Trend in {col}"
                msg = f"'{col}' has {action_word} {abs(pct)}% over the analyzed time period ({date_col})."
                rec = f"Investigate root operational drivers for the {direction} pattern in '{col}'."

                self.insights.append({
                    "id": f"insight_trend_{idx}",
                    "type": "trend",
                    "category": "Trends",
                    "title": title,
                    "message": msg,
                    "recommendation": rec,
                    "priority": priority,
                    "related_columns": [col, date_col],
                    "details": t_info
                })
                idx += 1

    def _generate_outlier_insights(self):
        outliers = self.eda.get("outliers_analysis", {})
        idx = 1
        for col, info in outliers.items():
            cnt = info["outliers_count"]
            pct = info["percentage"]

            if pct >= 1.0:
                priority = "High" if pct >= 5.0 else "Medium"
                title = f"Potential Outliers Detected in {col}"
                msg = f"Found {cnt} outlier data points in '{col}' ({pct}% of values) outside IQR bounds [{info['lower_bound']} to {info['upper_bound']}]."
                rec = f"Audit extreme values in '{col}' to prevent distortion in statistical forecasting."

                self.insights.append({
                    "id": f"insight_outlier_{idx}",
                    "type": "outliers",
                    "category": "Outliers",
                    "title": title,
                    "message": msg,
                    "recommendation": rec,
                    "priority": priority,
                    "related_columns": [col],
                    "details": info
                })
                idx += 1

    def _generate_missing_insights(self):
        missing = self.eda.get("missing_values_analysis", {})
        idx = 1
        for col, info in missing.items():
            pct = info["percentage"]
            severity = info["severity"]

            priority = "High" if severity == "critical" else ("Medium" if severity == "needs_attention" else "Low")
            title = f"Data Quality Alert: Missing Values in {col}"
            msg = f"'{col}' has {info['count']} missing values ({pct}% missing)."
            rec = f"Apply statistical median/mode imputation or data collection remediation for '{col}'."

            self.insights.append({
                "id": f"insight_missing_{idx}",
                "type": "missing_values",
                "category": "Missing Values",
                "title": title,
                "message": msg,
                "recommendation": rec,
                "priority": priority,
                "related_columns": [col],
                "details": info
            })
            idx += 1

    def _generate_distribution_insights(self):
        num_stats = self.eda.get("numerical_analysis", {})
        idx = 1
        for col, stats in num_stats.items():
            shape = stats["distribution_shape"]
            skew = stats["skewness"]

            if shape in ["right_skewed", "left_skewed"] and abs(skew) > 1.0:
                priority = "Medium"
                title = f"Significant Skewness in {col}"
                msg = f"'{col}' is {shape.replace('_', ' ')} with a skewness coefficient of {skew}."
                rec = f"Consider applying log or Box-Cox transformations to normalize '{col}'."

                self.insights.append({
                    "id": f"insight_dist_{idx}",
                    "type": "distribution",
                    "category": "Distribution",
                    "title": title,
                    "message": msg,
                    "recommendation": rec,
                    "priority": priority,
                    "related_columns": [col],
                    "details": stats
                })
                idx += 1

    def _generate_categorical_insights(self):
        cat_stats = self.eda.get("categorical_analysis", {})
        idx = 1
        for col, info in cat_stats.items():
            dom_cat = info["dominant_category"]
            dom_pct = info["dominant_percentage"]

            if dom_pct >= 40.0:
                priority = "Medium" if dom_pct < 60.0 else "High"
                title = f"Dominant Category in {col}"
                msg = f"Category '{dom_cat}' represents {dom_pct}% of total records in '{col}'."
                rec = f"Evaluate target segment focus given the heavy concentration in '{dom_cat}'."

                self.insights.append({
                    "id": f"insight_cat_{idx}",
                    "type": "categorical_patterns",
                    "category": "Categorical Patterns",
                    "title": title,
                    "message": msg,
                    "recommendation": rec,
                    "priority": priority,
                    "related_columns": [col],
                    "details": info
                })
                idx += 1
