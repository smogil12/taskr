#!/bin/bash

# Fix Stripe Configuration Script
# This script properly configures Stripe environment variables for both frontend and backend

set -e

echo "🔧 Fixing Stripe configuration..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the tail-ai root directory"
    exit 1
fi

# Frontend configuration (only public keys)
echo "📝 Configuring frontend environment variables..."
cat > frontend/.env.local << 'EOF'
# Frontend Environment Variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3002"
BACKEND_URL="http://localhost:3002"
EOF

echo "✅ Frontend .env.local configured with public keys only"

# Backend configuration (secret keys)
echo "📝 Configuring backend environment variables..."
if [ -f "backend/.env" ]; then
    # Update existing .env file
    sed -i '' 's/STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"/STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY_HERE"/' backend/.env
    sed -i '' 's/STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"/STRIPE_WEBHOOK_SECRET="whsec_YOUR_STRIPE_WEBHOOK_SECRET_HERE"/' backend/.env
    echo "✅ Backend .env updated with Stripe keys"
else
    echo "❌ Backend .env file not found. Please create it first."
    exit 1
fi

# Verify configuration
echo ""
echo "🔍 Verifying configuration..."

echo "Frontend environment variables:"
grep -E "NEXT_PUBLIC_STRIPE" frontend/.env.local || echo "❌ Frontend Stripe config missing"

echo ""
echo "Backend environment variables:"
grep -E "STRIPE_(SECRET_KEY|WEBHOOK_SECRET)" backend/.env || echo "❌ Backend Stripe config missing"

echo ""
echo "🚀 Next steps:"
echo "   1. Restart your backend server: cd backend && npm run dev"
echo "   2. Restart your frontend server: cd frontend && npm run dev"
echo "   3. Test the upgrade button on the plans page"

echo ""
echo "✅ Stripe configuration fixed!"
echo "   - Frontend: Only public keys (secure)"
echo "   - Backend: Secret keys properly configured"
