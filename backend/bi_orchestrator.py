"""
AnalyticaX BI Orchestrator
Bridge between LLM visualization specs and Plotly chart engine with strict Pandas data transformations.
"""

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Dict, Any, List, Optional, Tuple

class BIOrchestrator:
    """Validates chart specs, applies Pandas transformations, and generates Plotly charts"""

    SUPPORTED_CHARTS = ["bar", "horizontal_bar", "line", "area", "scatter", "pie", "histogram", "box", "heatmap"]
    VALID_AGGREGATIONS = ["sum", "mean", "count", "min", "max", "median"]

    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.num_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        self.cat_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()
        self.date_cols = self.df.select_dtypes(include=['datetime64', 'datetime']).columns.tolist()

    def build_chart_from_spec(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Validate spec, execute Pandas pipeline, return Plotly JSON spec"""
        # 1. Validate chart type
        chart_type = spec.get("type", "bar").lower()
        if chart_type not in self.SUPPORTED_CHARTS:
            chart_type = "bar"

        # 2. Extract & validate column parameters
        x_col = spec.get("x_axis")
        y_col = spec.get("y_axis")
        color_col = spec.get("color_by")
        aggregation = spec.get("aggregation", "sum").lower()
        if aggregation not in self.VALID_AGGREGATIONS:
            aggregation = "sum"

        # Fallback columns if invalid
        if not x_col or x_col not in self.df.columns:
            if self.date_cols:
                x_col = self.date_cols[0]
            elif self.cat_cols:
                x_col = self.cat_cols[0]
            else:
                x_col = self.df.columns[0]

        if not y_col or y_col not in self.df.columns:
            if self.num_cols:
                y_col = self.num_cols[0]
            else:
                y_col = x_col
                aggregation = "count"

        # 3. Apply Filters
        filtered_df = self._apply_filters(self.df, spec.get("filters", []))
        if len(filtered_df) == 0:
            filtered_df = self.df.copy()

        # 4. Grouping & Aggregation
        transformed_df = self._aggregate_data(filtered_df, x_col, y_col, color_col, aggregation, chart_type)

        # 5. Sorting & Limit
        sort_order = spec.get("sort", "descending")
        if sort_order == "descending" and y_col in transformed_df.columns:
            transformed_df = transformed_df.sort_values(by=y_col, ascending=False)
        elif sort_order == "ascending" and y_col in transformed_df.columns:
            transformed_df = transformed_df.sort_values(by=y_col, ascending=True)

        limit = spec.get("limit")
        if limit and isinstance(limit, int) and limit > 0:
            transformed_df = transformed_df.head(limit)

        # 6. Generate Plotly Figure
        title = spec.get("title", f"{y_col} by {x_col}")
        fig = self._create_plotly_figure(transformed_df, chart_type, x_col, y_col, color_col, title, aggregation)

        return {
            "chart_type": chart_type,
            "title": title,
            "x_axis": x_col,
            "y_axis": y_col,
            "aggregation": aggregation,
            "data_summary": {
                "rows_rendered": len(transformed_df),
                "x_values": transformed_df[x_col].head(5).astype(str).tolist() if x_col in transformed_df.columns else []
            },
            "plotly_json": json_format_figure(fig)
        }

    def _apply_filters(self, df: pd.DataFrame, filters: List[Dict[str, Any]]) -> pd.DataFrame:
        res_df = df.copy()
        for f in filters:
            col = f.get("column")
            op = f.get("operator", "equals")
            val = f.get("value")

            if col and col in res_df.columns and val is not None:
                try:
                    if op == "equals":
                        res_df = res_df[res_df[col] == val]
                    elif op == "greater_than":
                        res_df = res_df[res_df[col] > float(val)]
                    elif op == "less_than":
                        res_df = res_df[res_df[col] < float(val)]
                    elif op == "in" and isinstance(val, list):
                        res_df = res_df[res_df[col].isin(val)]
                except Exception:
                    pass
        return res_df

    def _aggregate_data(self, df: pd.DataFrame, x_col: str, y_col: str, color_col: Optional[str], agg: str, chart_type: str) -> pd.DataFrame:
        if chart_type in ["histogram", "box", "heatmap"]:
            return df.copy()

        group_cols = [x_col]
        if color_col and color_col in df.columns and color_col != x_col:
            group_cols.append(color_col)

        if x_col in self.date_cols:
            df_temp = df.copy()
            df_temp[x_col] = pd.to_datetime(df_temp[x_col], errors='coerce').dt.strftime('%Y-%m')
            df_temp = df_temp.dropna(subset=[x_col])
        else:
            df_temp = df.copy()

        if x_col == y_col or agg == "count":
            res = df_temp.groupby(group_cols, as_index=False).size().rename(columns={"size": y_col})
        else:
            if agg == "sum":
                res = df_temp.groupby(group_cols, as_index=False)[y_col].sum()
            elif agg == "mean":
                res = df_temp.groupby(group_cols, as_index=False)[y_col].mean()
            elif agg == "max":
                res = df_temp.groupby(group_cols, as_index=False)[y_col].max()
            elif agg == "min":
                res = df_temp.groupby(group_cols, as_index=False)[y_col].min()
            elif agg == "median":
                res = df_temp.groupby(group_cols, as_index=False)[y_col].median()
            else:
                res = df_temp.groupby(group_cols, as_index=False)[y_col].sum()

        res[y_col] = res[y_col].round(2)
        return res

    def _create_plotly_figure(self, df: pd.DataFrame, chart_type: str, x_col: str, y_col: str, color_col: Optional[str], title: str, agg: str):
        # Professional Dark Navy Theme Template
        theme_colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
        
        layout_defaults = dict(
            title=dict(text=f"<b>{title}</b>", font=dict(family="Inter, sans-serif", size=16, color="#F9FAFB")),
            paper_bgcolor="rgba(15, 23, 42, 0.0)",
            plot_bgcolor="rgba(15, 23, 42, 0.4)",
            font=dict(family="Inter, sans-serif", color="#9CA3AF"),
            xaxis=dict(gridcolor="#1E293B", zerolinecolor="#1E293B"),
            yaxis=dict(gridcolor="#1E293B", zerolinecolor="#1E293B"),
            margin=dict(l=40, r=40, t=50, b=40)
        )

        if chart_type == "bar":
            fig = px.bar(df, x=x_col, y=y_col, color=color_col if color_col in df.columns else None, color_discrete_sequence=theme_colors)
        elif chart_type == "horizontal_bar":
            fig = px.bar(df, x=y_col, y=x_col, orientation='h', color=color_col if color_col in df.columns else None, color_discrete_sequence=theme_colors)
        elif chart_type == "line":
            fig = px.line(df, x=x_col, y=y_col, color=color_col if color_col in df.columns else None, markers=True, color_discrete_sequence=theme_colors)
        elif chart_type == "area":
            fig = px.area(df, x=x_col, y=y_col, color=color_col if color_col in df.columns else None, color_discrete_sequence=theme_colors)
        elif chart_type == "pie" or chart_type == "donut":
            fig = px.pie(df, names=x_col, values=y_col, hole=0.4 if chart_type == "donut" else 0.0, color_discrete_sequence=theme_colors)
        elif chart_type == "scatter":
            fig = px.scatter(df, x=x_col, y=y_col, color=color_col if color_col in df.columns else None, color_discrete_sequence=theme_colors)
        elif chart_type == "histogram":
            fig = px.histogram(df, x=y_col, color_discrete_sequence=theme_colors)
        elif chart_type == "box":
            fig = px.box(df, x=x_col if x_col in self.cat_cols else None, y=y_col, color_discrete_sequence=theme_colors)
        else:
            fig = px.bar(df, x=x_col, y=y_col, color_discrete_sequence=theme_colors)

        fig.update_layout(**layout_defaults)
        return fig



    def generate_auto_dashboard_specs(self) -> Dict[str, Any]:
        """Automatically recommends and constructs a multi-chart BI dashboard layout"""
        kpis = []
        charts = []

        # Calculate 3-4 KPI Cards
        for num_col in self.num_cols[:4]:
            s = self.df[num_col].dropna()
            if len(s) > 0:
                kpis.append({
                    "title": f"Total {num_col}",
                    "value": f"{s.sum():,.2f}" if s.sum() > 1000 else f"{s.sum():,.2f}",
                    "formatted": f"${s.sum():,.0f}" if any(k in num_col.lower() for k in ["sales", "profit", "revenue", "price", "spend"]) else f"{s.sum():,.0f}",
                    "metric_type": num_col
                })

        # Chart 1: Time Series / Main Metric Trend
        if self.date_cols and self.num_cols:
            spec1 = {
                "type": "line",
                "title": f"{self.num_cols[0]} Monthly Trend",
                "x_axis": self.date_cols[0],
                "y_axis": self.num_cols[0],
                "aggregation": "sum"
            }
            charts.append(self.build_chart_from_spec(spec1))

        # Chart 2: Main Dimension Breakdown (Bar Chart)
        if self.cat_cols and self.num_cols:
            spec2 = {
                "type": "bar",
                "title": f"{self.num_cols[0]} by {self.cat_cols[0]}",
                "x_axis": self.cat_cols[0],
                "y_axis": self.num_cols[0],
                "aggregation": "sum",
                "sort": "descending",
                "limit": 7
            }
            charts.append(self.build_chart_from_spec(spec2))

        # Chart 3: Second Metric or Profit Breakdown (Horizontal Bar / Pie)
        if len(self.num_cols) > 1 and self.cat_cols:
            spec3 = {
                "type": "donut",
                "title": f"{self.num_cols[1]} Distribution by {self.cat_cols[0]}",
                "x_axis": self.cat_cols[0],
                "y_axis": self.num_cols[1],
                "aggregation": "sum",
                "limit": 6
            }
            charts.append(self.build_chart_from_spec(spec3))

        # Chart 4: Correlation / Relationship (Scatter Plot)
        if len(self.num_cols) >= 2:
            spec4 = {
                "type": "scatter",
                "title": f"{self.num_cols[0]} vs {self.num_cols[1]} Relationship",
                "x_axis": self.num_cols[0],
                "y_axis": self.num_cols[1]
            }
            charts.append(self.build_chart_from_spec(spec4))

        return {
            "kpis": kpis,
            "charts": charts
        }

def json_format_figure(fig) -> Dict[str, Any]:
    """Helper to convert Plotly figure object to JSON dict"""
    import json
    return json.loads(fig.to_json())
