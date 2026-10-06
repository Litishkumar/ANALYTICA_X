"""
AnalyticaX FastAPI Backend Server
Main API gateway connecting Data Processing, EDA Engine, Insight Generator, Intent Classifier, BI Orchestrator, and Gemini LLM Client.
"""

import os
import pandas as pd
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data_loader import DataLoader
from data_profiler import DataProfiler
from eda_engine import EDAEngine
from insight_generator import InsightGenerator
from intent_classifier import IntentClassifier
from relevance_scorer import InsightRelevanceScorer
from bi_orchestrator import BIOrchestrator
from llm_client import LLMClient

app = FastAPI(
    title="AnalyticaX Platform API",
    description="Conversational Data Science & Business Intelligence Backend API",
    version="1.0.0"
)

# Enable CORS for local React Frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Session / State Cache (supports active dataset analysis)
class StateCache:
    current_df: Optional[pd.DataFrame] = None
    filename: str = "sales_data.csv"
    preview_info: Dict[str, Any] = {}
    profiling_info: Dict[str, Any] = {}
    eda_results: Dict[str, Any] = {}
    insights: List[Dict[str, Any]] = []

state = StateCache()
llm = LLMClient()

# Request Models
class SampleLoadRequest(BaseModel):
    sample_name: str

class ChatRequest(BaseModel):
    query: str

class ConversationalBIRequest(BaseModel):
    query: str

class ChartQARequest(BaseModel):
    query: str
    chart_info: Dict[str, Any]

@app.on_event("startup")
def startup_event():
    """Load default sample dataset on launch"""
    try:
        df, filename = DataLoader.load_sample("sales_data.csv")
        _update_active_dataset(df, filename)
    except Exception as e:
        print(f"Startup data load warning: {e}")

def _update_active_dataset(df: pd.DataFrame, filename: str):
    state.current_df = df
    state.filename = filename

    # 1. Preview Info
    state.preview_info = DataLoader.get_preview_info(df, filename)

    # 2. Data Profiling & Quality Score
    profiler = DataProfiler(df)
    state.profiling_info = profiler.run_profiling()

    # 3. EDA Engine Analysis
    eda = EDAEngine(df)
    state.eda_results = eda.run_full_eda()

    # 4. Structured Insight Generation
    ig = InsightGenerator(state.eda_results)
    state.insights = ig.generate_insights()

@app.get("/")
def read_root():
    return {"status": "ok", "app": "AnalyticaX Backend API", "active_dataset": state.filename}

@app.get("/api/sample-datasets")
def get_sample_datasets():
    return {"datasets": DataLoader.list_sample_datasets()}

@app.post("/api/load-sample")
def load_sample_dataset(req: SampleLoadRequest):
    try:
        df, filename = DataLoader.load_sample(req.sample_name)
        _update_active_dataset(df, filename)
        return {
            "message": f"Successfully loaded {filename}",
            "filename": filename,
            "preview": state.preview_info,
            "profiling": state.profiling_info
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = DataLoader.load_from_bytes(contents, file.filename)
        _update_active_dataset(df, file.filename)
        return {
            "message": f"Successfully uploaded {file.filename}",
            "filename": file.filename,
            "preview": state.preview_info,
            "profiling": state.profiling_info
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process dataset file: {str(e)}")

@app.get("/api/profile")
def get_profiling():
    if state.current_df is None:
        raise HTTPException(status_code=404, detail="No active dataset uploaded.")
    return {
        "filename": state.filename,
        "preview": state.preview_info,
        "profiling": state.profiling_info
    }

@app.get("/api/eda")
def get_eda():
    if state.current_df is None:
        raise HTTPException(status_code=404, detail="No active dataset uploaded.")
    return {
        "filename": state.filename,
        "eda": state.eda_results
    }

@app.get("/api/insights")
def get_insights():
    if state.current_df is None:
        raise HTTPException(status_code=404, detail="No active dataset uploaded.")
    return {
        "filename": state.filename,
        "total_insights": len(state.insights),
        "insights": state.insights
    }

@app.post("/api/chat")
def conversational_analytics(req: ChatRequest):
    if state.current_df is None:
        raise HTTPException(status_code=404, detail="No active dataset uploaded.")

    cols = state.current_df.columns.tolist()
    classifier = IntentClassifier(cols)
    intent_info = classifier.classify(req.query)

    # Rank insights by question relevance (0.0 to 1.0)
    ranked_insights = InsightRelevanceScorer.rank_insights(req.query, intent_info, state.insights)
    top_insights = ranked_insights[:4]

    # Grounded answer generation via Gemini / LLM client
    schema_summary = {
        "rows": len(state.current_df),
        "columns": len(cols),
        "numerical_columns": state.preview_info.get("numerical_columns", []),
        "categorical_columns": state.preview_info.get("categorical_columns", []),
        "date_columns": state.preview_info.get("date_columns", [])
    }

    ai_answer = llm.generate_grounded_answer(
        query=req.query,
        intent_info=intent_info,
        top_insights=top_insights,
        schema_summary=schema_summary
    )

    # If intent suggests a chart request, include chart spec
    optional_chart = None
    if intent_info.get("intent") in ["visualization", "trend_analysis", "comparison"]:
        spec = llm.plan_visualization_spec(req.query, schema_summary)
        orchestrator = BIOrchestrator(state.current_df)
        optional_chart = orchestrator.build_chart_from_spec(spec)

    return {
        "query": req.query,
        "intent": intent_info.get("intent"),
        "entities": intent_info.get("entities"),
        "answer": ai_answer,
        "relevant_insights": top_insights,
        "optional_chart": optional_chart
    }

@app.post("/api/conversational-bi")
def conversational_bi(req: ConversationalBIRequest):
    if state.current_df is None:
        raise HTTPException(status_code=404, detail="No active dataset uploaded.")

    cols = state.current_df.columns.tolist()
    schema_summary = {
        "rows": len(state.current_df),
        "columns": len(cols),
        "numerical_columns": state.preview_info.get("numerical_columns", []),
        "categorical_columns": state.preview_info.get("categorical_columns", []),
        "date_columns": state.preview_info.get("date_columns", [])
    }

    # 1. Gemini visualization spec planning
    spec = llm.plan_visualization_spec(req.query, schema_summary)

    # 2. BI Orchestrator validation & Plotly generation
    orchestrator = BIOrchestrator(state.current_df)
    chart_result = orchestrator.build_chart_from_spec(spec)

    return {
        "query": req.query,
        "specification": spec,
        "chart": chart_result
    }

@app.get("/api/auto-dashboard")
def get_auto_dashboard():
    if state.current_df is None:
        raise HTTPException(status_code=404, detail="No active dataset uploaded.")

    orchestrator = BIOrchestrator(state.current_df)
    return orchestrator.generate_auto_dashboard_specs()

@app.post("/api/chart-qa")
def chart_qa(req: ChartQARequest):
    if state.current_df is None:
        raise HTTPException(status_code=404, detail="No active dataset uploaded.")

    schema_summary = {
        "rows": len(state.current_df),
        "columns": len(state.current_df.columns),
        "numerical_columns": state.preview_info.get("numerical_columns", []),
        "categorical_columns": state.preview_info.get("categorical_columns", [])
    }

    answer = llm.explain_chart_context(req.query, req.chart_info, schema_summary)
    return {
        "query": req.query,
        "answer": answer
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
