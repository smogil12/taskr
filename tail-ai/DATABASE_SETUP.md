# Database Setup Guide

## Overview

This project uses PostgreSQL with Prisma ORM and supports multiple environments: local, staging, and production.

## Current Setup

- **Database**: PostgreSQL 15 (Alpine)
- **ORM**: Prisma
- **Local Development**: Docker Compose with PostgreSQL container
- **Schema**: Comprehensive schema with Users, Projects, Tasks, TimeEntries, Clients, Organizations, and Subscriptions

## Environment Configuration

### 1. Local Development

**Database**: Uses Docker Compose container
- Host: `localhost:5432`
- Database: `tail_ai_dev`
- User: `tail_ai_user`
- Password: `tail_ai_password`

**Environment Variables** (create `.env.local` in backend directory):
```bash
NODE_ENV=development
DATABASE_URL="postgresql://tail_ai_user:tail_ai_password@localhost:5432/tail_ai_dev"
JWT_SECRET="local-development-jwt-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
STRIPE_SECRET_KEY="sk_test_your_local_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_local_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"
```

### 2. Staging Environment

**Database**: External PostgreSQL instance (e.g., AWS RDS, DigitalOcean, etc.)
- Create a separate database: `tail_ai_staging`
- Use staging-specific credentials

**Environment Variables** (create `.env.staging` in backend directory):
```bash
NODE_ENV=staging
DATABASE_URL="postgresql://staging_user:staging_password@staging-db-host:5432/tail_ai_staging"
JWT_SECRET="staging-jwt-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="https://staging.yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
STRIPE_SECRET_KEY="sk_test_your_staging_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_staging_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"
```

### 3. Production Environment

**Database**: Production PostgreSQL instance (e.g., AWS RDS, Google Cloud SQL, etc.)
- Create a separate database: `tail_ai_production`
- Use production-specific credentials
- Enable SSL connections
- Configure backup and monitoring

**Environment Variables** (create `.env.production` in backend directory):
```bash
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:prod_password@prod-db-host:5432/tail_ai_production?sslmode=require"
JWT_SECRET="production-jwt-secret-key-change-this-to-very-secure-key"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
STRIPE_SECRET_KEY="sk_live_your_production_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"
```

## Setup Commands

### Local Development
```bash
# Start local database
cd tail-ai/infrastructure
docker-compose up -d postgres

# Run migrations
cd ../backend
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

### Staging/Production
```bash
# Set environment
export NODE_ENV=staging  # or production

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Start server
npm start
```

## Database Schema

The current schema includes:
- **Users**: Authentication and subscription management
- **Clients**: Client management for projects
- **Organizations**: Multi-tenant organization support
- **Projects**: Project management with time allocation
- **Tasks**: Task management with time tracking
- **TimeEntries**: Detailed time tracking
- **Subscriptions**: Stripe subscription management

## Migration Strategy

1. **Local**: Use `prisma migrate dev` for development
2. **Staging**: Use `prisma migrate deploy` for staging deployments
3. **Production**: Use `prisma migrate deploy` for production deployments

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Credentials**: Use strong, unique passwords for each environment
3. **SSL**: Enable SSL connections for staging and production
4. **Backups**: Implement regular backups for staging and production
5. **Monitoring**: Set up database monitoring and alerting

## Recommended Database Providers

### Local Development
- Docker Compose (current setup)

### Staging
- AWS RDS PostgreSQL (free tier available)
- DigitalOcean Managed PostgreSQL
- Railway PostgreSQL
- Supabase

### Production
- AWS RDS PostgreSQL
- Google Cloud SQL
- Azure Database for PostgreSQL
- DigitalOcean Managed PostgreSQL

## Next Steps

1. Create the environment files as shown above
2. Set up staging and production database instances
3. Configure your deployment pipeline to use the appropriate environment file
4. Set up database backups and monitoring
5. Test migrations in staging before production deployment

