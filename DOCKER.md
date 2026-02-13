# Day Planner - Docker Setup

## 🚀 Quick Start with Docker

All services (MongoDB, Backend API, Frontend) run in Docker containers for easy setup and consistent development environment.

### Prerequisites
- Docker and Docker Compose installed
- No need to install Node.js, Python, or MongoDB locally!

### Starting the Application

**Option 1: Using the helper script (recommended)**
```bash
# Make the script executable (first time only)
chmod +x docker.sh

# Start all services
./docker.sh start

# View logs
./docker.sh logs

# Stop all services
./docker.sh stop
```

**Option 2: Using Docker Compose directly**
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health
- **MongoDB**: localhost:27017

### Demo Credentials

A demo user is automatically created:
- Email: `demo@example.com`
- Password: `demo123`

## 📋 Docker Commands Reference

### Management Commands (using docker.sh)

```bash
./docker.sh start      # Start all services
./docker.sh stop       # Stop all services
./docker.sh restart    # Restart all services
./docker.sh rebuild    # Rebuild images and restart
./docker.sh logs       # View all logs
./docker.sh logs backend   # View backend logs only
./docker.sh status     # Check service status
./docker.sh clean      # Remove all containers and volumes
```

### Direct Docker Compose Commands

```bash
# Build and start services
docker compose up --build -d

# View logs (follow mode)
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Check service status
docker compose ps

# Stop services
docker compose down

# Stop and remove volumes (clean start)
docker compose down -v

# Restart a specific service
docker compose restart backend

# Execute commands in a running container
docker compose exec backend bash
docker compose exec frontend sh
```

## 🔧 Development Workflow

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Changes to `/frontend/src/**` files will auto-reload
- **Backend**: Changes to `/backend/app/**` files will auto-reload

### Installing New Dependencies

**Frontend (npm packages):**
```bash
docker compose exec frontend npm install <package-name>
# Or rebuild the container
./docker.sh rebuild
```

**Backend (Python packages):**
```bash
# Add package to backend/requirements.txt, then:
./docker.sh rebuild
```

### Database Access

**Connect to MongoDB:**
```bash
# Using MongoDB shell
docker compose exec mongodb mongosh dayplanner

# Using MongoDB Compass (GUI)
# Connection string: mongodb://localhost:27017/dayplanner
```

## 🐛 Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :5000
sudo lsof -i :27017

# Edit docker-compose.yml to use different ports
```

### Services Not Starting
```bash
# Check logs
./docker.sh logs

# Rebuild from scratch
docker compose down -v
./docker.sh rebuild
```

### Database Issues
```bash
# Reset database (WARNING: deletes all data)
docker compose down -v
./docker.sh start
```

### Frontend Can't Connect to Backend
Make sure the Vite proxy is configured in `frontend/vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://backend:5000'
  }
}
```

## 📦 What's Included

### Services

1. **MongoDB** (mongo:7.0)
   - Database for storing tasks, users, and time slots
   - Port: 27017
   - Data persisted in Docker volume

2. **Backend** (Python FastAPI)
   - RESTful API server
   - Port: 5000
   - Auto-reloads on code changes

3. **Frontend** (React + Vite)
   - Modern React application
   - Port: 3000 (maps to internal 5173)
   - Auto-reloads on code changes

### Volumes

- `mongodb_data`: Persists database data
- `mongodb_config`: Persists MongoDB configuration

### Network

All services communicate through a dedicated Docker network: `dayplanner-network`

## 🔐 Environment Variables

Environment variables are configured in `docker-compose.yml`. To customize:

1. Copy `.env.example` to `.env`
2. Update values as needed
3. Restart services: `./docker.sh restart`

## 🚨 Production Deployment

For production, you should:

1. Update `JWT_SECRET` in docker-compose.yml
2. Use production MongoDB (Atlas, etc.)
3. Build optimized frontend:
   ```dockerfile
   # In frontend/Dockerfile, change CMD to:
   RUN npm run build
   CMD ["npm", "run", "preview"]
   ```
4. Remove `--reload` flag from backend uvicorn command
5. Use environment-specific .env files
6. Add reverse proxy (nginx) for HTTPS

## 📝 Additional Notes

- The first build takes longer as Docker downloads base images
- Subsequent starts are much faster
- Code changes are reflected immediately (hot reload)
- Database data persists between restarts (stored in Docker volumes)
- Run `./docker.sh clean` to completely reset everything
