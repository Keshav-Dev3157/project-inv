#!/bin/bash

echo "========================================="
echo "Personal Funds Management - Setup Check"
echo "========================================="
echo ""

# Check if MongoDB is running locally
if command -v mongosh &> /dev/null; then
    echo "✓ MongoDB CLI (mongosh) is installed"
    if mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
        echo "✓ MongoDB is running locally"
        echo ""
        echo "You can use the default local connection:"
        echo "MONGODB_URI=mongodb://localhost:27017"
    else
        echo "✗ MongoDB is not running"
        echo ""
        echo "Start MongoDB with: brew services start mongodb-community"
        echo "Or use MongoDB Atlas (cloud) - see README.md"
    fi
else
    echo "✗ MongoDB is not installed locally"
    echo ""
    echo "Options:"
    echo "1. Install MongoDB locally:"
    echo "   brew tap mongodb/brew"
    echo "   brew install mongodb-community"
    echo "   brew services start mongodb-community"
    echo ""
    echo "2. Use MongoDB Atlas (recommended for quick start):"
    echo "   - Visit https://www.mongodb.com/cloud/atlas"
    echo "   - Create a free cluster"
    echo "   - Get your connection string"
    echo "   - Update backend/.env with your connection string"
fi

echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo "1. Set up MongoDB (local or Atlas)"
echo "2. Update backend/.env if using Atlas"
echo "3. Start backend: cd backend && source venv/bin/activate && python main.py"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Login with admin/admin123"
echo ""
