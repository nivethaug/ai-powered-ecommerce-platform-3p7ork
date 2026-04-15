from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from core.database import Base


class Order(Base):
    """Order model for ecommerce platform"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    item_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
