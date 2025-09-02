# Railway Database Setup Guide

## Why Railway?

- **Super simple setup** (5 minutes)
- **Affordable** ($5/month for staging)
- **No credit card required** for small databases
- **Automatic backups**
- **Easy to scale**

## Step-by-Step Setup

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Verify your email

### Step 2: Create Database

1. **Click "New Project"**
2. **Select "Provision PostgreSQL"**
3. **Wait for database to be created** (1-2 minutes)

### Step 3: Get Connection Details

1. **Click on your PostgreSQL service**
2. **Go to "Connect" tab**
3. **Copy the connection string** (looks like this):
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```

### Step 4: Update Environment File

1. **Open your terminal**
2. **Run the setup script**:
   ```bash
   ./scripts/setup-environments.sh staging
   ```

3. **Edit the staging environment file**:
   ```bash
   # Edit backend/.env.staging
   nano backend/.env.staging
   ```

4. **Replace the DATABASE_URL** with your Railway connection string:
   ```bash
   DATABASE_URL="postgresql://postgres:your-password@containers-us-west-xxx.railway.app:5432/railway"
   ```

### Step 5: Test Connection

1. **Run database health check**:
   ```bash
   ./scripts/check-db.sh staging
   ```

2. **Run migrations**:
   ```bash
   npm run db:migrate:staging
   ```

### Step 6: Deploy to Staging

1. **Deploy your application**:
   ```bash
   ./scripts/deploy.sh staging
   ```

## Creating Production Database

### Option 1: Same Railway Account (Easier)

1. **Create another PostgreSQL service** in Railway
2. **Name it "tail-ai-production"**
3. **Get the connection string**
4. **Update backend/.env.production**

### Option 2: Different Provider (Recommended for Production)

For production, consider using a more robust provider:

1. **DigitalOcean** ($60/month) - Good balance
2. **AWS RDS** ($100+/month) - Enterprise features
3. **Google Cloud SQL** ($80+/month) - Google ecosystem

## Railway Pricing

### Free Tier
- **$5 credit** per month
- **Good for small staging databases**

### Paid Plans
- **$5/month** - Basic database
- **$20/month** - Larger database
- **$50/month** - High-performance database

## Railway Features

### What's Included
- ✅ **Automatic backups**
- ✅ **SSL connections**
- ✅ **Connection pooling**
- ✅ **Monitoring dashboard**
- ✅ **Easy scaling**

### What's Not Included
- ❌ **Advanced monitoring**
- ❌ **Read replicas**
- ❌ **Multi-region**
- ❌ **Advanced security**

## Troubleshooting

### Connection Issues
```bash
# Check if database is running
./scripts/check-db.sh staging

# Test connection manually
psql "your-connection-string"
```

### Migration Issues
```bash
# Reset and re-run migrations
cd backend
NODE_ENV=staging npx prisma migrate reset --force
NODE_ENV=staging npm run db:migrate
```

### Performance Issues
- **Upgrade your Railway plan**
- **Add database indexes**
- **Optimize queries**

## Next Steps

1. **Set up staging database** (Railway)
2. **Test your application** thoroughly
3. **Set up production database** (Railway or better provider)
4. **Configure monitoring**
5. **Set up automated deployments**

## Migration to Better Provider

When you're ready to move to a more robust provider:

```bash
# Export from Railway
pg_dump "railway-connection-string" > backup.sql

# Import to new provider
psql "new-provider-connection-string" < backup.sql
```

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Railway Support**: [railway.app/support](https://railway.app/support)

