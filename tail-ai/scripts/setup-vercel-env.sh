#!/bin/bash

# Script to set up Vercel environment variables for email service
# Run this script to add the Resend API key to your Vercel projects

echo "🚀 Setting up Vercel environment variables for email service..."

# Resend API Key
RESEND_API_KEY="re_g5M8foZk_ELF1mUPd1zsqNXK5k3dbB5K1"

# Frontend URL for email links
FRONTEND_URL_PREVIEW="https://dev.tailapp.ai"
FRONTEND_URL_PRODUCTION="https://go.tailapp.ai"

echo "📧 Adding Resend API key to Vercel projects..."

# Add to preview environment
echo "Setting up preview environment..."
vercel env add RESEND_API_KEY preview <<< "$RESEND_API_KEY"
vercel env add FRONTEND_URL preview <<< "$FRONTEND_URL_PREVIEW"
vercel env add NEXT_PUBLIC_APP_URL preview <<< "$FRONTEND_URL_PREVIEW"
vercel env add NEXT_PUBLIC_API_URL preview <<< "$FRONTEND_URL_PREVIEW/api"
vercel env add BACKEND_URL preview <<< "$FRONTEND_URL_PREVIEW/api"

# Add to production environment
echo "Setting up production environment..."
vercel env add RESEND_API_KEY production <<< "$RESEND_API_KEY"
vercel env add FRONTEND_URL production <<< "$FRONTEND_URL_PRODUCTION"
vercel env add NEXT_PUBLIC_APP_URL production <<< "$FRONTEND_URL_PRODUCTION"
vercel env add NEXT_PUBLIC_API_URL production <<< "$FRONTEND_URL_PRODUCTION/api"
vercel env add BACKEND_URL production <<< "$FRONTEND_URL_PRODUCTION/api"

echo "✅ Environment variables added successfully!"
echo ""
echo "📋 Summary of added variables:"
echo "  - RESEND_API_KEY: $RESEND_API_KEY"
echo "  - Preview Environment (dev.tailapp.ai):"
echo "    - FRONTEND_URL: $FRONTEND_URL_PREVIEW"
echo "    - NEXT_PUBLIC_APP_URL: $FRONTEND_URL_PREVIEW"
echo "    - NEXT_PUBLIC_API_URL: $FRONTEND_URL_PREVIEW/api"
echo "    - BACKEND_URL: $FRONTEND_URL_PREVIEW/api"
echo "  - Production Environment (go.tailapp.ai):"
echo "    - FRONTEND_URL: $FRONTEND_URL_PRODUCTION"
echo "    - NEXT_PUBLIC_APP_URL: $FRONTEND_URL_PRODUCTION"
echo "    - NEXT_PUBLIC_API_URL: $FRONTEND_URL_PRODUCTION/api"
echo "    - BACKEND_URL: $FRONTEND_URL_PRODUCTION/api"
echo ""
echo "🔄 Don't forget to redeploy your backend after adding these variables!"
echo "   You can do this by running: vercel --prod"
