from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_serializer
from typing import List, Optional
from datetime import datetime
from core.database import get_db
from models.order import Order

router = APIRouter(prefix="/api/orders", tags=["orders"])


class OrderCreate(BaseModel):
    """Schema for creating an order"""
    order_number: str
    customer_name: str
    customer_email: str
    total_amount: float
    status: str = "pending"
    item_count: int = 0


class OrderUpdate(BaseModel):
    """Schema for updating an order"""
    order_number: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None
    item_count: Optional[int] = None


class OrderResponse(BaseModel):
    """Schema for order response"""
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    total_amount: float
    status: str
    item_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        return dt.isoformat()

    class Config:
        from_attributes = True


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all orders with optional filtering by status"""
    query = db.query(Order)

    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    db_order = Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order: OrderUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing order"""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = order.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)

    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order"""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}
