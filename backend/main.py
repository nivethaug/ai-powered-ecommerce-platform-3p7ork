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
from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import router as orders_router


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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(auth_router)


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
