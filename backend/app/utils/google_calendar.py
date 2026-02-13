import os
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.exceptions import RefreshError
from googleapiclient.discovery import build
from datetime import datetime, timedelta


class GoogleCalendarService:
    """Service for Google Calendar integration"""
    
    SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
    
    def __init__(self, credentials_file=None):
        """Initialize Google Calendar service"""
        self.credentials_file = credentials_file or os.getenv("GOOGLE_CREDENTIALS_FILE")
        self.service = None
    
    def authenticate(self):
        """Authenticate with Google Calendar"""
        try:
            if not self.credentials_file:
                return {
                    "success": False,
                    "error": "Google credentials file not configured"
                }
            
            creds = Credentials.from_authorized_user_file(
                self.credentials_file,
                self.SCOPES
            )
            self.service = build('calendar', 'v3', credentials=creds)
            return {"success": True}
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_free_busy_slots(self, start_date: datetime, end_date: datetime):
        """Get free time slots from Google Calendar"""
        try:
            if not self.service:
                auth_result = self.authenticate()
                if not auth_result["success"]:
                    return auth_result
            
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=start_date.isoformat() + 'Z',
                timeMax=end_date.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Parse events and identify free slots
            free_slots = self._calculate_free_slots(events, start_date, end_date)
            
            return {
                "success": True,
                "data": {
                    "busyEvents": events,
                    "freeSlots": free_slots
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _calculate_free_slots(self, events, start_date, end_date):
        """Calculate free time slots between events"""
        free_slots = []
        
        # Sort events by start time
        events.sort(key=lambda x: x['start'].get('dateTime', x['start'].get('date')))
        
        current_time = start_date
        
        for event in events:
            event_start = datetime.fromisoformat(
                event['start'].get('dateTime', event['start'].get('date')).replace('Z', '+00:00')
            )
            event_end = datetime.fromisoformat(
                event['end'].get('dateTime', event['end'].get('date')).replace('Z', '+00:00')
            )
            
            # If there's a gap between current time and event start
            if event_start > current_time:
                free_slots.append({
                    "start": current_time.isoformat(),
                    "end": event_start.isoformat(),
                    "duration": int((event_start - current_time).total_seconds() / 60)
                })
            
            current_time = max(current_time, event_end)
        
        # Add final free slot if there's time until end_date
        if current_time < end_date:
            free_slots.append({
                "start": current_time.isoformat(),
                "end": end_date.isoformat(),
                "duration": int((end_date - current_time).total_seconds() / 60)
            })
        
        return free_slots
    
    def sync_calendar_events(self, user_id: str):
        """Sync Google Calendar events to application"""
        try:
            start_date = datetime.utcnow()
            end_date = start_date + timedelta(days=30)
            
            result = self.get_free_busy_slots(start_date, end_date)
            
            if not result["success"]:
                return result
            
            # Store sync info in database
            from app.utils.database import Database, USERS_COLLECTION
            
            db = Database.get_db()
            users = db[USERS_COLLECTION]
            
            users.update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "googleCalendarSync": True,
                        "lastSyncDate": datetime.utcnow()
                    }
                }
            )
            
            return {
                "success": True,
                "data": result.get("data", {})
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
