from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from datetime import datetime, timedelta
from app.models.schemas import DailyReport, DailyReportCreate, SuccessResponse
from app.utils.database import Database, DAILY_REPORTS_COLLECTION
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{date}", response_model=SuccessResponse)
async def get_daily_report(
    date: str,
    current_user: str = Depends(get_current_user)
):
    """Get daily report for a specific date"""
    db = Database.get_db()
    reports = db[DAILY_REPORTS_COLLECTION]
    
    try:
        report_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )
    
    report_date_start = report_date.replace(hour=0, minute=0, second=0, microsecond=0)
    report_date_end = report_date_start + timedelta(days=1)
    
    report = reports.find_one({
        "userId": current_user,
        "date": {"$gte": report_date_start, "$lt": report_date_end}
    })
    
    if not report:
        # Create new report if it doesn't exist
        report = {
            "userId": current_user,
            "date": report_date_start,
            "plannedTasks": [],
            "completedTasks": [],
            "accomplishments": None,
            "improvements": None,
            "totalPlannedDuration": 0,
            "totalActualDuration": 0,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    
    if "_id" in report:
        report["_id"] = str(report["_id"])
    
    return {
        "success": True,
        "data": report
    }


@router.put("/{date}", response_model=SuccessResponse)
async def update_daily_report(
    date: str,
    report_data: DailyReportCreate,
    current_user: str = Depends(get_current_user)
):
    """Update daily report"""
    db = Database.get_db()
    reports = db[DAILY_REPORTS_COLLECTION]
    
    try:
        report_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )
    
    report_date_start = report_date.replace(hour=0, minute=0, second=0, microsecond=0)
    report_date_end = report_date_start + timedelta(days=1)
    
    update_data = report_data.model_dump(exclude_unset=True)
    update_data["userId"] = current_user
    update_data["date"] = report_date_start
    update_data["updatedAt"] = datetime.utcnow()
    
    result = reports.find_one_and_update(
        {
            "userId": current_user,
            "date": {"$gte": report_date_start, "$lt": report_date_end}
        },
        {"$set": update_data},
        upsert=True,
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return {
        "success": True,
        "data": result
    }


@router.get("/analytics/summary", response_model=SuccessResponse)
async def get_analytics(
    startDate: str = Query(...),
    endDate: str = Query(...),
    current_user: str = Depends(get_current_user)
):
    """Get analytics summary for date range"""
    db = Database.get_db()
    reports = db[DAILY_REPORTS_COLLECTION]
    
    try:
        start = datetime.fromisoformat(startDate.replace('Z', '+00:00'))
        end = datetime.fromisoformat(endDate.replace('Z', '+00:00'))
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )
    
    user_reports = list(reports.find({
        "userId": current_user,
        "date": {"$gte": start, "$lte": end}
    }))
    
    total_planned = sum(r.get("totalPlannedDuration", 0) for r in user_reports)
    total_actual = sum(r.get("totalActualDuration", 0) for r in user_reports)
    completed_days = sum(1 for r in user_reports if len(r.get("completedTasks", [])) > 0)
    
    avg_completion = 0
    if len(user_reports) > 0:
        total_completed = sum(len(r.get("completedTasks", [])) for r in user_reports)
        avg_completion = (total_completed / len(user_reports) / 10) * 100 if user_reports else 0
    
    return {
        "success": True,
        "data": {
            "totalReports": len(user_reports),
            "totalPlanned": total_planned,
            "totalActual": total_actual,
            "completedDays": completed_days,
            "averageCompletionRate": round(avg_completion, 2)
        }
    }
