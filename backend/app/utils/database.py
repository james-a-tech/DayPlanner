import os
from datetime import timezone
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/dayplanner")

class Database:
    client = None
    db = None

    @classmethod
    def connect_db(cls, timeout=5):
        """Connect to MongoDB with timeout"""
        try:
            # Create client with serverSelectionTimeoutMS and connectTimeoutMS
            # tz_aware=True ensures datetimes from MongoDB are timezone-aware (UTC)
            # This prevents serialization mismatch between POST/PUT and GET responses
            cls.client = MongoClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=timeout * 1000,
                connectTimeoutMS=timeout * 1000,
                tz_aware=True,
                tzinfo=timezone.utc
            )
            cls.db = cls.client.dayplanner
            # Test connection  - this will timeout after the specified timeout
            try:
                cls.client.server_info()
                print("✓ Connected to MongoDB")
            except Exception as e:
                print(f"⚠ Could not verify MongoDB: {e}")
            return cls.db
        except Exception as e:
            print(f"⚠ MongoDB connection timeout or error: {e}")
            # Don't raise - allow app to start without database
            return None

    @classmethod
    def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("✓ Closed MongoDB connection")

    @classmethod
    def get_db(cls):
        """Get database instance"""
        if cls.db is None:
            cls.connect_db()
        return cls.db


# Collection names
USERS_COLLECTION = "users"
TASKS_COLLECTION = "tasks"
TIME_SLOTS_COLLECTION = "time_slots"
DAILY_REPORTS_COLLECTION = "daily_reports"
