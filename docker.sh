#!/bin/bash
# Docker Compose Management Script for Day Planner

case "$1" in
  start)
    echo "🚀 Starting Day Planner services..."
    docker compose up -d
    echo "✅ Services started!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   MongoDB: localhost:27017"
    ;;
  
  stop)
    echo "🛑 Stopping Day Planner services..."
    docker compose down
    echo "✅ Services stopped!"
    ;;
  
  restart)
    echo "🔄 Restarting Day Planner services..."
    docker compose restart
    echo "✅ Services restarted!"
    ;;
  
  rebuild)
    echo "🔨 Rebuilding and starting services..."
    docker compose down
    docker compose up --build -d
    echo "✅ Services rebuilt and started!"
    ;;
  
  logs)
    if [ -z "$2" ]; then
      docker compose logs -f
    else
      docker compose logs -f "$2"
    fi
    ;;
  
  status)
    docker compose ps
    ;;
  
  clean)
    echo "🧹 Cleaning up (removing volumes)..."
    docker compose down -v
    echo "✅ Cleanup complete!"
    ;;
  
  *)
    echo "Day Planner - Docker Management"
    echo ""
    echo "Usage: $0 {start|stop|restart|rebuild|logs|status|clean}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all services"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  rebuild  - Rebuild and restart all services"
    echo "  logs     - View logs (add service name: backend, frontend, mongodb)"
    echo "  status   - Check service status"
    echo "  clean    - Stop services and remove volumes"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs backend"
    echo "  $0 rebuild"
    exit 1
    ;;
esac
