# Backend Deployment Guide: Local to DigitalOcean Server

This guide documents how to deploy backend changes from your local machine to the DigitalOcean server using `rsync` and update the database with Prisma.

## Prerequisites

- Local backend code in `/Users/spencermogil/taskr/tail-ai/backend/`
- DigitalOcean server access via SSH
- Backend server running on `167.99.115.97`
- PM2 process manager installed on server
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

## 1. Deploy Backend Code with rsync

### Step 1: Compile TypeScript (REQUIRED)
```bash
# Navigate to backend directory
cd /Users/spencermogil/taskr/tail-ai/backend

# Compile TypeScript to JavaScript
npm run build

# Verify compilation succeeded
ls -la dist/
```

### Step 2: Deploy Compiled Code
```bash
# Deploy all files (including compiled dist/ directory)
rsync -avz --delete /Users/spencermogil/taskr/tail-ai/backend/ root@167.99.115.97:/root/taskr-backend/
```

### Command Breakdown
- `-a`: Archive mode (preserves permissions, timestamps, etc.)
- `-v`: Verbose output (shows what files are being transferred)
- `-z`: Compress data during transfer
- `--delete`: Delete files on destination that don't exist in source
- Source: `/Users/spencermogil/taskr/tail-ai/backend/` (local backend directory)
- Destination: `root@167.99.115.97:/root/taskr-backend/` (server backend directory)

### Example Output
```
sent 89869 bytes  received 27694 bytes  13830.94 bytes/sec
total size is 2601352  speedup is 22.13
```

## 2. Install Dependencies on Server

After syncing code, install any new dependencies:

```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && npm install"
```

## 3. Update Database with Prisma

### Generate Prisma Client
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma generate"
```

### Run Database Migrations
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma db push"
```

### Alternative: Run Specific Migration
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma migrate deploy"
```

## 4. Restart Backend Service

### Restart PM2 Process
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && pm2 restart taskr-backend"
```

### Check Service Status
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && pm2 status"
```

### View Logs
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && pm2 logs taskr-backend --lines 10"
```

## 5. Verify Deployment

### Test Health Endpoint
```bash
curl -s "http://167.99.115.97:3001/health"
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-09-15T00:37:27.913Z",
  "environment": "development",
  "database": "Connected"
}
```

## 6. Environment Variables

### Check Current Environment
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && cat .env"
```

### Update Environment Variables
```bash
# Update JWT Secret
ssh root@167.99.115.97 "cd /root/taskr-backend && sed -i 's/JWT_SECRET=.*/JWT_SECRET=\"your-new-jwt-secret\"/' .env"

# Update Database URL
ssh root@167.99.115.97 "cd /root/taskr-backend && sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"postgresql://user:password@host:port/database\"|' .env"

# Update Frontend URL
ssh root@167.99.115.97 "cd /root/taskr-backend && sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=\"https://dev.tailapp.ai\"|' .env"
```

## 7. Complete Deployment Workflow

Here's the complete sequence used in this project:

```bash
# 1. Deploy code
rsync -avz --delete /Users/spencermogil/taskr/tail-ai/backend/ root@167.99.115.97:/root/taskr-backend/

# 2. Install dependencies
ssh root@167.99.115.97 "cd /root/taskr-backend && npm install"

# 3. Generate Prisma client
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma generate"

# 4. Update database
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma db push"

# 5. Restart service
ssh root@167.99.115.97 "cd /root/taskr-backend && pm2 restart taskr-backend"

# 6. Verify deployment
curl -s "http://167.99.115.97:3001/health"
```

## 8. Troubleshooting

### Check PM2 Status
```bash
ssh root@167.99.115.97 "pm2 status"
```

### View Error Logs
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && pm2 logs taskr-backend --err --lines 20"
```

### Check Database Connection
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma db pull"
```

### Restart with Environment Update
```bash
ssh root@167.99.115.97 "cd /root/taskr-backend && pm2 restart taskr-backend --update-env"
```

## 9. Alternative: Git-based Deployment

If you prefer using git instead of rsync:

```bash
# On server
ssh root@167.99.115.97 "cd /root/taskr-backend && git pull origin main"
ssh root@167.99.115.97 "cd /root/taskr-backend && npm install"
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma generate"
ssh root@167.99.115.97 "cd /root/taskr-backend && npx prisma db push"
ssh root@167.99.115.97 "cd /root/taskr-backend && pm2 restart taskr-backend"
```

## Notes

- The `--delete` flag in rsync removes files on the server that don't exist locally
- Always test the health endpoint after deployment
- Environment variables are managed separately from code deployment
- PM2 handles process management and automatic restarts
- Database migrations should be run after code deployment but before service restart
