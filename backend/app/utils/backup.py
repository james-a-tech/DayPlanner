import os
from datetime import datetime
from pymongo import MongoClient
import json
from bson import json_util

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/dayplanner")


class BackupService:
    """Service for backing up data to MongoDB"""
    
    @staticmethod
    def create_backup():
        """Create a backup of all collections"""
        try:
            client = MongoClient(MONGODB_URI)
            db = client.dayplanner
            
            backup_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "collections": {}
            }
            
            # Backup each collection
            collections = ["users", "tasks", "time_slots", "daily_reports"]
            for collection_name in collections:
                collection = db[collection_name]
                docs = list(collection.find({}))
                backup_data["collections"][collection_name] = json.loads(
                    json_util.dumps(docs)
                )
            
            # Store backup in database
            backups_collection = db["backups"]
            result = backups_collection.insert_one({
                "timestamp": datetime.utcnow(),
                "data": backup_data,
                "status": "completed"
            })
            
            client.close()
            return {
                "success": True,
                "backup_id": str(result.inserted_id),
                "timestamp": backup_data["timestamp"]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def restore_backup(backup_id: str):
        """Restore data from a backup"""
        try:
            from bson import ObjectId
            client = MongoClient(MONGODB_URI)
            db = client.dayplanner
            
            backups_collection = db["backups"]
            backup = backups_collection.find_one({"_id": ObjectId(backup_id)})
            
            if not backup:
                return {
                    "success": False,
                    "error": "Backup not found"
                }
            
            # Restore each collection
            for collection_name, docs in backup["data"]["collections"].items():
                collection = db[collection_name]
                if docs:
                    collection.insert_many(docs)
            
            client.close()
            return {
                "success": True,
                "message": "Backup restored successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def list_backups(limit: int = 10):
        """List recent backups"""
        try:
            client = MongoClient(MONGODB_URI)
            db = client.dayplanner
            
            backups_collection = db["backups"]
            backups = list(backups_collection.find().sort("timestamp", -1).limit(limit))
            
            client.close()
            return {
                "success": True,
                "backups": [
                    {
                        "id": str(b["_id"]),
                        "timestamp": b["timestamp"].isoformat(),
                        "status": b.get("status", "unknown")
                    }
                    for b in backups
                ]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
