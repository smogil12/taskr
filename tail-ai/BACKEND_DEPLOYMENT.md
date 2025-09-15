# Backend Deployment Guide: Local to DigitalOcean Server

This guide documents how to deploy backend changes from your local machine to the DigitalOcean server using `rsync` and update the database with Prisma.

## Prerequisites

- Local backend code in `/Users/spencermogil/taskr/tail-ai/backend/`
- DigitalOcean server access via SSH
- Backend server running on `167.99.115.97`
- PM2 process manager installed on server

## 1. Deploy Backend Code with rsync

### Basic rsync Command
```bash
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
