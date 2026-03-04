from enum import Enum
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(str):
    """Custom type for MongoDB ObjectId"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId: {v}")
        return ObjectId(v)

    def __repr__(self):
        return f"ObjectId('{self}')"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    duration: int  # in minutes
    plannedStartTime: datetime
    plannedEndTime: datetime
    category: str = "general"
    timeSlotId: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Complete project report",
                "description": "Finish Q4 report",
                "priority": "high",
                "duration": 120,
                "plannedStartTime": "2024-02-11T09:00:00Z",
                "plannedEndTime": "2024-02-11T11:00:00Z",
                "category": "work"
            }
        }


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    category: Optional[str] = None
    duration: Optional[int] = None
    plannedStartTime: Optional[datetime] = None
    plannedEndTime: Optional[datetime] = None


class TaskComplete(BaseModel):
    accomplishments: Optional[str] = None
    improvements: Optional[str] = None
    actualDuration: Optional[int] = None


class Task(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    userId: str
    title: str
    description: Optional[str] = None
    priority: TaskPriority
    status: TaskStatus
    duration: int
    plannedStartTime: datetime
    plannedEndTime: datetime
    actualStartTime: Optional[datetime] = None
    actualEndTime: Optional[datetime] = None
    actualDuration: Optional[int] = None
    accomplishments: Optional[str] = None
    improvements: Optional[str] = None
    timeSlotId: Optional[str] = None
    category: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class TimeSlotCreate(BaseModel):
    name: str
    startTime: str  # HH:mm format
    endTime: str
    duration: Optional[int] = None
    color: str = "#3B82F6"
    isFixed: bool = False
    daysOfWeek: List[int] = [0, 1, 2, 3, 4, 5, 6]

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Lunch Break",
                "startTime": "12:00",
                "endTime": "13:00",
                "color": "#FFA500",
                "isFixed": True,
                "daysOfWeek": [1, 2, 3, 4, 5]
            }
        }


class TimeSlot(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    userId: str
    name: str
    startTime: str
    endTime: str
    duration: Optional[int] = None
    color: str
    isFixed: bool
    daysOfWeek: List[int]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class DailyReportCreate(BaseModel):
    accomplishments: Optional[str] = None
    improvements: Optional[str] = None


class DailyReport(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    userId: str
    date: datetime
    plannedTasks: List[str] = []
    completedTasks: List[str] = []
    accomplishments: Optional[str] = None
    improvements: Optional[str] = None
    totalPlannedDuration: int = 0
    totalActualDuration: int = 0
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class UserRegister(BaseModel):
    name: str
    email: str
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "securePassword123"
            }
        }


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    email: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class LoginResponse(BaseModel):
    success: bool
    data: dict


class SuccessResponse(BaseModel):
    success: bool
    data: Any


class ErrorResponse(BaseModel):
    success: bool
    error: str
