# Backend Deployment Script

This script helps deploy backend changes from local → staging → production on DigitalOcean, avoiding common issues we encountered.

## Prerequisites

- SSH access to DigitalOcean server: `root@167.99.115.97`
- Local backend code in `/Users/spencermogil/taskr/tail-ai/backend/`
- Staging backend at `/root/taskr-backend/`
- Production backend at `/root/taskr-backend-prod/`
- TypeScript compiled locally before deployment

## 0. TypeScript Compilation (CRITICAL STEP)

**⚠️ ALWAYS compile TypeScript files locally before deploying to DigitalOcean!**

### When Compilation is Required

You MUST compile TypeScript files locally in these scenarios:

1. **New TypeScript files added** (e.g., `jwtSecurity.ts`, new utilities)
2. **Existing TypeScript files modified** (e.g., `auth.ts`, `middleware/auth.ts`)
3. **Type definitions changed** (e.g., new interfaces, enums)
4. **Import/export statements added** (e.g., new dependencies)
5. **Any changes to `.ts` files in `src/` directory**

### Compilation Commands

```bash
# Navigate to backend directory
cd /Users/spencermogil/taskr/tail-ai/backend

# Compile TypeScript to JavaScript
npm run build

# Verify compilation succeeded
ls -la dist/
```

### What Gets Compiled

- `src/*.ts` → `dist/*.js`
- `src/utils/*.ts` → `dist/utils/*.js`
- `src/routes/*.ts` → `dist/routes/*.js`
- `src/middleware/*.ts` → `dist/middleware/*.js`

### Common Compilation Errors

**Error: "Cannot find module"**
```bash
# Install missing dependencies
npm install

# Regenerate Prisma client
npx prisma generate
```

