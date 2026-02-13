# Day Planner - Web App

A modern task planning and time management application built with React and Python. Plan your day, track accomplishments, and optimize your schedule.

## Features

### Core Task Management
- ✅ Create tasks with priority levels (Low, Medium, High)
- ⏱️ Assign duration to tasks
- 📅 Schedule tasks for specific time slots
- 📊 Track task status (To-do, In Progress, Completed)
- 💬 Add accomplishments and improvement notes after task completion

### Time Slot Management
- 🎯 Create fixed time slot templates (Lunch, Travel, etc.)
- 🔄 Repeat templates on specific days of the week
- 🎨 Customize slot colors for visual organization
- 📍 Auto-assign tasks to matching free time slots

### Calendar & Scheduling
- 📅 Google Calendar integration (sync free/busy times)
- 📆 Daily task view with time management
- 🔔 Visual timeline of planned vs. actual duration

### Analytics & History
- 📈 Daily reports comparing planned vs. accomplished tasks
- 📚 Complete history backed up to cloud
- 📉 Performance analytics and improvements tracking
- 📊 Weekly/Monthly summary reports

## Tech Stack

### Backend
- **Python 3.8+** with FastAPI
- **MongoDB** for data persistence
- **Pydantic** for type safety and validation
- **JWT** for authentication
- **Google APIs** for calendar integration

### Frontend
- **React** 18 with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Query** for state management
- **Zustand** for UI state
- **Lucide React** for icons

## Project Structure

```
DayPlanner/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── models/         # Pydantic data models
│   │   │   └── schemas.py
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   ├── time_slots.py
│   │   │   └── reports.py
│   │   ├── dependencies/   # FastAPI dependencies
│   │   │   └── auth.py     # JWT verification
│   │   ├── utils/          # Helper services
│   │   │   ├── auth.py     # Password & token utilities
│   │   │   ├── database.py # MongoDB connection
│   │   │   ├── backup.py   # Backup service
│   │   │   └── google_calendar.py
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Configuration
│   └── .env.example
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand stores
│   │   └── api/            # API client
│   ├── package.json
│   └── vite.config.ts
├── package.json            # Root scripts
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB local instance or Atlas connection
- npm or yarn + pip

### Installation

1. **Install all dependencies**
   ```bash
   # From root directory
   npm install
   cd backend && pip install -r requirements.txt
   cd ../frontend && npm install
   ```

2. **Configure MongoDB**
   - Ensure MongoDB is running locally: `mongod`
   - OR use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`
   - OR use MongoDB Atlas (cloud)

3. **Setup Backend Configuration**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT_SECRET
   ```

### Running the Application

**Option 1: Run Both Servers** (from root)
```bash
npm run dev
```
This starts both backend and frontend simultaneously.

**Option 2: Run Backend and Frontend Separately**

Terminal 1 - Backend (Python/FastAPI):
```bash
npm run dev:python
# OR
cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

Terminal 2 - Frontend (React):
```bash
npm run frontend
# OR
cd frontend && npm run dev
```

**Option 3: Run via npm scripts** (from root)
```bash
# Terminal 1: Backend
npm run backend:python

# Terminal 2: Frontend  
npm run frontend
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/docs (Swagger UI)

## API Endpoints

### Tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/complete` - Mark task as complete with notes

### Time Slots
- `POST /api/time-slots` - Create template
- `GET /api/time-slots` - Get all templates
- `PUT /api/time-slots/:id` - Update template
- `DELETE /api/time-slots/:id` - Delete template

### Reports
- `GET /api/reports/:date` - Get daily report
- `PUT /api/reports/:date` - Update daily report
- `GET /api/reports/analytics/summary` - Get analytics

## Key Features Implementation

### Task Creation with Priority & Duration
Tasks can be created with:
- Title, description, and category
- Priority levels affecting task ordering
- Duration in minutes for time blocking
- Scheduled start and end times

### Free Time Slot Auto-Assignment
The system analyzes:
- Fixed time slot templates (lunch, travel, meetings)
- Google Calendar busy/free times
- Existing scheduled tasks
- Automatic suggestion of available slots for new tasks

### Daily Accomplishment Tracking
After task completion:
- Log what was actually accomplished
- Note the actual duration spent
- Record improvements for future planning
- System calculates variance vs. planned time

### Cloud Backup & History
- All daily reports automatically saved
- Cloud storage integration for backup
- Historical data available for trend analysis
- Sync across devices

## Configuration

Edit `backend/.env`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=dayplanner

# JWT
JWT_SECRET=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# Server
PORT=5000
HOST=0.0.0.0

# Google Calendar (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS S3 Backup (Optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=dayplanner-backups
AWS_REGION=us-east-1
```

## Contributing

This is a personal project. Feel free to fork and customize!

## License

MIT
