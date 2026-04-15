"""
AI Insights Routes
API endpoints for AI-generated business insights and forecasting
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from core.database import get_db
from services.ai_insights_service import AIInsightsService


router = APIRouter(prefix="/api/ai-insights", tags=["ai-insights"])


class InsightData(BaseModel):
    """Single insight data model"""
    id: str
    type: str
    title: str
    description: str
    severity: str
    trend: str
    value: Optional[float] = None
    change_percent: float
    helpful_percentage: int
    total_feedback: int


class InsightsResponse(BaseModel):
    """Response model for insights list"""
    insights: list[InsightData]
    total_count: int
    generated_at: str


class FeedbackRequest(BaseModel):
    """Request model for feedback submission"""
    is_helpful: bool
    user_id: Optional[int] = None


class FeedbackResponse(BaseModel):
    """Response model for feedback submission"""
    success: bool
    helpful_percentage: int
    total_feedback: int
    message: str


@router.get("/", response_model=InsightsResponse)
async def get_all_insights(
    db: Session = Depends(get_db)
):
    """
    Get all AI-generated insights (cached for 5 minutes)

    Returns:
    - List of insights with sales forecasts and product alerts
    - Each insight includes helpfulness ratings from users
    - Insights are cached for 5 minutes for performance
    """
    try:
        from datetime import datetime

        insights = AIInsightsService.get_all_insights(db)

        return InsightsResponse(
            insights=insights,
            total_count=len(insights),
            generated_at=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{insight_id}/feedback", response_model=FeedbackResponse)
async def submit_insight_feedback(
    insight_id: str,
    feedback: FeedbackRequest,
    db: Session = Depends(get_db)
):
    """
    Submit feedback for an insight (helpful/not helpful)

    Parameters:
    - insight_id: The ID of the insight
    - is_helpful: Whether the user found it helpful
    - user_id: Optional user ID for tracking

    Returns:
    - Updated helpfulness percentage
    - Total feedback count
    """
    try:
        result = AIInsightsService.mark_insight_feedback(
            insight_id=insight_id,
            is_helpful=feedback.is_helpful,
            user_id=feedback.user_id,
            db=db
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        return FeedbackResponse(
            success=True,
            helpful_percentage=result["helpful_percentage"],
            total_feedback=result["total_feedback"],
            message="Feedback recorded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
