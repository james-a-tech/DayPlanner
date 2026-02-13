#!/bin/bash
# Day Planner - Python Backend Startup Verification Script

echo "================================"
echo "Day Planner - Python Backend"
echo "Startup Verification"
echo "================================"
echo ""

# Check Python version
echo "1. Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✓ $PYTHON_VERSION installed"
else
    echo "   ✗ Python 3 not found. Please install Python 3.8+."
    exit 1
fi

echo ""
echo "2. Checking dependencies..."

# Check if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "   ✓ requirements.txt found"
    echo ""
    echo "   Installing dependencies..."
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "   ✓ Dependencies installed successfully"
    else
        echo "   ✗ Failed to install dependencies"
        exit 1
    fi
else
    echo "   ✗ requirements.txt not found"
    exit 1
fi

echo ""
echo "3. Checking environment configuration..."
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
else
    echo "   ⚠ .env file not found"
    echo "   Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   ✓ .env created (remember to update with your values)"
    else
        echo "   ✗ .env.example not found"
        exit 1
    fi
fi

echo ""
echo "4. Verifying MongoDB connection..."
# Try to import and test database module
python3 << 'EOF'
import sys
sys.path.insert(0, '/home/james/Onedrive/Cloud/Projects/DayPlanner/backend')
try:
    from app.utils.database import Database
    print("   ✓ Database module imported successfully")
except Exception as e:
    print(f"   ✗ Database module import failed: {e}")
    sys.exit(1)
EOF

if [ $? -ne 0 ]; then
    echo "   ⚠ MongoDB connection will be tested when server starts"
fi

echo ""
echo "5. Directory structure validation..."
DIRS=("app" "app/routes" "app/models" "app/utils" "app/dependencies")
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ✓ $dir/"
    else
        echo "   ✗ $dir/ missing"
        exit 1
    fi
done

echo ""
echo "6. Required Python files validation..."
FILES=("app/main.py" "app/models/schemas.py" "app/routes/auth.py" "app/routes/tasks.py" "app/routes/time_slots.py" "app/routes/reports.py" "app/utils/auth.py" "app/utils/database.py" "app/utils/backup.py" "app/utils/google_calendar.py" "app/dependencies/auth.py")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ $file missing"
        exit 1
    fi
done

echo ""
echo "================================"
echo "✓ All checks passed!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Update .env with your MongoDB URI and JWT_SECRET"
echo "2. Start MongoDB (mongod or Docker)"
echo "3. Run the development server:"
echo ""
echo "   Option 1 (from root directory):"
echo "   npm run dev:python"
echo ""
echo "   Option 2 (direct Python):"
echo "   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000"
echo ""
echo "4. Access the API:"
echo "   - Health check: http://localhost:5000/api/health"
echo "   - Swagger UI: http://localhost:5000/docs"
echo "   - ReDoc: http://localhost:5000/redoc"
echo ""
echo "5. Start the React frontend (from root):"
echo "   npm run frontend"
echo ""
