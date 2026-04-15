"""
AI Insights Service
Generates sales forecasting insights using rule-based logic with caching
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models.order import Order
from models.product import Product
from models.customer import Customer
from models.insight import InsightFeedback
import json
import hashlib


class AIInsightsService:
    """Service for generating AI-powered business insights"""

    # Cache for insights (5-minute TTL)
    _cache = {}
    _cache_timestamp = None
    _cache_ttl = timedelta(minutes=5)

    @staticmethod
    def _generate_cache_key() -> str:
        """Generate a cache key based on time period"""
        now = datetime.now()
        # Create a key that changes every 5 minutes
        time_bucket = int(now.timestamp() // 300)  # 300 seconds = 5 minutes
        return f"insights_{time_bucket}"

    @staticmethod
    def _generate_sales_forecast_insights(db: Session) -> list:
        """
        Generate sales forecasting insights using rule-based logic

        Returns a list of insight dictionaries with:
        - id: Unique identifier
        - type: "sales" or "product"
        - title: Short headline
        - description: Full explanation
        - severity: "info", "warning", "critical"
        - trend: "growing", "stable", "declining"
        - value: Numeric value (if applicable)
        - change_percent: Growth percentage
        """
        insights = []
        now = datetime.now()

        # Time periods
        last_7_days = now - timedelta(days=7)
        previous_7_days = now - timedelta(days=14)

        # Get order data for current and previous periods
        current_orders = (
            db.query(Order)
            .filter(Order.created_at >= last_7_days)
            .all()
        )

        previous_orders = (
            db.query(Order)
            .filter(
                and_(
                    Order.created_at >= previous_7_days,
                    Order.created_at < last_7_days
                )
            )
            .all()
        )

        # Calculate metrics
        current_revenue = sum(o.total_amount or 0 for o in current_orders)
        previous_revenue = sum(o.total_amount or 0 for o in previous_orders)
        current_order_count = len(current_orders)
        previous_order_count = len(previous_orders)

        # Calculate growth rates
        revenue_growth = 0.0
        if previous_revenue > 0:
            revenue_growth = ((current_revenue - previous_revenue) / previous_revenue) * 100

        order_growth = 0.0
        if previous_order_count > 0:
            order_growth = ((current_order_count - previous_order_count) / previous_order_count) * 100

        # Generate revenue trend insight
        if revenue_growth > 10:
            trend = "growing"
            severity = "info"
            title = "📈 Revenue Growing Strongly"
            description = f"Your revenue is up {revenue_growth:.1f}% compared to the previous 7 days. This positive trend indicates strong sales performance."
        elif revenue_growth < -10:
            trend = "declining"
            severity = "warning"
            title = "📉 Revenue Declining"
            description = f"Your revenue is down {abs(revenue_growth):.1f}% compared to the previous 7 days. Consider reviewing your pricing strategy or marketing efforts."
        else:
            trend = "stable"
            severity = "info"
            title = "➡️ Revenue Stable"
            description = f"Your revenue is relatively stable ({revenue_growth:+.1f}% change). Continue monitoring for trends."

        insights.append({
            "id": hashlib.md5(f"revenue_trend_{now.date()}".encode()).hexdigest()[:16],
            "type": "sales",
            "title": title,
            "description": description,
            "severity": severity,
            "trend": trend,
            "value": current_revenue,
            "change_percent": round(revenue_growth, 2)
        })

        # Generate order volume insight
        if order_growth > 10:
            order_trend = "growing"
            order_severity = "info"
            order_title = "📦 Order Volume Increasing"
            order_desc = f"You're receiving {order_growth:.1f}% more orders. Great job on customer acquisition!"
        elif order_growth < -10:
            order_trend = "declining"
            order_severity = "warning"
            order_title = "📦 Order Volume Decreasing"
            order_desc = f"Order volume is down {abs(order_growth):.1f}%. Consider launching promotions to boost sales."
        else:
            order_trend = "stable"
            order_severity = "info"
            order_title = "📦 Order Volume Stable"
            order_desc = f"Order volume is steady ({order_growth:+.1f}% change). Maintain your current marketing efforts."

        insights.append({
            "id": hashlib.md5(f"order_volume_{now.date()}".encode()).hexdigest()[:16],
            "type": "sales",
            "title": order_title,
            "description": order_desc,
            "severity": order_severity,
            "trend": order_trend,
            "value": current_order_count,
            "change_percent": round(order_growth, 2)
        })

        # Generate forecast for next 7 days (simple projection)
        if trend == "growing":
            forecast_growth = revenue_growth * 0.8  # Conservative estimate
            forecast_revenue = current_revenue * (1 + forecast_growth / 100)
            forecast_title = "🔮 Positive Forecast"
            forecast_desc = f"Based on current trends, expect revenue to grow by ~{forecast_growth:.1f}% next week."
        elif trend == "declining":
            forecast_growth = revenue_growth * 0.8
            forecast_revenue = current_revenue * (1 + forecast_growth / 100)
            forecast_title = "⚠️ Conservative Forecast"
            forecast_desc = f"Based on current trends, revenue may decline by ~{abs(forecast_growth):.1f}% next week. Consider action."
        else:
            forecast_growth = 0
            forecast_revenue = current_revenue
            forecast_title = "🔮 Stable Forecast"
            forecast_desc = f"Expect revenue to remain stable next week (~${forecast_revenue:.0f})."

        insights.append({
            "id": hashlib.md5(f"forecast_{now.date()}".encode()).hexdigest()[:16],
            "type": "sales",
            "title": forecast_title,
            "description": forecast_desc,
            "severity": "info",
            "trend": trend,
            "value": forecast_revenue,
            "change_percent": round(forecast_growth, 2)
        })

        # Product insights - low stock alerts
        low_stock_products = (
            db.query(Product)
            .filter(Product.stock_quantity < 10)
            .filter(Product.is_active == True)
            .all()
        )

        out_of_stock = [p for p in low_stock_products if p.stock_quantity == 0]
        low_stock = [p for p in low_stock_products if 0 < p.stock_quantity < 10]

        if out_of_stock:
            insights.append({
                "id": hashlib.md5(f"out_of_stock_{now.date()}".encode()).hexdigest()[:16],
                "type": "product",
                "title": f"🚨 {len(out_of_stock)} Products Out of Stock",
                "description": f"Urgent: {len(out_of_stock)} products are out of stock. Reorder immediately to avoid lost sales.",
                "severity": "critical",
                "trend": "declining",
                "value": len(out_of_stock),
                "change_percent": 0
            })

        if low_stock:
            product_names = ", ".join([p.name for p in low_stock[:3]])
            if len(low_stock) > 3:
                product_names += f" and {len(low_stock) - 3} more"

            insights.append({
                "id": hashlib.md5(f"low_stock_{now.date()}".encode()).hexdigest()[:16],
                "type": "product",
                "title": f"⚠️ {len(low_stock)} Products Low on Stock",
                "description": f"Products running low: {product_names}. Consider reordering soon.",
                "severity": "warning",
                "trend": "stable",
                "value": len(low_stock),
                "change_percent": 0
            })

        # Top performing products
        top_products = (
            db.query(Product)
            .filter(Product.is_active == True)
            .order_by(Product.price.desc())
            .limit(5)
            .all()
        )

        if top_products:
            top_value = sum(p.price for p in top_products)
            insights.append({
                "id": hashlib.md5(f"top_products_{now.date()}".encode()).hexdigest()[:16],
                "type": "product",
                "title": f"⭐ Top {len(top_products)} Premium Products",
                "description": f"Your highest-priced products total ${top_value:.0f} in value. Focus marketing on these items.",
                "severity": "info",
                "trend": "growing",
                "value": top_value,
                "change_percent": 0
            })

        return insights

    @staticmethod
    def get_all_insights(db: Session) -> list:
        """
        Get all insights with 5-minute cache

        Returns a list of insight objects with helpfulness ratings
        """
        cache_key = AIInsightsService._generate_cache_key()
        now = datetime.now()

        # Check cache
        if (AIInsightsService._cache_timestamp and
            (now - AIInsightsService._cache_timestamp) < AIInsightsService._cache_ttl and
            cache_key in AIInsightsService._cache):

            return AIInsightsService._cache[cache_key]

        # Generate new insights
        insights = AIInsightsService._generate_sales_forecast_insights(db)

        # Add helpfulness ratings for each insight
        for insight in insights:
            # Get feedback stats for this insight
            positive_count = (
                db.query(InsightFeedback)
                .filter(
                    and_(
                        InsightFeedback.insight_id == insight["id"],
                        InsightFeedback.is_helpful == True
                    )
                )
                .count()
            )

            total_count = (
                db.query(InsightFeedback)
                .filter(InsightFeedback.insight_id == insight["id"])
                .count()
            )

            helpful_percentage = 0
            if total_count > 0:
                helpful_percentage = int((positive_count / total_count) * 100)

            insight["helpful_percentage"] = helpful_percentage
            insight["total_feedback"] = total_count

        # Update cache
        AIInsightsService._cache[cache_key] = insights
        AIInsightsService._cache_timestamp = now

        return insights

    @staticmethod
    def mark_insight_feedback(
        insight_id: str,
        is_helpful: bool,
        user_id: int = None,
        db: Session = None
    ) -> dict:
        """
        Record user feedback for an insight

        Args:
            insight_id: The ID of the insight
            is_helpful: Whether the user found it helpful
            user_id: Optional user ID
            db: Database session

        Returns:
            Dict with success status and updated helpfulness percentage
        """
        if not db:
            return {"success": False, "error": "Database session required"}

        # Create feedback record
        feedback = InsightFeedback(
            insight_id=insight_id,
            user_id=user_id,
            is_helpful=is_helpful
        )

        db.add(feedback)
        db.commit()

        # Calculate updated helpfulness percentage
        positive_count = (
            db.query(InsightFeedback)
            .filter(
                and_(
                    InsightFeedback.insight_id == insight_id,
                    InsightFeedback.is_helpful == True
                )
            )
            .count()
        )

        total_count = (
            db.query(InsightFeedback)
            .filter(InsightFeedback.insight_id == insight_id)
            .count()
        )

        helpful_percentage = 0
        if total_count > 0:
            helpful_percentage = int((positive_count / total_count) * 100)

        return {
            "success": True,
            "helpful_percentage": helpful_percentage,
            "total_feedback": total_count
        }
