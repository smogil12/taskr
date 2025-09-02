#!/bin/bash

# DigitalOcean Droplet PostgreSQL Setup Script
# This script helps set up PostgreSQL on your existing DigitalOcean droplet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to setup PostgreSQL on droplet
setup_postgresql() {
    local droplet_ip=$1
    local ssh_user=${2:-root}
    
    print_status "Setting up PostgreSQL on your DigitalOcean droplet..."
    print_status "Droplet IP: $droplet_ip"
    print_status "SSH User: $ssh_user"
    
    # Generate secure passwords
    local staging_password=$(generate_password)
    local production_password=$(generate_password)
    
    print_status "Generated secure passwords for databases"
    
    # Create setup script for remote execution
    cat > /tmp/setup_postgresql.sh << EOF
#!/bin/bash
set -e

# Update package list
apt update

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create databases and users
sudo -u postgres psql << EOSQL
CREATE DATABASE taskr_staging;
CREATE DATABASE taskr_production;
CREATE USER staging_user WITH PASSWORD '$staging_password';
CREATE USER production_user WITH PASSWORD '$production_password';
GRANT ALL PRIVILEGES ON DATABASE taskr_staging TO staging_user;
GRANT ALL PRIVILEGES ON DATABASE taskr_production TO production_user;
EOSQL

# Configure PostgreSQL for remote connections
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Add authentication rules
echo "host    taskr_staging     staging_user     0.0.0.0/0               md5" >> /etc/postgresql/*/main/pg_hba.conf
echo "host    taskr_production  production_user  0.0.0.0/0               md5" >> /etc/postgresql/*/main/pg_hba.conf

# Configure firewall
ufw allow 5432

# Restart PostgreSQL
systemctl restart postgresql

echo "PostgreSQL setup completed successfully!"
EOF
    
    # Copy script to droplet and execute
    print_status "Copying setup script to droplet..."
    scp /tmp/setup_postgresql.sh $ssh_user@$droplet_ip:/tmp/
    
    print_status "Executing setup script on droplet..."
    ssh $ssh_user@$droplet_ip "chmod +x /tmp/setup_postgresql.sh && /tmp/setup_postgresql.sh"
    
    # Clean up
    rm /tmp/setup_postgresql.sh
    
    # Create environment files
    print_status "Creating environment files..."
    
    # Staging environment
    cat > backend/.env.staging << EOF
# Staging Environment - DigitalOcean Droplet
NODE_ENV=staging

# Database - Your Droplet
DATABASE_URL="postgresql://staging_user:$staging_password@$droplet_ip:5432/taskr_staging"

# JWT
JWT_SECRET="staging-jwt-secret-key-$(date +%s)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
CORS_ORIGIN="https://staging.yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (Test Keys for Staging)
STRIPE_SECRET_KEY="sk_test_your_staging_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_staging_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"
EOF
    
    # Production environment
    cat > backend/.env.production << EOF
# Production Environment - DigitalOcean Droplet
NODE_ENV=production

# Database - Your Droplet
DATABASE_URL="postgresql://production_user:$production_password@$droplet_ip:5432/taskr_production"

# JWT
JWT_SECRET="production-jwt-secret-key-$(date +%s)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
CORS_ORIGIN="https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (Live Keys for Production)
STRIPE_SECRET_KEY="sk_live_your_production_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_production_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"
EOF
    
    print_success "Environment files created!"
    print_status "Staging database: taskr_staging"
    print_status "Production database: taskr_production"
    print_status "Droplet IP: $droplet_ip"
    
    # Test connections
    print_status "Testing database connections..."
    
    if ./scripts/check-db.sh staging; then
        print_success "Staging database connection successful!"
    else
        print_warning "Staging database connection failed. Please check your setup."
    fi
    
    if ./scripts/check-db.sh production; then
        print_success "Production database connection successful!"
    else
        print_warning "Production database connection failed. Please check your setup."
    fi
    
    print_success "Droplet setup completed!"
    print_status "Next steps:"
    print_status "1. Run migrations: npm run db:migrate:staging"
    print_status "2. Run migrations: npm run db:migrate:prod"
    print_status "3. Deploy your application: ./scripts/deploy.sh staging"
}

# Function to show help
show_help() {
    echo "DigitalOcean Droplet PostgreSQL Setup Script"
    echo ""
    echo "Usage: $0 [DROPLET_IP] [SSH_USER]"
    echo ""
    echo "Arguments:"
    echo "  DROPLET_IP  IP address of your DigitalOcean droplet"
    echo "  SSH_USER    SSH user (default: root)"
    echo ""
    echo "Examples:"
    echo "  $0 192.168.1.100           # Use root user"
    echo "  $0 192.168.1.100 ubuntu    # Use ubuntu user"
    echo ""
    echo "Prerequisites:"
    echo "  - SSH access to your droplet"
    echo "  - Sudo privileges on the droplet"
    echo "  - SSH key or password authentication"
    echo ""
    echo "What this script does:"
    echo "  1. Installs PostgreSQL on your droplet"
    echo "  2. Creates staging and production databases"
    echo "  3. Creates database users with secure passwords"
    echo "  4. Configures remote connections"
    echo "  5. Sets up firewall rules"
    echo "  6. Creates environment files"
    echo "  7. Tests database connections"
    echo ""
    echo "Security Notes:"
    echo "  - Uses secure randomly generated passwords"
    echo "  - Configures firewall to allow PostgreSQL connections"
    echo "  - Sets up proper database permissions"
    echo ""
    echo "After running this script:"
    echo "  - Run migrations: npm run db:migrate:staging"
    echo "  - Run migrations: npm run db:migrate:prod"
    echo "  - Deploy: ./scripts/deploy.sh staging"
}

# Main script logic
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

droplet_ip=$1
ssh_user=${2:-root}

# Validate IP address format
if ! [[ $droplet_ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    print_error "Invalid IP address format: $droplet_ip"
    exit 1
fi

# Check if SSH is available
if ! command_exists ssh; then
    print_error "SSH command not found. Please install SSH client."
    exit 1
fi

# Test SSH connection
print_status "Testing SSH connection to $droplet_ip..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $ssh_user@$droplet_ip "echo 'SSH connection successful'" >/dev/null 2>&1; then
    print_error "Cannot connect to $droplet_ip as $ssh_user"
    print_status "Please ensure:"
    print_status "1. The droplet is running"
    print_status "2. SSH is enabled"
    print_status "3. Your SSH key is configured or password authentication is enabled"
    print_status "4. The IP address is correct"
    exit 1
fi

print_success "SSH connection successful!"

# Confirm setup
print_warning "This will install PostgreSQL on your droplet and create databases."
print_warning "Droplet IP: $droplet_ip"
print_warning "SSH User: $ssh_user"
read -p "Continue? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    setup_postgresql "$droplet_ip" "$ssh_user"
else
    print_status "Setup cancelled"
    exit 0
fi

