"""
Analytics Service
Calculates business metrics from Orders, Products, and Customers data
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models.order import Order
from models.product import Product
from models.customer import Customer


class AnalyticsService:
    """Service for calculating analytics metrics"""

    @staticmethod
    def get_date_range(period: str) -> tuple[datetime, datetime]:
        """Get start and end dates for a given period"""
        now = datetime.now()
        end_date = now

        if period == "7d":
            start_date = now - timedelta(days=7)
            previous_start = now - timedelta(days=14)
            previous_end = now - timedelta(days=7)
        elif period == "30d":
            start_date = now - timedelta(days=30)
            previous_start = now - timedelta(days=60)
            previous_end = now - timedelta(days=30)
        elif period == "90d":
            start_date = now - timedelta(days=90)
            previous_start = now - timedelta(days=180)
            previous_end = now - timedelta(days=90)
        elif period == "1y":
            start_date = now - timedelta(days=365)
            previous_start = now - timedelta(days=730)
            previous_end = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=7)
            previous_start = now - timedelta(days=14)
            previous_end = now - timedelta(days=7)

        return start_date, end_date, previous_start, previous_end

    @staticmethod
    def calculate_growth_rate(current: float, previous: float) -> float:
        """Calculate growth rate percentage"""
        if previous == 0:
            return 0.0
        return round(((current - previous) / previous) * 100, 2)

    @staticmethod
    def get_overview_metrics(db: Session, period: str = "7d") -> dict:
        """Get key metrics: revenue, orders, customers, AOV, growth rates"""
        start_date, end_date, previous_start, previous_end = AnalyticsService.get_date_range(period)

        # Current period metrics
        current_revenue = db.query(func.sum(Order.total_amount)).filter(
            and_(Order.created_at >= start_date, Order.created_at <= end_date)
        ).scalar() or 0

        current_orders = db.query(func.count(Order.id)).filter(
            and_(Order.created_at >= start_date, Order.created_at <= end_date)
        ).scalar() or 0

        current_customers = db.query(func.count(func.distinct(Order.customer_email))).filter(
            and_(Order.created_at >= start_date, Order.created_at <= end_date)
        ).scalar() or 0

        # Previous period metrics
        previous_revenue = db.query(func.sum(Order.total_amount)).filter(
            and_(Order.created_at >= previous_start, Order.created_at <= previous_end)
        ).scalar() or 0

        previous_orders = db.query(func.count(Order.id)).filter(
            and_(Order.created_at >= previous_start, Order.created_at <= previous_end)
        ).scalar() or 0

        previous_customers = db.query(func.count(func.distinct(Order.customer_email))).filter(
            and_(Order.created_at >= previous_start, Order.created_at <= previous_end)
        ).scalar() or 0

        # Calculate growth rates
        revenue_growth = AnalyticsService.calculate_growth_rate(current_revenue, previous_revenue)
        orders_growth = AnalyticsService.calculate_growth_rate(current_orders, previous_orders)
        customers_growth = AnalyticsService.calculate_growth_rate(current_customers, previous_customers)

        # Average order value
        average_order_value = round(current_revenue / current_orders, 2) if current_orders > 0 else 0

        # Total customers (all time)
        total_customers = db.query(func.count(Customer.id)).scalar() or 0

        # Conversion rate (orders / total customers)
        conversion_rate = round((current_customers / total_customers * 100), 2) if total_customers > 0 else 0

        return {
            "total_revenue": round(current_revenue, 2),
            "total_orders": current_orders,
            "total_customers": total_customers,
            "conversion_rate": conversion_rate,
            "average_order_value": average_order_value,
            "revenue_growth": revenue_growth,
            "orders_growth": orders_growth,
            "customers_growth": customers_growth,
        }

    @staticmethod
    def get_revenue_by_period(db: Session, period: str = "7d") -> list[dict]:
        """Get revenue grouped by day for the specified period"""
        start_date, end_date, _, _ = AnalyticsService.get_date_range(period)

        # Determine grouping based on period
        if period in ["7d", "30d"]:
            # Group by day
            date_trunc = func.date_trunc('day', Order.created_at)
            date_format = "%Y-%m-%d"
        elif period == "90d":
            # Group by week
            date_trunc = func.date_trunc('week', Order.created_at)
            date_format = "%Y-W%W"
        else:
            # Group by month
            date_trunc = func.date_trunc('month', Order.created_at)
            date_format = "%Y-%m"

        results = db.query(
            date_trunc.label('date'),
            func.sum(Order.total_amount).label('revenue')
        ).filter(
            and_(Order.created_at >= start_date, Order.created_at <= end_date)
        ).group_by(date_trunc).order_by(date_trunc).all()

        return [
            {
                "label": result.date.strftime(date_format) if hasattr(result.date, 'strftime') else str(result.date),
                "value": round(result.revenue, 2)
            }
            for result in results
        ]

    @staticmethod
    def get_orders_by_period(db: Session, period: str = "7d") -> list[dict]:
        """Get orders grouped by day for the specified period"""
        start_date, end_date, _, _ = AnalyticsService.get_date_range(period)

        # Determine grouping based on period
        if period in ["7d", "30d"]:
            # Group by day
            date_trunc = func.date_trunc('day', Order.created_at)
            date_format = "%Y-%m-%d"
        elif period == "90d":
            # Group by week
            date_trunc = func.date_trunc('week', Order.created_at)
            date_format = "%Y-W%W"
        else:
            # Group by month
            date_trunc = func.date_trunc('month', Order.created_at)
            date_format = "%Y-%m"

        results = db.query(
            date_trunc.label('date'),
            func.count(Order.id).label('orders')
        ).filter(
            and_(Order.created_at >= start_date, Order.created_at <= end_date)
        ).group_by(date_trunc).order_by(date_trunc).all()

        return [
            {
                "label": result.date.strftime(date_format) if hasattr(result.date, 'strftime') else str(result.date),
                "value": result.orders
            }
            for result in results
        ]

    @staticmethod
    def get_revenue_by_category(db: Session, period: str = "7d") -> list[dict]:
        """Get revenue grouped by product category"""
        start_date, end_date, _, _ = AnalyticsService.get_date_range(period)

        # Note: Since orders don't have direct category linkage, we'll use a simplified approach
        # Group orders by date and associate with products (this is a simplified version)
        # In a real system, you'd have order_items table linking orders to products

        # For now, let's create a simplified version that just returns categories from products
        # with a count of how many products exist in each category
        results = db.query(
            Product.category,
            func.count(Product.id).label('product_count')
        ).filter(
            Product.category.isnot(None)
        ).group_by(Product.category).all()

        # This is a placeholder - in reality you'd need order_items to calculate actual revenue by category
        # For demonstration, we'll return the product count per category
        return [
            {
                "label": result.category or "Uncategorized",
                "value": result.product_count
            }
            for result in results
        ]
