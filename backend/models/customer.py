from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from core.database import Base


class Customer(Base):
    """Customer database model."""
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50))
    location = Column(String(255))
    avatar = Column(String(500))
    joined_date = Column(DateTime, server_default=func.now())
    total_orders = Column(Integer, default=0)
    total_spent = Column(Float, default=0.0)
    status = Column(String(20), default="active")  # active, inactive, vip
    last_order_date = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
