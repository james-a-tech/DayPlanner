from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Import routes
from app.routes import auth, tasks, time_slots, reports
from app.utils.database import Database

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Day Planner API",
    description="A comprehensive task planning and time management application",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(time_slots.router)
app.include_router(reports.router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Day Planner API",
        "version": "1.0.0"
    }

# Startup event
@app.on_event("startup")
async def startup():
    """Connect to database on startup"""
    try:
        Database.connect_db()
        print("✓ Connected to MongoDB")
        
        # Create demo user if it doesn't exist
        from app.utils.database import USERS_COLLECTION
        from app.utils.auth import get_password_hash
        
        db = Database.get_db()
        if db is not None:
            users = db[USERS_COLLECTION]
            demo_user = users.find_one({"email": "demo@example.com"})
            if not demo_user:
                demo_user_doc = {
                    "name": "Demo User",
                    "email": "demo@example.com", 
                    "password": get_password_hash("demo123"),
                    "googleCalendarSync": False,
                    "timezone": "UTC"
                }
                users.insert_one(demo_user_doc)
                print("✓ Created demo user (demo@example.com / demo123)")
            else:
                print("✓ Demo user already exists")
    except Exception as e:
        print(f"⚠ MongoDB not available: {e}")
        print("⚠ App started without database. Database connection will be attempted on first use.")

# Shutdown event
@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    try:
        Database.close_db()
        print("✓ Disconnected from MongoDB")
    except Exception as e:
        print(f"⚠ Error closing MongoDB connection: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
