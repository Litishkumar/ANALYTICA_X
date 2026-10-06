"""
AnalyticaX Intent Classifier & Entity Extractor
Determines user query intent and extracts key analytical entities (columns, categories, metrics, dates).
"""

import re
from typing import Dict, Any, List

class IntentClassifier:
    """Classifies user natural language query into analytical intent and extracts entities"""

    SUPPORTED_INTENTS = [
        "trend_analysis",
        "comparison",
        "explanation",
        "recommendation",
        "kpi_query",
        "dashboard_summary",
        "anomaly_detection",
        "visualization",
        "general_query"
    ]

    def __init__(self, dataset_columns: List[str]):
        self.columns = dataset_columns
        self.columns_lower = {c.lower(): c for c in dataset_columns}

    def classify(self, query: str) -> Dict[str, Any]:
        q_lower = query.lower()

        # 1. Intent Detection Rules & Regex Keywords
        intent = "general_query"

        if any(w in q_lower for w in ["chart", "plot", "graph", "show me", "bar", "line", "pie", "histogram", "scatter", "draw", "visualize"]):
            intent = "visualization"
        elif any(w in q_lower for w in ["trend", "over time", "monthly", "growth", "historical", "increase", "decrease", "pattern"]):
            intent = "trend_analysis"
        elif any(w in q_lower for w in ["compare", "vs", "versus", "difference", "between", "highest vs", "top vs"]):
            intent = "comparison"
        elif any(w in q_lower for w in ["why", "explain", "reason", "cause", "driver", "account for"]):
            intent = "explanation"
        elif any(w in q_lower for w in ["recommend", "action", "suggest", "advice", "what should"]):
            intent = "recommendation"
        elif any(w in q_lower for w in ["outlier", "anomaly", "unusual", "spike", "error", "extreme", "bad data"]):
            intent = "anomaly_detection"
        elif any(w in q_lower for w in ["total", "sum", "average", "mean", "max", "min", "kpi", "count", "revenue", "profit", "how much", "how many"]):
            intent = "kpi_query"
        elif any(w in q_lower for w in ["summary", "overview", "dashboard", "summarize", "tell me about this dataset"]):
            intent = "dashboard_summary"

        # 2. Entity Extraction
        matched_columns = []
        for col_lower, original_col in self.columns_lower.items():
            if col_lower in q_lower:
                matched_columns.append(original_col)

        # Extract potential metrics (numeric column names or common math terms)
        metrics = [c for c in matched_columns if any(m in c.lower() for m in ["sales", "profit", "revenue", "price", "rating", "cost", "score", "roi", "amount", "sessions", "rate", "quantity"])]
        
        # Extract potential categories/values
        categories = []
        words = re.findall(r'\b[A-Z][a-z]+\b', query)
        for w in words:
            if w not in matched_columns and w not in ["Show", "Plot", "Compare", "What", "Why", "How", "Are", "Which"]:
                categories.append(w)

        return {
            "intent": intent,
            "entities": {
                "columns": matched_columns,
                "metrics": metrics if metrics else (matched_columns[:1] if matched_columns else []),
                "categories": categories,
                "query_text": query
            }
        }
