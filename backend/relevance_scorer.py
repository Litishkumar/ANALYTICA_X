"""
AnalyticaX Insight Relevance Scorer
Ranks candidate insights against user queries with normalized 0.0 - 1.0 scores.
"""

from typing import Dict, Any, List

class InsightRelevanceScorer:
    """Computes relevance scores (0.0 to 1.0) for ranking insights against user questions"""

    INTENT_TYPE_MAP = {
        "trend_analysis": ["trend"],
        "comparison": ["categorical_patterns", "correlation"],
        "explanation": ["correlation", "trend", "distribution"],
        "recommendation": ["correlation", "missing_values", "outliers", "trend"],
        "kpi_query": ["trend", "categorical_patterns"],
        "dashboard_summary": ["correlation", "trend", "outliers", "missing_values"],
        "anomaly_detection": ["outliers", "missing_values"],
        "visualization": ["trend", "correlation", "categorical_patterns"],
        "general_query": ["correlation", "trend", "outliers", "missing_values", "distribution", "categorical_patterns"]
    }

    @staticmethod
    def rank_insights(query: str, intent_info: Dict[str, Any], insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        intent = intent_info.get("intent", "general_query")
        target_cols = [c.lower() for c in intent_info.get("entities", {}).get("columns", [])]
        preferred_types = InsightRelevanceScorer.INTENT_TYPE_MAP.get(intent, [])

        ranked_insights = []

        for insight in insights:
            score = 0.10  # Base floor score

            # 1. Intent - Insight Type Match (up to 0.35)
            ins_type = insight.get("type", "")
            if ins_type in preferred_types:
                score += 0.35
            elif intent == "general_query":
                score += 0.20

            # 2. Entity / Related Column Match (up to 0.40)
            related_cols = [c.lower() for c in insight.get("related_columns", [])]
            if target_cols:
                matched_cols = set(target_cols).intersection(set(related_cols))
                if matched_cols:
                    match_ratio = len(matched_cols) / len(target_cols)
                    score += 0.40 * match_ratio
            else:
                score += 0.15

            # 3. Keyword / Text Overlap (up to 0.10)
            title_msg = (insight.get("title", "") + " " + insight.get("message", "")).lower()
            query_words = set(query_lower.split())
            if any(w in title_msg for w in query_words if len(w) > 3):
                score += 0.10

            # 4. Insight Priority Boost (up to 0.05)
            prio = insight.get("priority", "Low")
            if prio == "High":
                score += 0.05
            elif prio == "Medium":
                score += 0.03

            normalized_score = round(min(1.0, max(0.05, score)), 2)

            insight_copy = dict(insight)
            insight_copy["relevance_score"] = normalized_score
            ranked_insights.append(insight_copy)

        # Sort by relevance_score descending
        ranked_insights.sort(key=lambda x: x["relevance_score"], reverse=True)
        return ranked_insights
