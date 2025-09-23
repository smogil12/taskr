#!/bin/bash

# Script to add Google OAuth credentials to DigitalOcean server
# This script adds the Google OAuth environment variables to the backend .env file

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

# Google OAuth credentials (from your existing configuration)
GOOGLE_CLIENT_ID="29558875450-1ueo1kqp6tndelbkd69p9vl6nnj8cov4.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
GOOGLE_REDIRECT_URI="https://dev.tailapp.ai/api/calendar/oauth/callback"

print_status "Adding Google OAuth credentials to DigitalOcean server..."

# Add Google OAuth environment variables to the server's .env file
ssh root@167.99.115.97 "cd /opt/taskr-backend && cat >> .env << 'EOF'

# Google Calendar Integration
GOOGLE_CLIENT_ID=\"$GOOGLE_CLIENT_ID\"
GOOGLE_CLIENT_SECRET=\"$GOOGLE_CLIENT_SECRET\"
GOOGLE_REDIRECT_URI=\"$GOOGLE_REDIRECT_URI\"
EOF"

print_success "Google OAuth credentials added to server .env file"

# Restart the backend service to load the new environment variables
print_status "Restarting backend service to load new environment variables..."
ssh root@167.99.115.97 "pm2 restart taskr-backend --update-env"

print_success "Backend service restarted with new Google OAuth credentials"

# Test the calendar endpoint to verify it's working
print_status "Testing calendar endpoint..."
if curl -s -H "Origin: https://dev.tailapp.ai" http://167.99.115.97:3001/api/calendar/status | grep -q "Access token required"; then
    print_success "Calendar endpoint is working correctly"
else
    print_warning "Calendar endpoint test failed - check server logs"
fi

print_success "Google OAuth setup complete!"
print_status "Your calendar integration should now work on https://dev.tailapp.ai"
print_status "Google OAuth credentials:"
print_status "  Client ID: $GOOGLE_CLIENT_ID"
print_status "  Redirect URI: $GOOGLE_REDIRECT_URI"





