#!/bin/bash

# Deployment Script for Tail-AI
# This script helps deploy the application to staging and production environments

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
        print_status "Run: ./scripts/setup-environments.sh $env"
        exit 1
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    npm test
    if [ $? -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Tests failed! Deployment aborted."
        exit 1
    fi
}

# Function to build application
build_app() {
    local env=$1
    
    print_status "Building application for $env environment..."
    
    # Set environment
    export NODE_ENV="$env"
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_success "Application built successfully!"
}

# Function to deploy to staging
deploy_staging() {
    print_status "Deploying to staging environment..."
    
    # Check environment file
    check_env_file "staging"
    
    # Run tests
    run_tests
    
    # Build application
    build_app "staging"
    
    # Run database migrations
    print_status "Running database migrations for staging..."
    cd backend
    NODE_ENV=staging npm run db:migrate
    cd ..
    
    print_success "Staging deployment completed!"
    print_status "Your staging application should be available at your staging URL"
}

# Function to deploy to production
deploy_production() {
    print_warning "You are about to deploy to PRODUCTION!"
    print_warning "Make sure you have:"
    print_warning "1. Tested everything in staging"
    print_warning "2. Created a backup of your production database"
    print_warning "3. Notified your team about the deployment"
    
    read -p "Are you sure you want to continue? Type 'yes' to proceed: " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Production deployment cancelled"
        exit 0
    fi
    
    print_status "Deploying to production environment..."
    
    # Check environment file
    check_env_file "production"
    
    # Run tests
    run_tests
    
    # Build application
    build_app "production"
    
    # Run database migrations
    print_status "Running database migrations for production..."
    cd backend
    NODE_ENV=production npm run db:migrate
    cd ..
    
    print_success "Production deployment completed!"
    print_status "Your production application should be available at your production URL"
}

# Function to show help
show_help() {
    echo "Tail-AI Deployment Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "Environments:"
    echo "  staging     Deploy to staging environment"
    echo "  production  Deploy to production environment"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 staging      # Deploy to staging"
    echo "  $0 production   # Deploy to production"
    echo ""
    echo "Prerequisites:"
    echo "  - Environment files must exist (backend/.env.staging, backend/.env.production)"
    echo "  - Database must be set up and accessible"
    echo "  - All tests must pass"
    echo ""
    echo "What this script does:"
    echo "  1. Checks environment configuration"
    echo "  2. Runs tests"
    echo "  3. Builds the application"
    echo "  4. Runs database migrations"
    echo "  5. Deploys the application"
}

# Main script logic
case "${1:-help}" in
    "staging")
        deploy_staging
        ;;
    "production")
        deploy_production
        ;;
    "help"|*)
        show_help
        ;;
esac

