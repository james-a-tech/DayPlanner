from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
from typing import List
from app.models.schemas import TimeSlot, TimeSlotCreate, SuccessResponse
from app.utils.database import Database, TIME_SLOTS_COLLECTION
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/time-slots", tags=["time-slots"])


@router.post("", response_model=SuccessResponse)
async def create_time_slot(
    slot_data: TimeSlotCreate,
    current_user: str = Depends(get_current_user)
):
    """Create a new time slot template"""
    db = Database.get_db()
    slots = db[TIME_SLOTS_COLLECTION]
    
    slot_doc = {
        "userId": current_user,
        "name": slot_data.name,
        "startTime": slot_data.startTime,
        "endTime": slot_data.endTime,
        "duration": slot_data.duration if hasattr(slot_data, 'duration') else None,
        "color": slot_data.color,
        "isFixed": slot_data.isFixed,
        "daysOfWeek": slot_data.daysOfWeek,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = slots.insert_one(slot_doc)
    slot_doc["_id"] = str(result.inserted_id)
    
    return {
        "success": True,
        "data": slot_doc
    }


@router.get("", response_model=SuccessResponse)
async def get_time_slots(current_user: str = Depends(get_current_user)):
    """Get all time slots for current user"""
    db = Database.get_db()
    slots = db[TIME_SLOTS_COLLECTION]
    
    user_slots = list(slots.find({"userId": current_user}))
    
    # Convert ObjectId to string
    for slot in user_slots:
        slot["_id"] = str(slot["_id"])
    
    return {
        "success": True,
        "data": user_slots
    }


@router.put("/{slot_id}", response_model=SuccessResponse)
async def update_time_slot(
    slot_id: str,
    slot_data: TimeSlotCreate,
    current_user: str = Depends(get_current_user)
):
    """Update a time slot"""
    db = Database.get_db()
    slots = db[TIME_SLOTS_COLLECTION]
    
    try:
        slot_oid = ObjectId(slot_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid slot ID"
        )
    
    update_data = slot_data.model_dump()
    # ensure duration is included if provided (model_dump will include it when present)
    update_data["updatedAt"] = datetime.utcnow()
    
    result = slots.find_one_and_update(
        {"_id": slot_oid, "userId": current_user},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time slot not found"
        )
    
    result["_id"] = str(result["_id"])
    return {
        "success": True,
        "data": result
    }


@router.delete("/{slot_id}", response_model=SuccessResponse)
async def delete_time_slot(
    slot_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete a time slot"""
    db = Database.get_db()
    slots = db[TIME_SLOTS_COLLECTION]
    
    try:
        slot_oid = ObjectId(slot_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid slot ID"
        )
    
    result = slots.find_one_and_delete({
        "_id": slot_oid,
        "userId": current_user
    })
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time slot not found"
        )
    
    return {
        "success": True,
        "data": {"message": "Time slot deleted"}
    }
