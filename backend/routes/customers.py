from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, field_serializer
from datetime import datetime
from core.database import get_db
from models.customer import Customer


router = APIRouter(prefix="/api/customers", tags=["customers"])


class CustomerCreate(BaseModel):
    """Request schema for creating a customer."""
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    status: str = "active"


class CustomerUpdate(BaseModel):
    """Request schema for updating a customer."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    status: Optional[str] = None
    total_orders: Optional[int] = None
    total_spent: Optional[float] = None
    last_order_date: Optional[str] = None


class CustomerResponse(BaseModel):
    """Response schema for customer data."""
    id: int
    name: str
    email: str
    phone: Optional[str]
    location: Optional[str]
    avatar: Optional[str]
    joined_date: datetime
    total_orders: int
    total_spent: float
    status: str
    last_order_date: Optional[datetime]

    @field_serializer('joined_date', 'last_order_date')
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        """Convert datetime to ISO format string."""
        if dt is None:
            return None
        return dt.isoformat()

    class Config:
        from_attributes = True


@router.get("/", response_model=List[CustomerResponse])
def list_customers(
    status: Optional[str] = Query(None, description="Filter by status (active, inactive, vip)"),
    db: Session = Depends(get_db)
):
    """
    List all customers with optional status filtering.

    Args:
        status: Optional status filter
        db: Database session

    Returns:
        List of customers
    """
    query = db.query(Customer)

    if status:
        query = query.filter(Customer.status == status)

    customers = query.order_by(Customer.created_at.desc()).all()
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """
    Get a specific customer by ID.

    Args:
        customer_id: Customer ID
        db: Database session

    Returns:
        Customer data

    Raises:
        HTTPException: If customer not found
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    """
    Create a new customer.

    Args:
        customer_data: Customer creation data
        db: Database session

    Returns:
        Created customer
    """
    # Check if email already exists
    existing = db.query(Customer).filter(Customer.email == customer_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_customer = Customer(**customer_data.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing customer.

    Args:
        customer_id: Customer ID
        customer_data: Customer update data
        db: Database session

    Returns:
        Updated customer

    Raises:
        HTTPException: If customer not found
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Update fields that are provided
    update_data = customer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """
    Delete a customer.

    Args:
        customer_id: Customer ID
        db: Database session

    Raises:
        HTTPException: If customer not found
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()

    return None
