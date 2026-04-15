"""
Analytics Routes
API endpoints for analytics metrics and charts
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from core.database import get_db
from services.analytics_service import AnalyticsService


router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class OverviewResponse(BaseModel):
    """Response model for overview metrics"""
    total_revenue: float
    total_orders: int
    total_customers: int
    conversion_rate: float
    average_order_value: float
    revenue_growth: float
    orders_growth: float
    customers_growth: float


class ChartDataPoint(BaseModel):
    """Single data point for charts"""
    label: str
    value: float


class ChartDataResponse(BaseModel):
    """Response model for chart data"""
    data: list[ChartDataPoint]


@router.get("/overview", response_model=OverviewResponse)
async def get_analytics_overview(
    period: str = Query("7d", description="Time period: 7d, 30d, 90d, 1y"),
    db: Session = Depends(get_db)
):
    """
    Get key metrics: revenue, orders, customers, AOV, growth rates

    Parameters:
    - period: Time period for metrics (7d, 30d, 90d, 1y)

    Returns:
    - total_revenue: Total revenue for the period
    - total_orders: Number of orders in the period
    - total_customers: Total customers in database
    - conversion_rate: Orders per customer percentage
    - average_order_value: Average order amount
    - revenue_growth: Revenue growth vs previous period (%)
    - orders_growth: Orders growth vs previous period (%)
    - customers_growth: Customers growth vs previous period (%)
    """
    metrics = AnalyticsService.get_overview_metrics(db, period)
    return OverviewResponse(**metrics)


@router.get("/revenue-by-period", response_model=ChartDataResponse)
async def get_revenue_by_period(
    period: str = Query("7d", description="Time period: 7d, 30d, 90d, 1y"),
    db: Session = Depends(get_db)
):
    """
    Get revenue data grouped by time period (day/week/month)

    Parameters:
    - period: Time period for chart (7d, 30d, 90d, 1y)

    Returns:
    - data: Array of {label, value} objects for chart
    """
    data = AnalyticsService.get_revenue_by_period(db, period)
    return ChartDataResponse(data=data)


@router.get("/orders-by-period", response_model=ChartDataResponse)
async def get_orders_by_period(
    period: str = Query("7d", description="Time period: 7d, 30d, 90d, 1y"),
    db: Session = Depends(get_db)
):
    """
    Get orders data grouped by time period (day/week/month)

    Parameters:
    - period: Time period for chart (7d, 30d, 90d, 1y)

    Returns:
    - data: Array of {label, value} objects for chart
    """
    data = AnalyticsService.get_orders_by_period(db, period)
    return ChartDataResponse(data=data)


@router.get("/revenue-by-category", response_model=ChartDataResponse)
async def get_revenue_by_category(
    period: str = Query("7d", description="Time period: 7d, 30d, 90d, 1y"),
    db: Session = Depends(get_db)
):
    """
    Get revenue breakdown by product category

    Parameters:
    - period: Time period for analysis (7d, 30d, 90d, 1y)

    Returns:
    - data: Array of {label, value} objects for chart
    """
    data = AnalyticsService.get_revenue_by_category(db, period)
    return ChartDataResponse(data=data)
