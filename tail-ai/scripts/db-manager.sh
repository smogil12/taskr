#!/bin/bash

# Database Management Script for Tail-AI
# This script helps manage database operations across different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if environment file exists
check_env_file() {
    local env=$1
    local env_file="backend/.env.${env}"
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found!"
        print_status "Run: ./scripts/setup-environments.sh $env"
        exit 1
    fi
}

# Function to run command with environment
run_with_env() {
    local env=$1
    local command=$2
    
    check_env_file "$env"
    
    print_status "Running command in $env environment: $command"
    cd backend
    NODE_ENV="$env" $command
    cd ..
}

# Function to migrate database
migrate_db() {
    local env=$1
    
    print_status "Migrating $env database..."
    run_with_env "$env" "npm run db:migrate"
    print_success "Migration completed for $env"
}

# Function to generate Prisma client
generate_client() {
    local env=$1
    
    print_status "Generating Prisma client for $env..."
    run_with_env "$env" "npm run db:generate"
    print_success "Prisma client generated for $env"
}

# Function to open Prisma Studio
open_studio() {
    local env=$1
    
    print_status "Opening Prisma Studio for $env..."
    run_with_env "$env" "npm run db:studio"
}

# Function to reset database (WARNING: This will delete all data)
reset_db() {
    local env=$1
    
    print_warning "This will DELETE ALL DATA in the $env database!"
    read -p "Are you sure? Type 'yes' to continue: " confirm
    
    if [ "$confirm" = "yes" ]; then
        print_status "Resetting $env database..."
        run_with_env "$env" "npx prisma migrate reset --force"
        print_success "Database reset completed for $env"
    else
        print_status "Database reset cancelled"
    fi
}

# Function to show database status
show_status() {
    local env=$1
    
    print_status "Database status for $env:"
    run_with_env "$env" "npx prisma migrate status"
}

# Function to show help
show_help() {
    echo "Tail-AI Database Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  migrate     Run database migrations"
    echo "  generate    Generate Prisma client"
    echo "  studio      Open Prisma Studio"
    echo "  reset       Reset database (WARNING: deletes all data)"
    echo "  status      Show migration status"
    echo "  help        Show this help message"
    echo ""
    echo "Environments:"
    echo "  local       Local development environment"
    echo "  staging     Staging environment"
    echo "  production  Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 migrate local      # Run migrations on local database"
    echo "  $0 studio local       # Open Prisma Studio for local database"
    echo "  $0 status staging     # Show migration status for staging"
    echo "  $0 reset local        # Reset local database (with confirmation)"
}

# Main script logic
command="${1:-help}"
environment="${2:-local}"

case "$command" in
    "migrate")
        migrate_db "$environment"
        ;;
    "generate")
        generate_client "$environment"
        ;;
    "studio")
        open_studio "$environment"
        ;;
    "reset")
        reset_db "$environment"
        ;;
    "status")
        show_status "$environment"
        ;;
    "help"|*)
        show_help
        ;;
esac

