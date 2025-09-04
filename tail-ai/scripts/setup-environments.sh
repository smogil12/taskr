#!/bin/bash

# Environment Setup Script for Tail-AI
# This script helps set up different database environments

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

# Function to setup local environment
setup_local() {
    print_status "Setting up local development environment..."
    
    # Check if Docker is running
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Start local database
    print_status "Starting local PostgreSQL database..."
    cd infrastructure
    docker-compose up -d postgres
    cd ..
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Create local environment file if it doesn't exist
    if [ ! -f "backend/.env.local" ]; then
        print_status "Creating local environment file..."
        cat > backend/.env.local << EOF
# Local Development Environment
NODE_ENV=development

# Database - Local Docker
DATABASE_URL="postgresql://taskr_user:taskr_password@localhost:5432/taskr_dev"

# JWT
JWT_SECRET="local-development-jwt-secret-key-$(date +%s)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (Test Keys)
STRIPE_SECRET_KEY="sk_test_your_local_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_local_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"

# Email Service (Resend)
RESEND_API_KEY="re_g5M8foZk_ELF1mUPd1zsqNXK5k3dbB5K1"
FRONTEND_URL="http://localhost:3000"

# Google Calendar Integration
GOOGLE_CLIENT_ID="29558875450-1ueo1kqp6tndelbkd69p9vl6nnj8cov4.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/calendar/oauth/callback"
EOF
        print_success "Created backend/.env.local"
    else
        print_warning "backend/.env.local already exists, skipping creation"
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    cd backend
    npm run db:migrate
    npm run db:generate
    cd ..
    
    print_success "Local environment setup complete!"
    print_status "You can now run: npm run dev"
}

# Function to setup staging environment
setup_staging() {
    print_status "Setting up staging environment..."
    
    # Create staging environment file if it doesn't exist
    if [ ! -f "backend/.env.staging" ]; then
        print_status "Creating staging environment file..."
        cat > backend/.env.staging << EOF
# Staging Environment
NODE_ENV=staging

# Database - Staging (Replace with your staging database URL)
DATABASE_URL="postgresql://staging_user:staging_password@staging-db-host:5432/taskr_staging"

# JWT
JWT_SECRET="staging-jwt-secret-key-$(date +%s)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
CORS_ORIGIN="https://staging.yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (Test Keys for Staging)
STRIPE_SECRET_KEY="sk_test_your_staging_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_staging_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"

# Email Service (Resend)
RESEND_API_KEY="re_g5M8foZk_ELF1mUPd1zsqNXK5k3dbB5K1"
FRONTEND_URL="https://staging.yourdomain.com"

# Google Calendar Integration
GOOGLE_CLIENT_ID="29558875450-1ueo1kqp6tndelbkd69p9vl6nnj8cov4.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
GOOGLE_REDIRECT_URI="https://staging.yourdomain.com/api/calendar/oauth/callback"
EOF
        print_success "Created backend/.env.staging"
        print_warning "Please update the DATABASE_URL in backend/.env.staging with your actual staging database connection string"
    else
        print_warning "backend/.env.staging already exists, skipping creation"
    fi
    
    print_success "Staging environment configuration complete!"
    print_status "Remember to:"
    print_status "1. Set up your staging database (AWS RDS, DigitalOcean, etc.)"
    print_status "2. Update the DATABASE_URL in backend/.env.staging"
    print_status "3. Run: npm run db:migrate:staging"
}

# Function to setup production environment
setup_production() {
    print_status "Setting up production environment..."
    
    # Create production environment file if it doesn't exist
    if [ ! -f "backend/.env.production" ]; then
        print_status "Creating production environment file..."
        cat > backend/.env.production << EOF
# Production Environment
NODE_ENV=production

# Database - Production (Replace with your production database URL)
DATABASE_URL="postgresql://prod_user:prod_password@prod-db-host:5432/taskr_production?sslmode=require"

# JWT
JWT_SECRET="production-jwt-secret-key-$(date +%s)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
CORS_ORIGIN="https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (Live Keys for Production)
STRIPE_SECRET_KEY="sk_live_your_production_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"

# Email Service (Resend)
RESEND_API_KEY="re_g5M8foZk_ELF1mUPd1zsqNXK5k3dbB5K1"
FRONTEND_URL="https://yourdomain.com"

# Google Calendar Integration
GOOGLE_CLIENT_ID="29558875450-1ueo1kqp6tndelbkd69p9vl6nnj8cov4.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/calendar/oauth/callback"
EOF
        print_success "Created backend/.env.production"
        print_warning "Please update the DATABASE_URL in backend/.env.production with your actual production database connection string"
    else
        print_warning "backend/.env.production already exists, skipping creation"
    fi
    
    print_success "Production environment configuration complete!"
    print_status "Remember to:"
    print_status "1. Set up your production database (AWS RDS, Google Cloud SQL, etc.)"
    print_status "2. Update the DATABASE_URL in backend/.env.production"
    print_status "3. Use strong, unique passwords and enable SSL"
    print_status "4. Set up database backups and monitoring"
    print_status "5. Run: npm run db:migrate:prod"
}

# Function to show help
show_help() {
    echo "Tail-AI Environment Setup Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "Environments:"
    echo "  local       Set up local development environment with Docker"
    echo "  staging     Set up staging environment configuration"
    echo "  production  Set up production environment configuration"
    echo "  all         Set up all environments"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local      # Set up local development"
    echo "  $0 staging    # Set up staging configuration"
    echo "  $0 all        # Set up all environments"
}

# Main script logic
case "${1:-help}" in
    "local")
        setup_local
        ;;
    "staging")
        setup_staging
        ;;
    "production")
        setup_production
        ;;
    "all")
        setup_local
        echo ""
        setup_staging
        echo ""
        setup_production
        ;;
    "help"|*)
        show_help
        ;;
esac









