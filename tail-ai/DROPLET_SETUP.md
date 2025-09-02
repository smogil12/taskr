# DigitalOcean Droplet Database Setup

## Overview

This guide shows you how to set up PostgreSQL databases on your existing DigitalOcean droplet for staging and production environments.

## Benefits of Using Your Droplet

- **Cost-effective**: No additional monthly fees for managed databases
- **Full control**: Complete control over database configuration
- **Familiar environment**: You already know your droplet setup
- **Easy backup**: Use your existing backup strategy

## Prerequisites

- DigitalOcean droplet with root/sudo access
- SSH access to your droplet
- Basic knowledge of Linux commands

## Step-by-Step Setup

### Step 1: Connect to Your Droplet

```bash
ssh root@your-droplet-ip
# or
ssh your-username@your-droplet-ip
```

### Step 2: Install PostgreSQL

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### Step 3: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create databases
CREATE DATABASE tail_ai_staging;
CREATE DATABASE tail_ai_production;

# Create users
CREATE USER staging_user WITH PASSWORD 'your-secure-staging-password';
CREATE USER production_user WITH PASSWORD 'your-secure-production-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tail_ai_staging TO staging_user;
GRANT ALL PRIVILEGES ON DATABASE tail_ai_production TO production_user;

# Exit PostgreSQL
\q
```

### Step 4: Configure PostgreSQL for Remote Connections

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Find and uncomment/modify these lines:
listen_addresses = '*'
port = 5432
```

```bash
# Edit authentication configuration
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add these lines at the end:
host    tail_ai_staging     staging_user     0.0.0.0/0               md5
host    tail_ai_production  production_user  0.0.0.0/0               md5
```

### Step 5: Configure Firewall

```bash
# Allow PostgreSQL port
sudo ufw allow 5432

# Check firewall status
sudo ufw status
```

### Step 6: Restart PostgreSQL

```bash
sudo systemctl restart postgresql
```

### Step 7: Test Connection

```bash
# Test local connection
psql -h localhost -U staging_user -d tail_ai_staging

# Test from your local machine
psql -h your-droplet-ip -U staging_user -d tail_ai_staging
```

## Environment Configuration

### Update Your Environment Files

```bash
# backend/.env.staging
DATABASE_URL="postgresql://staging_user:your-secure-staging-password@your-droplet-ip:5432/tail_ai_staging"

# backend/.env.production
DATABASE_URL="postgresql://production_user:your-secure-production-password@your-droplet-ip:5432/tail_ai_production"
```

### Run Migrations

```bash
# Test staging connection
./scripts/check-db.sh staging

# Run staging migrations
npm run db:migrate:staging

# Test production connection
./scripts/check-db.sh production

# Run production migrations
npm run db:migrate:prod
```

## Security Best Practices

### 1. Use Strong Passwords

```bash
# Generate secure passwords
openssl rand -base64 32
```

### 2. Restrict Access (Optional)

Instead of allowing all IPs, restrict to specific IPs:

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Replace 0.0.0.0/0 with your specific IPs:
host    tail_ai_staging     staging_user     your-ip/32               md5
host    tail_ai_production  production_user  your-ip/32               md5
```

### 3. Enable SSL (Recommended)

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Add/modify these lines:
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
```

### 4. Regular Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-databases.sh

# Add this content:
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup staging
pg_dump -h localhost -U staging_user tail_ai_staging > $BACKUP_DIR/staging_$DATE.sql

# Backup production
pg_dump -h localhost -U production_user tail_ai_production > $BACKUP_DIR/production_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

# Make executable
sudo chmod +x /usr/local/bin/backup-databases.sh

# Add to crontab for daily backups
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-databases.sh
```

## Monitoring and Maintenance

### 1. Check Database Status

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check database sizes
sudo -u postgres psql -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;"
```

### 2. Performance Monitoring

```bash
# Check slow queries
sudo -u postgres psql -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check table sizes
sudo -u postgres psql -d tail_ai_staging -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### 3. Regular Maintenance

```bash
# Vacuum and analyze databases
sudo -u postgres psql -d tail_ai_staging -c "VACUUM ANALYZE;"
sudo -u postgres psql -d tail_ai_production -c "VACUUM ANALYZE;"

# Check for long-running queries
sudo -u postgres psql -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"
```

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port is listening
sudo netstat -tlnp | grep 5432

# Check firewall
sudo ufw status

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Permission Issues

```bash
# Check user permissions
sudo -u postgres psql -c "\du"

# Grant additional permissions if needed
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tail_ai_staging TO staging_user;"
```

### Performance Issues

```bash
# Check active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check database locks
sudo -u postgres psql -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Check disk usage
df -h
```

## Cost Comparison

### Your Droplet Setup
- **Cost**: $0 additional (uses existing droplet)
- **Control**: Full control
- **Maintenance**: Manual (backups, updates, monitoring)

### Managed Database Alternative
- **Cost**: $15-60/month additional
- **Control**: Limited
- **Maintenance**: Automated

## Next Steps

1. **Set up the databases** following the steps above
2. **Configure your environment files** with the connection strings
3. **Test connections** using the provided scripts
4. **Set up automated backups**
5. **Configure monitoring** (optional)
6. **Deploy your application**

## Useful Commands

```bash
# Quick database status check
./scripts/check-db.sh staging
./scripts/check-db.sh production

# Run migrations
npm run db:migrate:staging
npm run db:migrate:prod

# Open database GUI
./scripts/db-manager.sh studio staging
./scripts/db-manager.sh studio production
```

This setup gives you full control over your databases while using your existing infrastructure. It's cost-effective and flexible for your needs!
