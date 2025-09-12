#!/bin/bash

# Setup Stripe Environment Variables for Frontend
# This script creates the necessary .env.local file for the frontend with Stripe configuration

set -e

echo "🔧 Setting up Stripe environment variables for frontend..."

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the tail-ai root directory"
    exit 1
fi

# Frontend directory
FRONTEND_DIR="frontend"
ENV_FILE="$FRONTEND_DIR/.env.local"

# Check if .env.local already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env.local already exists in frontend directory"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Create the .env.local file
cat > "$ENV_FILE" << 'EOF'
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE"
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY_HERE"
STRIPE_PRODUCT_ID="prod_RSpk9sbDrDqZSu"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3002"
EOF

echo "✅ Created $ENV_FILE with Stripe configuration"

# Make sure the file has proper permissions
chmod 600 "$ENV_FILE"

echo "🔧 Environment variables configured:"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Set"
echo "   - STRIPE_SECRET_KEY: Set"
echo "   - STRIPE_PRODUCT_ID: Set"
echo "   - STRIPE_WEBHOOK_SECRET: Set (placeholder)"
echo "   - NEXT_PUBLIC_APP_URL: http://localhost:3000"
echo "   - NEXT_PUBLIC_API_URL: http://localhost:3002"

echo ""
echo "🚀 Next steps:"
echo "   1. Restart your frontend development server"
echo "   2. Test the upgrade button on the plans page"
echo "   3. Update STRIPE_WEBHOOK_SECRET with your actual webhook secret if needed"

echo ""
echo "✅ Stripe environment setup complete!"
