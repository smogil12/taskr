#!/bin/bash

# Database Health Check Script for Tail-AI
# This script checks the health and status of your databases

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if environment file exists
check_env_file() {
    local env=$1
    local env_file="backend/.env.${env}"
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found!"
        return 1
    fi
    return 0
}

# Function to extract database URL from environment file
get_database_url() {
    local env=$1
    local env_file="backend/.env.${env}"
    
    if [ -f "$env_file" ]; then
        grep "^DATABASE_URL=" "$env_file" | cut -d'=' -f2- | tr -d '"'
    else
        echo ""
    fi
}

# Function to check database connection
check_connection() {
    local env=$1
    local db_url=$2
    
    print_status "Checking database connection for $env..."
    
    if [ -z "$db_url" ]; then
        print_error "No DATABASE_URL found in environment file"
        return 1
    fi
    
    # Use psql to test connection
    if command_exists psql; then
        if psql "$db_url" -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "Database connection successful for $env"
            return 0
        else
            print_error "Database connection failed for $env"
            return 1
        fi
    else
        print_warning "psql not found, skipping connection test"
        return 0
    fi
}

# Function to check migration status
check_migrations() {
    local env=$1
    
    print_status "Checking migration status for $env..."
    
    cd backend
    if NODE_ENV="$env" npx prisma migrate status >/dev/null 2>&1; then
        print_success "Migration status check completed for $env"
        NODE_ENV="$env" npx prisma migrate status
    else
        print_error "Migration status check failed for $env"
    fi
    cd ..
}

# Function to check database size
check_database_size() {
    local env=$1
    local db_url=$2
    
    print_status "Checking database size for $env..."
    
    if [ -z "$db_url" ]; then
        print_warning "No DATABASE_URL found, skipping size check"
        return
    fi
    
    if command_exists psql; then
        local size=$(psql "$db_url" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | xargs)
        if [ -n "$size" ]; then
            print_success "Database size for $env: $size"
        else
            print_warning "Could not determine database size for $env"
        fi
    else
        print_warning "psql not found, skipping size check"
    fi
}

# Function to check active connections
check_connections() {
    local env=$1
    local db_url=$2
    
    print_status "Checking active connections for $env..."
    
    if [ -z "$db_url" ]; then
        print_warning "No DATABASE_URL found, skipping connection count"
        return
    fi
    
    if command_exists psql; then
        local connections=$(psql "$db_url" -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | xargs)
        if [ -n "$connections" ]; then
            print_success "Active connections for $env: $connections"
        else
            print_warning "Could not determine active connections for $env"
        fi
    else
        print_warning "psql not found, skipping connection count"
    fi
}

# Function to check specific environment
check_environment() {
    local env=$1
    
    echo ""
    echo "=========================================="
    echo "Checking $env environment"
    echo "=========================================="
    
    # Check if environment file exists
    if ! check_env_file "$env"; then
        print_error "Environment file not found for $env"
        return 1
    fi
    
    # Get database URL
    local db_url=$(get_database_url "$env")
    
    # Check connection
    if check_connection "$env" "$db_url"; then
        # Check migrations
        check_migrations "$env"
        
        # Check database size
        check_database_size "$env" "$db_url"
        
        # Check active connections
        check_connections "$env" "$db_url"
    fi
    
    echo ""
}

# Function to show help
show_help() {
    echo "Tail-AI Database Health Check Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "Environments:"
    echo "  local       Check local development database"
    echo "  staging     Check staging database"
    echo "  production  Check production database"
    echo "  all         Check all environments"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local       # Check local database"
    echo "  $0 staging     # Check staging database"
    echo "  $0 all         # Check all databases"
    echo ""
    echo "What this script checks:"
    echo "  - Environment file existence"
    echo "  - Database connection"
    echo "  - Migration status"
    echo "  - Database size"
    echo "  - Active connections"
    echo ""
    echo "Prerequisites:"
    echo "  - Environment files must exist"
    echo "  - psql command available (optional, for detailed checks)"
}

# Main script logic
case "${1:-help}" in
    "local")
        check_environment "local"
        ;;
    "staging")
        check_environment "staging"
        ;;
    "production")
        check_environment "production"
        ;;
    "all")
        check_environment "local"
        check_environment "staging"
        check_environment "production"
        ;;
    "help"|*)
        show_help
        ;;
esac

