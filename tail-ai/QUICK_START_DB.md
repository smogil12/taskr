when yogink you f# Quick Start Database Guide

## 🚀 Quick Setup Commands

### Local Development (Recommended for getting started)

```bash
# 1. Set up local environment (one-time setup)
./scripts/setup-environments.sh local

# 2. Start development servers
npm run dev
```

### Alternative: Manual Local Setup

```bash
# 1. Start local database
npm run setup:db

# 2. Run migrations
npm run db:migrate

# 3. Generate Prisma client
npm run db:generate

# 4. Start development
npm run dev
```

## 🗄️ Database Management Commands

### Using the Database Manager Script

```bash
# Run migrations
./scripts/db-manager.sh migrate local

# Open Prisma Studio (database GUI)
./scripts/db-manager.sh studio local

# Check migration status
./scripts/db-manager.sh status local

# Generate Prisma client
./scripts/db-manager.sh generate local
```

### Using NPM Scripts

```bash
# Local environment
npm run db:migrate
npm run db:generate
npm run db:studio

# Staging environment
npm run db:migrate:staging
npm run dev:staging

# Production environment
npm run db:migrate:prod
```

## 🐳 Docker Commands

```bash
# Start local database
npm run docker:up

# Start local + staging databases
npm run docker:up:staging

# Stop all databases
npm run docker:down

# Stop staging database
npm run docker:down:staging
```

## 📊 Database Access

### Local Development
- **Host**: localhost:5432
- **Database**: taskr_dev
- **User**: taskr_user
- **Password**: taskr_password

### Local Staging (Optional)
- **Host**: localhost:5433
- **Database**: taskr_staging
- **User**: taskr_staging_user
- **Password**: taskr_staging_password

### Prisma Studio
- **URL**: http://localhost:5555 (when running `npm run db:studio`)

## 🔧 Environment Files

Create these files in the `backend/` directory:

- `.env.local` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Use the setup script to create them automatically:
```bash
./scripts/setup-environments.sh all
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if Docker is running
docker ps

# Restart database
npm run docker:down
npm run docker:up

# Check database logs
cd infrastructure
docker-compose logs postgres
```

### Migration Issues
```bash
# Reset local database (WARNING: deletes all data)
./scripts/db-manager.sh reset local

# Or manually
cd backend
npx prisma migrate reset --force
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
npm run db:generate

# Or manually
cd backend
npx prisma generate
```

## 📋 Next Steps

1. **Set up staging/production databases** on cloud providers (AWS RDS, DigitalOcean, etc.)
2. **Update environment files** with actual database URLs
3. **Set up database backups** for staging and production
4. **Configure monitoring** and alerting
5. **Test migrations** in staging before production deployment

## 🔗 Useful Links

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

