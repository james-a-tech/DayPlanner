from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from datetime import datetime
from typing import List
from app.models.schemas import (
    Task, TaskCreate, TaskUpdate, TaskComplete, 
    TaskStatus, SuccessResponse, ErrorResponse
)
from app.utils.database import Database, TASKS_COLLECTION
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=SuccessResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user)
):
    """Create a new task"""
    db = Database.get_db()
    tasks = db[TASKS_COLLECTION]
    
    task_doc = {
        "userId": current_user,
        "title": task_data.title,
        "description": task_data.description,
        "priority": task_data.priority,
        "status": TaskStatus.TODO,
        "duration": task_data.duration,
        "plannedStartTime": task_data.plannedStartTime,
        "plannedEndTime": task_data.plannedEndTime,
        "category": task_data.category,
        "timeSlotId": task_data.timeSlotId,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = tasks.insert_one(task_doc)
    task_doc["_id"] = str(result.inserted_id)
    
    return {
        "success": True,
        "data": task_doc
    }


@router.get("", response_model=SuccessResponse)
async def get_tasks(current_user: str = Depends(get_current_user)):
    """Get all tasks for current user"""
    db = Database.get_db()
    tasks = db[TASKS_COLLECTION]
    
    user_tasks = list(tasks.find(
        {"userId": current_user}
    ).sort("plannedStartTime", 1))
    
    # Convert ObjectId to string
    for task in user_tasks:
        task["_id"] = str(task["_id"])
    
    return {
        "success": True,
        "data": user_tasks
    }


@router.get("/{task_id}", response_model=SuccessResponse)
async def get_task(
    task_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get a specific task"""
    db = Database.get_db()
    tasks = db[TASKS_COLLECTION]
    
    try:
        task = tasks.find_one({
            "_id": ObjectId(task_id),
            "userId": current_user
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task["_id"] = str(task["_id"])
    return {
        "success": True,
        "data": task
    }


@router.put("/{task_id}", response_model=SuccessResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: str = Depends(get_current_user)
):
    """Update a task"""
    db = Database.get_db()
    tasks = db[TASKS_COLLECTION]
    
    try:
        task_oid = ObjectId(task_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    update_data = task_data.model_dump(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow()
    
    result = tasks.find_one_and_update(
        {"_id": task_oid, "userId": current_user},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    result["_id"] = str(result["_id"])
    return {
        "success": True,
        "data": result
    }


@router.delete("/{task_id}", response_model=SuccessResponse)
async def delete_task(
    task_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete a task"""
    db = Database.get_db()
    tasks = db[TASKS_COLLECTION]
    
    try:
        task_oid = ObjectId(task_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    result = tasks.find_one_and_delete({
        "_id": task_oid,
        "userId": current_user
    })
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return {
        "success": True,
        "data": {"message": "Task deleted"}
    }


@router.put("/{task_id}/complete", response_model=SuccessResponse)
async def complete_task(
    task_id: str,
    completion_data: TaskComplete,
    current_user: str = Depends(get_current_user)
):
    """Mark task as complete"""
    db = Database.get_db()
    tasks = db[TASKS_COLLECTION]
    
    try:
        task_oid = ObjectId(task_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID"
        )
    
    update_data = {
        "status": TaskStatus.COMPLETED,
        "accomplishments": completion_data.accomplishments,
        "improvements": completion_data.improvements,
        "actualDuration": completion_data.actualDuration,
        "actualEndTime": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = tasks.find_one_and_update(
        {"_id": task_oid, "userId": current_user},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    result["_id"] = str(result["_id"])
    return {
        "success": True,
        "data": result
    }
