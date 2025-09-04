# Staging and Production Database Setup Guide

## Overview

This guide walks you through setting up staging and production databases for your Tail-AI application. We'll cover different cloud providers and deployment strategies.

## 🎯 Recommended Approach

1. **Start with a managed database service** (easier to manage, automatic backups, monitoring)
2. **Use the same provider for staging and production** (consistency)
3. **Set up staging first** (test your deployment process)
4. **Use infrastructure as code** when possible

## 🏗️ Database Provider Options

### Option 1: AWS RDS (Recommended)
**Pros**: Fully managed, automatic backups, monitoring, easy scaling
**Cons**: Can be expensive for small projects

#### Setup Steps:
1. **Create AWS Account** and set up billing alerts
2. **Create RDS Instance**:
   ```bash
   # Using AWS CLI (install first: brew install awscli)
   aws rds create-db-instance \
     --db-instance-identifier tail-ai-staging \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --engine-version 15.4 \
     --master-username tail_ai_user \
     --master-user-password "your-secure-password" \
     --allocated-storage 20 \
     --vpc-security-group-ids sg-xxxxxxxxx \
     --db-name tail_ai_staging
   ```

3. **Configure Security Groups** to allow connections from your application
4. **Get connection details** from AWS Console

### Option 2: DigitalOcean Managed Databases
**Pros**: Simple pricing, good performance, easy setup
**Cons**: Fewer advanced features than AWS

#### Setup Steps:
1. **Create DigitalOcean Account**
2. **Create Database Cluster**:
   - Go to DigitalOcean Dashboard → Databases
   - Create PostgreSQL cluster
   - Choose region close to your users
   - Select plan (Basic $15/month for staging, Standard $60/month for production)

3. **Configure Connection**:
   - Get connection string from DigitalOcean dashboard
   - Update your environment files

### Option 3: Railway
**Pros**: Very simple, good for small projects, includes hosting
**Cons**: Less control, newer platform

#### Setup Steps:
1. **Sign up at Railway.app**
2. **Create PostgreSQL service**
3. **Get connection string** from Railway dashboard
4. **Update environment files**

### Option 4: Supabase
**Pros**: PostgreSQL + real-time features, good free tier
**Cons**: More than just a database (includes auth, storage, etc.)

#### Setup Steps:
1. **Sign up at Supabase.com**
2. **Create new project**
3. **Get connection string** from project settings
4. **Update environment files**

## 🔧 Step-by-Step Setup Process

### Step 1: Choose Your Provider
For this guide, I'll use **DigitalOcean** as an example (simple and cost-effective).

### Step 2: Create Staging Database

