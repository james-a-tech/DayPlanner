# Day Planner API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except Auth) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 201
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200
{
  "success": true,
  "data": {
    "user": { "id", "name", "email" },
    "token": "jwt_token_here"
  }
}
```

### Google OAuth Callback
```
POST /auth/google/callback
Content-Type: application/json

{
  "googleId": "google_id",
  "email": "john@example.com",
  "name": "John Doe"
}

Response: 200 (same as login)
```

---

## Task Endpoints

### Create Task
```
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project report",
  "description": "Finish Q4 report",
  "priority": "high",      // 'low', 'medium', 'high'
  "duration": 120,         // minutes
  "plannedStartTime": "2024-02-11T09:00:00Z",
  "plannedEndTime": "2024-02-11T11:00:00Z",
  "category": "work"
}

Response: 201
{
  "success": true,
  "data": {
    "_id": "task_id",
    "userId": "user_id",
    "title": "Complete project report",
    "status": "todo",      // 'todo', 'in_progress', 'completed'
    "accomplishments": null,
    "improvements": null,
    "createdAt": "2024-02-11T08:00:00Z"
  }
}
```

### Get All Tasks
```
GET /tasks
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    { task_object },
    ...
  ]
}
```

### Get Specific Task
```
GET /tasks/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": { task_object }
}
```

### Update Task
```
PUT /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "description": "Updated description"
}

Response: 200
{
  "success": true,
  "data": { updated_task_object }
}
```

### Complete Task
```
PUT /tasks/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "accomplishments": "Finished the report successfully",
  "improvements": "Could have started earlier",
  "actualDuration": 100  // actual minutes spent
}

Response: 200
{
  "success": true,
  "data": {
    ...task,
    "status": "completed",
    "accomplishments": "Finished the report successfully",
    "improvements": "Could have started earlier",
    "actualDuration": 100,
    "actualEndTime": "2024-02-11T10:40:00Z"
  }
}
```

### Delete Task
```
DELETE /tasks/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": { "message": "Task deleted" }
}
```

---

## Time Slot Endpoints

### Create Time Slot Template
```
POST /time-slots
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Lunch Break",
  "startTime": "12:00",      // HH:mm format
  "endTime": "13:00",
  "color": "#FFA500",
  "isFixed": true,
  "daysOfWeek": [1, 2, 3, 4, 5]  // 0=Sun, 1=Mon, etc
}

Response: 201
{
  "success": true,
  "data": {
    "_id": "slot_id",
    "name": "Lunch Break",
    "startTime": "12:00",
    "endTime": "13:00",
    "color": "#FFA500",
    "isFixed": true,
    "daysOfWeek": [1, 2, 3, 4, 5]
  }
}
```

### Get All Time Slots
```
GET /time-slots
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    { time_slot_object },
    ...
  ]
}
```

### Update Time Slot
```
PUT /time-slots/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "endTime": "13:30"
}

Response: 200
{
  "success": true,
  "data": { updated_slot_object }
}
```

### Delete Time Slot
```
DELETE /time-slots/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": { "message": "Time slot deleted" }
}
```

---

## Daily Report Endpoints

### Get Daily Report
```
GET /reports/:date
Authorization: Bearer <token>

Parameters:
  :date - ISO date string (e.g., "2024-02-11")

Response: 200
{
  "success": true,
  "data": {
    "_id": "report_id",
    "userId": "user_id",
    "date": "2024-02-11T00:00:00Z",
    "plannedTasks": ["task_id1", "task_id2"],
    "completedTasks": ["task_id1"],
    "accomplishments": null,
    "improvements": null,
    "totalPlannedDuration": 240,
    "totalActualDuration": 200
  }
}
```

### Update Daily Report
```
PUT /reports/:date
Authorization: Bearer <token>
Content-Type: application/json

{
  "accomplishments": "Completed main project tasks",
  "improvements": "Need better time estimation"
}

Response: 200
{
  "success": true,
  "data": { updated_report_object }
}
```

### Get Analytics Summary
```
GET /reports/analytics/summary
Authorization: Bearer <token>

Query Parameters:
  startDate - ISO date string
  endDate - ISO date string

Example:
  GET /reports/analytics/summary?startDate=2024-01-11&endDate=2024-02-11

Response: 200
{
  "success": true,
  "data": {
    "totalReports": 30,
    "totalPlanned": 7200,        // minutes
    "totalActual": 6800,
    "completedDays": 28,
    "averageCompletionRate": 85.5
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Task not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Data Models

### User
```typescript
{
  _id: ObjectId
  name: string
  email: string (unique)
  password: string (hashed)
  googleId?: string
  googleCalendarSync: boolean
  timezone: string
  createdAt: Date
  updatedAt: Date
}
```

### Task
```typescript
{
  _id: ObjectId
  userId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed'
  duration: number (minutes)
  plannedStartTime: Date
  plannedEndTime: Date
  actualStartTime?: Date
  actualEndTime?: Date
  actualDuration?: number
  accomplishments?: string
  improvements?: string
  timeSlotId?: string
  category: string
  createdAt: Date
  updatedAt: Date
}
```

### TimeSlot
```typescript
{
  _id: ObjectId
  userId: string
  name: string
  startTime: string (HH:mm)
  endTime: string (HH:mm)
  color: string
  isFixed: boolean
  daysOfWeek: number[] // 0-6 (Sun-Sat)
  createdAt: Date
  updatedAt: Date
}
```

### DailyReport
```typescript
{
  _id: ObjectId
  userId: string
  date: Date
  plannedTasks: string[]
  completedTasks: string[]
  accomplishments: string
  improvements: string
  totalPlannedDuration: number
  totalActualDuration: number
  createdAt: Date
  updatedAt: Date
}
```

---

## Rate Limiting

Currently not implemented. For production, add:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

---

## Example Usage

### Create a Task and Mark Complete

```bash
# 1. Register/Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Save the token from response
TOKEN="your_jwt_token_here"

# 2. Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review code",
    "priority": "high",
    "duration": 60,
    "plannedStartTime": "2024-02-11T09:00:00Z",
    "plannedEndTime": "2024-02-11T10:00:00Z",
    "category": "work"
  }'

# Save task ID from response
TASK_ID="task_id_here"

# 3. Complete the task
curl -X PUT http://localhost:5000/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accomplishments": "Completed and approved code review",
    "improvements": "Could review faster with checklists",
    "actualDuration": 55
  }'
```

---

## Future Endpoints (Planned)

- **POST /auth/logout** - Invalidate token
- **POST /google-calendar/sync** - Sync with Google Calendar
- **POST /backups/export** - Export user data
- **POST /backups/import** - Import user data
- **GET /suggestions** - Get improvement suggestions
- **POST /teams** - Create shared task lists

---

## Changelog

### v1.0.0 (Current)
- User authentication (register/login)
- Task CRUD operations
- Time slot templates
- Daily reports and analytics
- Basic error handling

### Planned: v1.1.0
- Google Calendar integration
- Cloud backups
- Email notifications
- Advanced analytics

---

## Support

For API issues, check:
1. Authorization header is present
2. JWT token is valid (not expired)
3. Request body format matches examples
4. MongoDB is running and connected
