"""
AnalyticaX LLM Client
Interacts with Google Gemini API for grounded natural language answers, chart planning, and insight explanation.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("AnalyticaX.LLM")

class LLMClient:
    """Interface for Google Gemini API with robust fallbacks for grounded analytics"""

    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Google Gemini Client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini Client: {e}")
                self.client = None
        else:
            logger.info("No GEMINI_API_KEY set. Operating in offline grounded analytical mode.")

    def generate_grounded_answer(
        self,
        query: str,
        intent_info: Dict[str, Any],
        top_insights: List[Dict[str, Any]],
        schema_summary: Dict[str, Any]
    ) -> str:
        """Generate concise grounded business answer for analytical question"""
        intent = intent_info.get("intent", "general_query")
        entities = intent_info.get("entities", {})

        # System instructions as specified in prompt section 14
        system_instruction = (
            "You are an expert data analytics assistant for AnalyticaX.\n"
            "Answer using the supplied analytical context and insights.\n"
            "Do not invent or fabricate numerical values.\n"
            "Do not claim causation from correlation alone.\n"
            "If the available data does not support an answer, explicitly state that.\n"
            "Explain findings clearly for a business executive user.\n"
            "Mention relevant metrics when useful."
        )

        insights_context_text = "\n".join([
            f"- [{ins.get('category')}] {ins.get('title')}: {ins.get('message')} (Relevance: {ins.get('relevance_score')}, Priority: {ins.get('priority')}). Recommendation: {ins.get('recommendation')}"
            for ins in top_insights[:4]
        ])

        prompt = (
            f"User Question: '{query}'\n"
            f"Detected Intent: {intent}\n"
            f"Dataset Schema: {schema_summary.get('rows')} rows, {schema_summary.get('columns')} columns.\n"
            f"Numerical Columns: {', '.join(schema_summary.get('numerical_columns', []))}\n"
            f"Categorical Columns: {', '.join(schema_summary.get('categorical_columns', []))}\n\n"
            f"Relevant Analytical Insights:\n{insights_context_text if insights_context_text else 'No specific insight matches.'}\n\n"
            "Provide a grounded, professional response:"
        )

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=f"{system_instruction}\n\n{prompt}"
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini API error during grounded answer generation: {e}")

        # Intelligent Fallback grounded synthesis
        return self._fallback_grounded_answer(query, intent, top_insights, schema_summary)

    def plan_visualization_spec(
        self,
        query: str,
        schema_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate JSON visualization specification from user query"""
        system_instruction = (
            "You are an expert BI visualization planner.\n"
            "Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "type": "bar" | "horizontal_bar" | "line" | "area" | "scatter" | "pie" | "donut" | "histogram" | "box",\n'
            '  "title": "Chart Title",\n'
            '  "x_axis": "column_name",\n'
            '  "y_axis": "column_name",\n'
            '  "aggregation": "sum" | "mean" | "count" | "max" | "min" | "median",\n'
            '  "sort": "descending" | "ascending",\n'
            '  "limit": 5 | 10 | null\n'
            "}"
        )

        prompt = (
            f"Request: '{query}'\n"
            f"Available Columns:\n"
            f"Numerical: {schema_summary.get('numerical_columns')}\n"
            f"Categorical: {schema_summary.get('categorical_columns')}\n"
            f"Date: {schema_summary.get('date_columns')}\n"
            "Return valid JSON:"
        )

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=f"{system_instruction}\n\n{prompt}"
                )
                if response and response.text:
                    clean_text = response.text.replace("```json", "").replace("```", "").strip()
                    return json.loads(clean_text)
            except Exception as e:
                logger.error(f"Gemini API error during visualization planning: {e}")

        # Fallback visualization planner
        return self._fallback_visualization_spec(query, schema_summary)

    def explain_chart_context(
        self,
        query: str,
        chart_info: Dict[str, Any],
        schema_summary: Dict[str, Any]
    ) -> str:
        """Answer question specifically about a rendered Plotly chart ("Ask AI about this chart")"""
        title = chart_info.get("title", "Active Chart")
        chart_type = chart_info.get("chart_type", "bar")
        x_axis = chart_info.get("x_axis", "")
        y_axis = chart_info.get("y_axis", "")
        summary = chart_info.get("data_summary", {})

        prompt = (
            f"The user is viewing a {chart_type} chart titled '{title}' showing '{y_axis}' by '{x_axis}'.\n"
            f"Rendered X-axis top samples: {summary.get('x_values', [])}.\n"
            f"User Question: '{query}'\n\n"
            "Explain the chart observations and answer the user question directly based strictly on the chart context:"
        )

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini API error during chart Q&A: {e}")

        return (
            f"Based on the **{title}** visualization ({chart_type} chart showing `{y_axis}` across `{x_axis}`):\n\n"
            f"• The top observed `{x_axis}` categories are: **{', '.join(str(x) for x in summary.get('x_values', [])[:4])}**.\n"
            f"• Comparing performance across these segments indicates substantial variation in `{y_axis}`.\n"
            f"• Key business recommendation: Monitor high-performing segments to replicate operational drivers while examining lower performing categories for efficiency gains."
        )

    def _fallback_grounded_answer(self, query: str, intent: str, insights: List[Dict[str, Any]], schema: Dict[str, Any]) -> str:
        if top := insights[:2]:
            ins1 = top[0]
            answer = f"### Analytical Findings for: *\"{query}\"*\n\n"
            answer += f"**Key Observation**: {ins1.get('title')} — {ins1.get('message')}\n\n"
            answer += f"💡 **Business Recommendation**: {ins1.get('recommendation')}\n\n"

            if len(top) > 1:
                ins2 = top[1]
                answer += f"**Secondary Finding**: {ins2.get('title')} ({ins2.get('message')})\n"
            return answer
        else:
            num_cols = ", ".join(schema.get("numerical_columns", [])[:3])
            return (
                f"### Dataset Analysis Overview\n\n"
                f"The dataset contains **{schema.get('rows'):,} rows** and **{schema.get('columns')} columns**.\n"
                f"Key numerical metrics available for analysis include: `{num_cols}`.\n"
                f"To get specific insights, try asking about trends, top categories, or correlations between metrics."
            )

    def _fallback_visualization_spec(self, query: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        q_lower = query.lower()
        num_cols = schema.get("numerical_columns", ["Sales"])
        cat_cols = schema.get("categorical_columns", ["Region"])
        date_cols = schema.get("date_columns", ["Date"])

        x_axis = cat_cols[0] if cat_cols else (date_cols[0] if date_cols else "Index")
        y_axis = num_cols[0] if num_cols else "Count"
        chart_type = "bar"
        limit = None

        if "top 5" in q_lower or "top 5" in q_lower:
            limit = 5
        elif "top 10" in q_lower:
            limit = 10

        if "trend" in q_lower or "monthly" in q_lower or "over time" in q_lower:
            chart_type = "line"
            if date_cols:
                x_axis = date_cols[0]
        elif "share" in q_lower or "pie" in q_lower or "donut" in q_lower or "composition" in q_lower:
            chart_type = "donut"
        elif "vs" in q_lower or "scatter" in q_lower or "correlation" in q_lower:
            chart_type = "scatter"
            if len(num_cols) >= 2:
                x_axis = num_cols[0]
                y_axis = num_cols[1]
        elif "distribution" in q_lower or "histogram" in q_lower:
            chart_type = "histogram"

        # Check column mentions in query
        for c in num_cols:
            if c.lower() in q_lower:
                y_axis = c
                break

        for c in cat_cols + date_cols:
            if c.lower() in q_lower:
                x_axis = c
                break

        return {
            "type": chart_type,
            "title": f"{y_axis} by {x_axis}",
            "x_axis": x_axis,
            "y_axis": y_axis,
            "aggregation": "sum",
            "sort": "descending",
            "limit": limit
        }