1. **Sign up for DigitalOcean** (if you haven't already)
2. **Create Database Cluster**:
   - Name: `tail-ai-staging`
   - Engine: PostgreSQL 15
   - Region: Choose closest to your users
   - Size: Basic ($15/month) for staging
   - Database name: `tail_ai_staging`

3. **Configure Connection**:
   - Note down the connection details
   - Create a strong password
   - Whitelist your IP address

### Step 3: Create Production Database

1. **Create Second Database Cluster**:
   - Name: `tail-ai-production`
   - Engine: PostgreSQL 15
   - Region: Same as staging
   - Size: Standard ($60/month) for production
   - Database name: `tail_ai_production`

2. **Configure High Availability** (optional but recommended):
   - Enable automated backups
   - Set up read replicas if needed
   - Configure monitoring alerts

### Step 4: Update Environment Files

Update your environment files with the actual connection strings:

```bash
# backend/.env.staging
DATABASE_URL="postgresql://doadmin:your-password@staging-db-do-user-123456-0.db.ondigitalocean.com:25060/tail_ai_staging?sslmode=require"

# backend/.env.production
DATABASE_URL="postgresql://doadmin:your-password@prod-db-do-user-123456-0.db.ondigitalocean.com:25060/tail_ai_production?sslmode=require"
```

### Step 5: Run Migrations

```bash
# Test staging first
npm run db:migrate:staging

# Then production (after testing)
npm run db:migrate:prod
```

## 🚀 Deployment Strategies

### Strategy 1: Manual Deployment (Simple)

1. **Set up your staging environment**:
   ```bash
   # Deploy to staging server
   git clone your-repo
   npm install
   cp backend/.env.staging backend/.env
   npm run db:migrate
   npm run build
   npm start
   ```

2. **Set up your production environment**:
   ```bash
   # Deploy to production server
   git clone your-repo
   npm install
   cp backend/.env.production backend/.env
   npm run db:migrate
   npm run build
   npm start
   ```

### Strategy 2: Docker Deployment (Recommended)

1. **Create Dockerfile** for your application
2. **Use Docker Compose** for production
3. **Deploy with Docker Swarm** or **Kubernetes**

### Strategy 3: Platform as a Service (Easiest)

1. **Vercel** (for frontend) + **Railway** (for backend + database)
2. **Netlify** (for frontend) + **DigitalOcean App Platform** (for backend)
3. **Heroku** (full-stack, but more expensive)

## 🔒 Security Best Practices

### Database Security
1. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
2. **Enable SSL connections** (most providers do this by default)
3. **Restrict IP access** to your application servers only
4. **Regular security updates** (managed services handle this)
5. **Enable database encryption** at rest

### Environment Security
1. **Never commit .env files** to version control
2. **Use environment variables** in your deployment platform
3. **Rotate secrets regularly**
4. **Use different secrets** for each environment

## 📊 Monitoring and Backups

### Automated Backups
Most managed services provide:
- **Daily automated backups**
- **Point-in-time recovery**
- **Backup retention** (7-30 days typically)

### Monitoring
Set up monitoring for:
- **Database performance** (CPU, memory, connections)
- **Query performance** (slow queries)
- **Disk usage**
- **Connection limits**

### Alerts
Configure alerts for:
- **High CPU usage**
- **Low disk space**
- **Too many connections**
- **Failed queries**

## 💰 Cost Estimation

### DigitalOcean Example:
- **Staging**: Basic plan ($15/month)
- **Production**: Standard plan ($60/month)
- **Total**: ~$75/month

### AWS RDS Example:
- **Staging**: db.t3.micro ($13/month)
- **Production**: db.t3.small ($26/month)
- **Total**: ~$39/month

### Railway Example:
- **Staging**: $5/month
- **Production**: $20/month
- **Total**: ~$25/month

## 🛠️ Automation Scripts

I'll create some scripts to help automate the deployment process:

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Check database status
./scripts/check-db.sh staging
./scripts/check-db.sh production
```

## 📋 Checklist

### Before Going Live:
- [ ] Staging database created and tested
- [ ] Production database created
- [ ] Environment files configured
- [ ] Migrations tested in staging
- [ ] SSL certificates configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security groups configured
- [ ] Load testing completed
- [ ] Rollback plan prepared

### Post-Deployment:
- [ ] Monitor database performance
- [ ] Check application logs
- [ ] Verify all features work
- [ ] Test backup restoration
- [ ] Set up regular maintenance schedule

## 🆘 Troubleshooting

### Common Issues:
1. **Connection refused**: Check security groups/firewall
2. **SSL errors**: Ensure SSL is enabled in connection string
3. **Migration failures**: Check database permissions
4. **Performance issues**: Monitor query performance, add indexes

### Getting Help:
- Provider documentation
- Community forums
- Support tickets (for managed services)
- Stack Overflow

## 🎯 Next Steps

1. **Choose your provider** based on your needs and budget
2. **Set up staging database** first
3. **Test your deployment process**
4. **Set up production database**
5. **Configure monitoring and alerts**
6. **Plan your deployment schedule**

Remember: Start simple, test thoroughly, and scale as needed!
