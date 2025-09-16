# Production Deployment Guide Template

This guide documents the deployment process for setting up staging and production backends on DigitalOcean.

## Table of Contents
- [Overview](#overview)
- [DigitalOcean Server Structure](#digitalocean-server-structure)
- [Local Development to Staging Deployment](#local-development-to-staging-deployment)
- [Staging to Production Backend Setup](#staging-to-production-backend-setup)
- [Database Migrations](#database-migrations)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Environment Configuration](#environment-configuration)

## Overview

We maintain two separate backends on the same DigitalOcean server:
- **Staging Backend** (Port 3001): Used by `dev.tailapp.ai`
- **Production Backend** (Port 3002): Used by `go.tailapp.ai`

Both backends connect to separate databases but share the same server infrastructure.

## DigitalOcean Server Structure

```
/root/
├── taskr-backend/          # Staging Backend (Port 3001)
│   ├── .env               # Staging environment config
│   ├── .env.local         # Local overrides (can cause issues)
│   ├── .env.backup-*      # Backup files
│   ├── dist/              # Compiled JavaScript
│   ├── src/               # TypeScript source
│   ├── prisma/            # Database schema and migrations
│   └── node_modules/      # Dependencies
└── taskr-backend-prod/    # Production Backend (Port 3002)
    ├── .env               # Production environment config
    ├── dist/              # Compiled JavaScript
    ├── src/               # TypeScript source
    ├── prisma/            # Database schema and migrations
    └── node_modules/      # Dependencies
```

## Local Development to Staging Deployment

### 1. Make Changes Locally
```bash
# Work on your local machine
cd /path/to/your/project/backend
# Make changes to TypeScript files
npm run build  # Compile TypeScript to JavaScript
```

### 2. Deploy to Staging Backend
```bash
# Deploy changes to DigitalOcean staging backend
rsync -avz --exclude 'node_modules' --exclude '.env*' /path/to/your/project/backend/ root@YOUR_SERVER_IP:/root/taskr-backend/

# SSH into server and restart staging backend
ssh root@YOUR_SERVER_IP
cd /root/taskr-backend
npm install  # Install any new dependencies
npx prisma generate  # Regenerate Prisma client
pm2 restart taskr-backend
```

### 3. Apply Database Migrations (Staging)
```bash
# On DigitalOcean server
cd /root/taskr-backend
npx prisma migrate deploy  # Apply pending migrations
```

## Staging to Production Backend Setup

### 1. Create Production Backend Folder
```bash
# On DigitalOcean server
mkdir -p /root/taskr-backend-prod
```

### 2. Copy Backend Code to Production
```bash
# From local machine
rsync -avz --exclude 'node_modules' --exclude '.env*' /path/to/your/project/backend/ root@YOUR_SERVER_IP:/root/taskr-backend-prod/
```

### 3. Install Dependencies
```bash
# On DigitalOcean server
cd /root/taskr-backend-prod
npm install
```

### 4. Configure Production Environment
Create `/root/taskr-backend-prod/.env` with your production credentials:
```bash
# Production Environment Configuration
NODE_ENV=production
PORT=3002

# Database Configuration
DATABASE_URL="postgresql://production_user:YOUR_PASSWORD@YOUR_SERVER_IP:5432/taskr_production"

# JWT Configuration
JWT_SECRET="YOUR_PRODUCTION_JWT_SECRET"
JWT_EXPIRES_IN="7d"

# Server Configuration
CORS_ORIGIN="https://your-production-domain.com"

# Rate Limiting (increased for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Stripe Configuration
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="YOUR_STRIPE_WEBHOOK_SECRET"
STRIPE_PRICE_ID_PRO="YOUR_PRO_PLAN_PRICE_ID"
STRIPE_PRICE_ID_ENTERPRISE="YOUR_ENTERPRISE_PLAN_PRICE_ID"

# Email Service (Resend)
RESEND_API_KEY="YOUR_RESEND_API_KEY"
FRONTEND_URL="https://your-production-domain.com"

# Google Calendar Integration
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="https://your-production-domain.com/api/calendar/oauth/callback"
```

### 5. Start Production Backend
```bash
# Generate Prisma client
npx prisma generate

# Start with PM2
pm2 start dist/index.js --name taskr-backend-prod -- --port 3002
```

## Database Migrations

### Staging Database
- **Database**: `taskr_staging`
- **User**: `staging_user`
- **Password**: `YOUR_STAGING_PASSWORD`

### Production Database
- **Database**: `taskr_production`
- **User**: `production_user`
- **Password**: `YOUR_PRODUCTION_PASSWORD`

### Applying Migrations

#### Staging Database
```bash
cd /root/taskr-backend
npx prisma migrate deploy
```

#### Production Database
```bash
cd /root/taskr-backend-prod
npx prisma migrate deploy
```

### Manual Database Updates
If you need to manually verify a user's email:
```bash
# On DigitalOcean server
cd /root/taskr-backend-prod
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyEmail() {
  try {
    const user = await prisma.user.update({
      where: { email: 'user@example.com' },
      data: { isEmailVerified: true }
    });
    console.log('Email verified successfully:', user.email);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.disconnect();
  }
}

verifyEmail();
"
```

## Common Issues and Solutions

### 1. Missing Routes (404 Errors)
**Problem**: API routes return 404 even though they exist in the code.

**Root Cause**: TypeScript changes weren't compiled to JavaScript, so the server is running old code.

**Solution**:
```bash
# Compile locally and upload dist folder
npm run build
scp -r dist/ root@YOUR_SERVER_IP:/root/taskr-backend/
pm2 restart taskr-backend
```

### 2. Prisma Field Errors
**Problem**: `Unknown field 'createdByUser' for include statement on model 'Task'`

**Root Cause**: Prisma client is outdated and doesn't recognize new fields.

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate
pm2 restart taskr-backend
```

### 3. Environment Variable Override Issues
**Problem**: `.env.local` file overrides main `.env` file with wrong credentials.

**Root Cause**: `dotenv` loads `.env.local` after `.env`, overriding staging credentials with local dev credentials.

**Solution**:
```bash
# Update .env.local with correct staging credentials
cd /root/taskr-backend
cp .env .env.local
pm2 restart taskr-backend
```

### 4. Rate Limiting Issues
**Problem**: Server returns 429 "Too many requests" errors.

**Root Cause**: Rate limiting is too aggressive or server has too many restart attempts.

**Solution**:
```bash
# Increase rate limit in .env
RATE_LIMIT_MAX_REQUESTS=1000

# Restart server
pm2 restart taskr-backend
```

### 5. Server Restart Loops
**Problem**: PM2 shows 1400+ restarts due to syntax errors.

**Root Cause**: Syntax errors in compiled JavaScript (e.g., `napp.get` instead of `app.get`).

**Solution**:
```bash
# Check PM2 logs
pm2 logs taskr-backend --lines 10

# Fix syntax errors in source code
# Recompile and redeploy
npm run build
rsync -avz dist/ root@YOUR_SERVER_IP:/root/taskr-backend/dist/
pm2 restart taskr-backend
```

### 6. Database Connection Issues
**Problem**: `Authentication failed against database server`

**Root Cause**: Wrong database credentials in environment files.

**Solution**:
```bash
# Check current environment
grep DATABASE_URL .env

# Update with correct credentials
# For staging: taskr_staging, staging_user
# For production: taskr_production, production_user
```

## Environment Configuration

### Staging Environment (.env)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://staging_user:YOUR_STAGING_PASSWORD@YOUR_SERVER_IP:5432/taskr_staging"
JWT_SECRET="YOUR_STAGING_JWT_SECRET"
FRONTEND_URL="https://dev.your-domain.com"
CORS_ORIGIN="http://127.0.0.1:3000"
```

### Production Environment (.env)
```bash
NODE_ENV=production
PORT=3002
DATABASE_URL="postgresql://production_user:YOUR_PRODUCTION_PASSWORD@YOUR_SERVER_IP:5432/taskr_production"
JWT_SECRET="YOUR_PRODUCTION_JWT_SECRET"
FRONTEND_URL="https://your-production-domain.com"
CORS_ORIGIN="https://your-production-domain.com"
```

## Vercel Configuration

### Environment Variables
- **Dev Site** (`dev.your-domain.com`): `NEXT_PUBLIC_API_URL="http://YOUR_SERVER_IP:3001"`
- **Production Site** (`your-production-domain.com`): `NEXT_PUBLIC_API_URL="http://YOUR_SERVER_IP:3002"`

### Deployment Process
1. Make changes locally
2. Commit and push to feature branch
3. Merge to master branch
4. Trigger Vercel production deployment
5. Update environment variables if needed

## Monitoring and Maintenance

### Check Backend Status
```bash
pm2 status
pm2 logs taskr-backend --lines 10
pm2 logs taskr-backend-prod --lines 10
```

### Health Checks
```bash
# Staging backend
curl http://YOUR_SERVER_IP:3001/health

# Production backend
curl http://YOUR_SERVER_IP:3002/health
```

### Backup Environment Files
```bash
# Create backup before making changes
cp .env .env.backup-$(date +%Y%m%d_%H%M%S)
```

## Best Practices

1. **Always compile locally** before deploying to avoid compilation issues on the server
2. **Test staging environment** before setting up production
3. **Keep environment files backed up** before making changes
4. **Monitor PM2 logs** for errors and restart loops
5. **Use separate databases** for staging and production
6. **Verify database migrations** are applied to both environments
7. **Test both frontend and backend** after deployment

## Troubleshooting Checklist

- [ ] Is the server running? (`pm2 status`)
- [ ] Are there syntax errors in logs? (`pm2 logs`)
- [ ] Is the Prisma client up to date? (`npx prisma generate`)
- [ ] Are environment variables correct? (`cat .env`)
- [ ] Are database migrations applied? (`npx prisma migrate deploy`)
- [ ] Is the compiled code up to date? (check `dist/` folder)
- [ ] Are CORS settings correct for the frontend domain?
- [ ] Is rate limiting too aggressive?
- [ ] Are JWT secrets matching between frontend and backend?