**Error: "Type errors"**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type errors before building
npm run build
```

### Verification Steps

After compilation, verify these files exist:
```bash
# Check critical compiled files
ls -la dist/utils/jwtSecurity.js
ls -la dist/routes/auth.js
ls -la dist/middleware/auth.js
```

### Why This is Critical

The DigitalOcean server runs the **compiled JavaScript files** from the `dist/` directory, not the TypeScript source files. If you don't compile locally:

- ❌ **New files won't exist** on the server
- ❌ **Server will crash** with "Cannot find module" errors
- ❌ **PM2 will fail to start** the application
- ❌ **Database operations will fail** due to missing compiled code

### Real Example from Recent Issue

**Problem**: Added `jwtSecurity.ts` but didn't compile locally
**Result**: Server crashed with "Cannot find module '../utils/jwtSecurity'"
**Solution**: Compiled locally with `npm run build`, then deployed

```bash
# What happened:
1. Added src/utils/jwtSecurity.ts ✅
2. Updated src/routes/auth.ts to import it ✅
3. Deployed to server ❌ (forgot to compile)
4. Server crashed ❌ (jwtSecurity.js didn't exist)
5. Fixed: npm run build, then deployed ✅
```

## 1. Deploy Local Changes to Staging

### Step 1: Compile TypeScript (REQUIRED)
```bash
# Navigate to backend directory
cd /Users/spencermogil/taskr/tail-ai/backend

# Compile TypeScript to JavaScript
npm run build

# Verify compilation succeeded
ls -la dist/
```

### Step 2: Copy Backend Code (Including compiled dist/ directory)
```bash
# From local machine - now includes compiled dist/ directory
rsync -avz --exclude='.env*' --exclude='node_modules' \
  /Users/spencermogil/taskr/tail-ai/backend/ \
  root@167.99.115.97:/root/taskr-backend/
```

### Step 3: Install Dependencies and Regenerate Prisma Client
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && npm install && npx prisma generate"
```

### Step 4: Apply Database Migrations (if any)
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma migrate deploy"
```

### Step 5: Restart Staging Backend
```bash
ssh root@167.99.115.97 "pm2 restart taskr-backend"
```

### Step 6: Verify Staging is Working
```bash
# Check logs
ssh root@167.99.115.97 "pm2 logs taskr-backend --lines 10"

# Test API endpoint
curl -s "http://167.99.115.97:3001/health"
```

## 2. Deploy Staging Changes to Production

### Step 1: Copy Staging Code to Production (Excluding .env files)
```bash
ssh root@167.99.115.97 "rsync -avz --exclude='.env*' --exclude='node_modules' --exclude='dist' \
  /root/taskr-backend/ \
  /root/taskr-backend-prod/"
```

### Step 2: Install Dependencies and Regenerate Prisma Client
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend-prod && npm install && npx prisma generate"
```

### Step 3: Apply Database Migrations (if any)
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend-prod && npx prisma migrate deploy"
```

### Step 4: Restart Production Backend
```bash
ssh root@167.99.115.97 "pm2 restart taskr-backend-prod"
```

### Step 5: Verify Production is Working
```bash
# Check logs
ssh root@167.99.115.97 "pm2 logs taskr-backend-prod --lines 10"

# Test API endpoint
curl -s "http://167.99.115.97:3002/health"
```

## 3. Troubleshooting Common Issues

### Issue 1: JWT Secret Mismatch
**Symptoms**: 401 Unauthorized errors, authentication failures
**Cause**: Backend using wrong JWT secret
**Fix**:
```bash
# Check current JWT secret
ssh root@167.99.115.97 "cd /root/taskr-backend && cat .env | grep JWT_SECRET"

# Update JWT secret (use staging secret for staging, production secret for production)
ssh root@167.99.115.97 "cd /root/taskr-backend && sed -i 's/JWT_SECRET=.*/JWT_SECRET=\"staging_e5520806aecc5c24eca04c1405cba447268970c7a31d513d554c5d710976e830\"/' .env"
```

### Issue 2: Database Connection Errors
**Symptoms**: "Authentication failed against database server" errors
**Cause**: Wrong database credentials in .env file
**Fix**:
```bash
# Check database URL
ssh root@167.99.115.97 "cd /root/taskr-backend && cat .env | grep DATABASE_URL"

# Update database URL (staging)
ssh root@167.99.115.97 "cd /root/taskr-backend && sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"postgresql://staging_user:HedcDUS1Ov3rZKXVDeIBaz79y@167.99.115.97:5432/taskr_staging\"|' .env"

# Update database URL (production)
ssh root@167.99.115.97 "cd /root/taskr-backend-prod && sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"postgresql://production_user:nLpg25r75a9VmK5mIP9hQ07t5@167.99.115.97:5432/taskr_production\"|' .env"
```

### Issue 3: Missing Database Schema Fields
**Symptoms**: "Unknown field 'createdByUser' for include statement" errors
**Cause**: Database schema out of sync with Prisma schema
**Fix**:
```bash
# Apply migrations
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma migrate deploy"

# Or manually create missing fields
ssh root@167.99.115.97 "psql 'postgresql://staging_user:HedcDUS1Ov3rZKXVDeIBaz79y@167.99.115.97:5432/taskr_staging' -c \"ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);\""
```

### Issue 4: CORS Errors
**Symptoms**: CORS policy errors in browser
**Cause**: Wrong CORS_ORIGIN in .env file
**Fix**:
```bash
# Update CORS origin (staging)
ssh root@167.99.115.97 "cd /root/taskr-backend && sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=\"https://dev.tailapp.ai\"|' .env"

# Update CORS origin (production)
ssh root@167.99.115.97 "cd /root/taskr-backend-prod && sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=\"https://go.tailapp.ai\"|' .env"
```

### Issue 5: Frontend URL Mismatch
**Symptoms**: Email links pointing to localhost or wrong domain
**Cause**: Wrong FRONTEND_URL in .env file
**Fix**:
```bash
# Update frontend URL (staging)
ssh root@167.99.115.97 "cd /root/taskr-backend && sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=\"https://dev.tailapp.ai\"|' .env"

# Update frontend URL (production)
ssh root@167.99.115.97 "cd /root/taskr-backend-prod && sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=\"https://go.tailapp.ai\"|' .env"
```

### Issue 6: Rate Limiting Too Aggressive
**Symptoms**: 429 "Too many requests" errors
**Cause**: Rate limiting too strict in production
**Fix**:
```bash
# Increase rate limit (production)
ssh root@167.99.115.97 "cd /root/taskr-backend-prod && sed -i 's|RATE_LIMIT_MAX_REQUESTS=.*|RATE_LIMIT_MAX_REQUESTS=1000|' .env"
```

### Issue 7: PM2 Process Not Starting
**Symptoms**: Backend not responding, PM2 shows error status
**Fix**:
```bash
# Check PM2 status
ssh root@167.99.115.97 "pm2 status"

# Check logs for errors
ssh root@167.99.115.97 "pm2 logs taskr-backend --lines 20"

# Restart if needed
ssh root@167.99.115.97 "pm2 restart taskr-backend"
```

## 4. Environment-Specific Configuration

### Staging Backend (.env)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://staging_user:HedcDUS1Ov3rZKXVDeIBaz79y@167.99.115.97:5432/taskr_staging"
JWT_SECRET="staging_e5520806aecc5c24eca04c1405cba447268970c7a31d513d554c5d710976e830"
CORS_ORIGIN="https://dev.tailapp.ai"
FRONTEND_URL="https://dev.tailapp.ai"
```

### Production Backend (.env)
```bash
NODE_ENV=production
PORT=3002
DATABASE_URL="postgresql://production_user:nLpg25r75a9VmK5mIP9hQ07t5@167.99.115.97:5432/taskr_production"
JWT_SECRET="production_e5520806aecc5c24eca04c1405cba447268970c7a31d513d554c5d710976e830"
CORS_ORIGIN="https://go.tailapp.ai"
FRONTEND_URL="https://go.tailapp.ai"
```

## 5. Quick Health Checks

### Test Staging
```bash
curl -s "http://167.99.115.97:3001/health"
curl -s "http://167.99.115.97:3001/api/team-members/invite/TEST_ID"
```

### Test Production
```bash
curl -s "http://167.99.115.97:3002/health"
curl -s "http://167.99.115.97:3002/api/team-members/invite/TEST_ID"
```

## 6. Rollback Procedure

If something breaks after deployment:

### Rollback Code
```bash
# Copy previous working version from backup
ssh root@167.99.115.97 "cp -r /root/taskr-backend-backup /root/taskr-backend"
ssh root@167.99.115.97 "pm2 restart taskr-backend"
```

### Rollback Database (if needed)
```bash
# Restore from backup
ssh root@167.99.115.97 "psql 'postgresql://staging_user:HedcDUS1Ov3rZKXVDeIBaz79y@167.99.115.97:5432/taskr_staging' < /root/db_backup_staging.sql"
```

## 7. Best Practices

1. **Always test on staging first** before deploying to production
2. **Keep .env files separate** - never copy them between environments
3. **Backup before major changes** - especially database migrations
4. **Check logs after each step** - catch issues early
5. **Test API endpoints** - verify functionality works
6. **Monitor PM2 status** - ensure processes are running
7. **Use specific commit messages** - make rollbacks easier

## 8. Common Commands Reference

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs taskr-backend --lines 20
pm2 logs taskr-backend-prod --lines 20

# Restart services
pm2 restart taskr-backend
pm2 restart taskr-backend-prod

# Check environment variables
cat .env | grep JWT_SECRET
cat .env | grep DATABASE_URL

# Test database connection
psql 'postgresql://staging_user:HedcDUS1Ov3rZKXVDeIBaz79y@167.99.115.97:5432/taskr_staging' -c "SELECT 1;"
```
