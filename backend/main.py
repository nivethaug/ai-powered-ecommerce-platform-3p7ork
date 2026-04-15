"""
DreamPilot Backend - Main Application

A simple FastAPI backend with authentication.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager

from core.config import settings
from core.database import init_db, SessionLocal
from services.auth_service import AuthService
from models.order import Order
from models.customer import Customer
from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import router as orders_router
from routes.customers import router as customers_router
from routes.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - initialize on startup."""
    # Create database tables
    print("🔧 Initializing database...")
    init_db()
    print("✓ Database tables created")

    # Ensure default user exists
    print("🔧 Ensuring default user...")
    db = SessionLocal()
    try:
        AuthService.ensure_default_user(db)

        # Seed sample orders if none exist
        existing_orders = db.query(Order).count()
        if existing_orders == 0:
            print("🔧 Seeding sample orders...")
            sample_orders = [
                Order(
                    order_number="ORD-001",
                    customer_name="John Smith",
                    customer_email="john.smith@email.com",
                    total_amount=234.97,
                    status="pending",
                    item_count=3
                ),
                Order(
                    order_number="ORD-002",
                    customer_name="Sarah Johnson",
                    customer_email="sarah.j@email.com",
                    total_amount=89.99,
                    status="processing",
                    item_count=1
                ),
                Order(
                    order_number="ORD-003",
                    customer_name="Michael Brown",
                    customer_email="mbrown@email.com",
                    total_amount=456.50,
                    status="shipped",
                    item_count=5
                ),
                Order(
                    order_number="ORD-004",
                    customer_name="Emily Davis",
                    customer_email="emily.d@email.com",
                    total_amount=123.75,
                    status="delivered",
                    item_count=2
                ),
                Order(
                    order_number="ORD-005",
                    customer_name="David Wilson",
                    customer_email="dwilson@email.com",
                    total_amount=67.99,
                    status="cancelled",
                    item_count=1
                ),
            ]
            for order in sample_orders:
                db.add(order)
            db.commit()
            print("✓ Seeded 5 sample orders")

        # Seed sample customers if none exist
        existing_customers = db.query(Customer).count()
        if existing_customers == 0:
            print("🔧 Seeding sample customers...")
            from datetime import datetime
            sample_customers = [
                Customer(
                    name="John Smith",
                    email="john.smith@email.com",
                    phone="+1 (555) 123-4567",
                    location="New York, USA",
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John",
                    total_orders=24,
                    total_spent=3456.78,
                    status="vip",
                    last_order_date=datetime(2024, 3, 10)
                ),
                Customer(
                    name="Sarah Johnson",
                    email="sarah.j@email.com",
                    phone="+1 (555) 987-6543",
                    location="Los Angeles, USA",
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                    total_orders=12,
                    total_spent=1234.56,
                    status="active",
                    last_order_date=datetime(2024, 3, 14)
                ),
                Customer(
                    name="Michael Brown",
                    email="mbrown@email.com",
                    phone="+1 (555) 456-7890",
                    location="Chicago, USA",
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
                    total_orders=8,
                    total_spent=890.32,
                    status="active",
                    last_order_date=datetime(2024, 3, 12)
                ),
                Customer(
                    name="Emily Davis",
                    email="emily.d@email.com",
                    phone="+1 (555) 234-5678",
                    location="Houston, USA",
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
                    total_orders=3,
                    total_spent=234.50,
                    status="inactive",
                    last_order_date=datetime(2024, 1, 20)
                ),
                Customer(
                    name="David Wilson",
                    email="dwilson@email.com",
                    phone="+1 (555) 345-6789",
                    location="Phoenix, USA",
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=David",
                    total_orders=18,
                    total_spent=2100.89,
                    status="vip",
                    last_order_date=datetime(2024, 3, 15)
                ),
            ]
            for customer in sample_customers:
                db.add(customer)
            db.commit()
            print("✓ Seeded 5 sample customers")
    finally:
        db.close()

    print(f"🚀 {settings.PROJECT_NAME} is ready!")
    yield


# Create FastAPI app (Swagger/OpenAPI enabled)
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-powered-ecommerce-platform-3p7ork.dreambigwithai.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(customers_router)
app.include_router(auth_router)
app.include_router(analytics_router)


@app.get("/swagger", include_in_schema=False)
async def swagger_redirect():
    """Redirect /swagger to FastAPI Swagger UI."""
    return RedirectResponse(url="/docs")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "DreamPilot API",
        "project": settings.PROJECT_NAME,
        "swagger": "/swagger",
        "docs": "/docs",
        "redoc": "/redoc"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
