#!/bin/bash

# AI Task Tracker - Docker Setup Script
# This script sets up the PostgreSQL Docker container for the project

set -e

echo "🚀 Setting up AI Task Tracker Docker environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if container already exists
if docker ps -a | grep -q ai_task_tracker_db; then
    echo "📦 Container 'ai_task_tracker_db' already exists."
    
    # Check if it's running
    if docker ps | grep -q ai_task_tracker_db; then
        echo "✅ Container is already running."
    else
        echo "▶️  Starting existing container..."
        docker start ai_task_tracker_db
        echo "✅ Container started successfully."
    fi
else
    echo "📦 Creating new PostgreSQL container..."
    docker run -d \
        --name ai_task_tracker_db \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_DB=ai_task_tracker \
        -p 5432:5432 \
        -v ai_task_tracker_data:/var/lib/postgresql/data \
        postgres:15-alpine
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# Verify database is ready
echo "🔍 Checking database connection..."
if docker exec ai_task_tracker_db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready and accepting connections!"
else
    echo "⚠️  PostgreSQL is starting up, please wait a moment..."
    sleep 3
    docker exec ai_task_tracker_db pg_isready -U postgres
fi

echo ""
echo "📊 Database Information:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: ai_task_tracker"
echo "  User: postgres"
echo "  Password: password"
echo ""
echo "🎉 Setup complete! You can now run:"
echo "   cargo run          # Start the backend"
echo "   cd frontend && npm run dev  # Start the frontend"
echo ""
echo "💡 Useful commands:"
echo "   docker stop ai_task_tracker_db   # Stop the database"
echo "   docker start ai_task_tracker_db  # Start the database"
echo "   docker logs ai_task_tracker_db   # View database logs"
