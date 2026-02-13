from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from app.models.schemas import (
    UserRegister, UserLogin, LoginResponse, SuccessResponse, ErrorResponse
)
from app.utils.auth import get_password_hash, verify_password, create_access_token
from app.utils.database import Database, USERS_COLLECTION

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=LoginResponse)
async def register(user: UserRegister):
    """Register a new user"""
    db = Database.get_db()
    users = db[USERS_COLLECTION]
    
    # Check if user exists
    if users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "googleCalendarSync": False,
        "timezone": "UTC"
    }
    
    result = users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_access_token({"sub": user_id})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": user_id,
                "name": user.name,
                "email": user.email
            },
            "token": token
        }
    }


@router.post("/login", response_model=LoginResponse)
async def login(credentials: UserLogin):
    """Login user"""
    db = Database.get_db()
    users = db[USERS_COLLECTION]
    
    user = users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": user_id,
                "name": user["name"],
                "email": user["email"]
            },
            "token": token
        }
    }


@router.post("/google/callback", response_model=LoginResponse)
async def google_callback(data: dict):
    """Google OAuth callback"""
    db = Database.get_db()
    users = db[USERS_COLLECTION]
    
    google_id = data.get("googleId")
    email = data.get("email")
    name = data.get("name")
    
    # Find or create user
    user = users.find_one({
        "$or": [{"googleId": google_id}, {"email": email}]
    })
    
    if not user:
        user_doc = {
            "name": name,
            "email": email,
            "googleId": google_id,
            "googleCalendarSync": True,
            "timezone": "UTC"
        }
        result = users.insert_one(user_doc)
        user_id = str(result.inserted_id)
    else:
        user_id = str(user["_id"])
        if not user.get("googleId"):
            users.update_one(
                {"_id": user["_id"]},
                {"$set": {"googleId": google_id, "googleCalendarSync": True}}
            )
    
    token = create_access_token({"sub": user_id})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": user_id,
                "name": name,
                "email": email
            },
            "token": token
        }
    }
