from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_to_mongo, close_mongo_connection, get_database
from routes import auth, admin, user
from config import settings
from utils.auth import get_password_hash
from datetime import datetime


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await create_default_admin()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="Personal Funds Management API",
    description="API for managing personal funds with deposits, interest calculation, and withdrawals",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(user.router)


@app.get("/")
async def root():
    return {
        "message": "Personal Funds Management API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


async def create_default_admin():
    """
    Create default admin account if it doesn't exist.
    """
    db = get_database()
    
    # Check if admin already exists
    admin_exists = await db.users.find_one({"username": settings.default_admin_username})
    
    if not admin_exists:
        admin_doc = {
            "username": settings.default_admin_username,
            "email": settings.default_admin_email,
            "password_hash": get_password_hash(settings.default_admin_password),
            "role": "admin",
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        await db.users.insert_one(admin_doc)
        print(f"✅ Default admin account created:")
        print(f"   Username: {settings.default_admin_username}")
        print(f"   Password: {settings.default_admin_password}")
        print(f"   ⚠️  Please change the password in production!")
    else:
        print(f"ℹ️  Admin account already exists: {settings.default_admin_username}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
