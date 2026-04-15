"""
Insight Feedback Model
Tracks user feedback on AI-generated insights
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from core.database import Base


class InsightFeedback(Base):
    """Database model for insight feedback"""
    __tablename__ = "insight_feedback"

    id = Column(Integer, primary_key=True, index=True)
    insight_id = Column(String(255), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # Optional: track which user
    is_helpful = Column(Boolean, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
