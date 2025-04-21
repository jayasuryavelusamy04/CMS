#!/bin/bash

# Function to display help message
show_help() {
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  build       - Rebuild all services"
    echo "  logs        - Show logs from all services"
    echo "  backend     - Show backend logs"
    echo "  frontend    - Show frontend logs"
    echo "  db         - Show database logs"
    echo "  test       - Run tests"
    echo "  migrate    - Run database migrations"
    echo "  shell      - Open a shell in the backend container"
    echo "  help       - Show this help message"
}

# Make script exit on any error
set -e

case "$1" in
    "start")
        docker-compose up -d
        echo "Services started in detached mode. Use './dev.sh logs' to view logs."
        ;;
    "stop")
        docker-compose down
        ;;
    "restart")
        docker-compose down
        docker-compose up -d
        ;;
    "build")
        docker-compose build
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "backend")
        docker-compose logs -f backend
        ;;
    "frontend")
        docker-compose logs -f frontend
        ;;
    "db")
        docker-compose logs -f db
        ;;
    "test")
        docker-compose exec backend pytest
        ;;
    "migrate")
        docker-compose exec backend alembic upgrade head
        ;;
    "shell")
        docker-compose exec backend /bin/bash
        ;;
    "help")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
