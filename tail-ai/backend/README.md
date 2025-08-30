# Taskr Backend API

A robust backend API for the Taskr project management and time tracking application, built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Features

- **User Authentication** - JWT-based authentication with bcrypt password hashing
- **Project Management** - CRUD operations for projects with subscription limits
- **Task Management** - Full task lifecycle management
- **Time Tracking** - Comprehensive time entry system
- **Subscription Management** - Free tier (4 projects) and paid tiers (unlimited)
- **Stripe Integration** - Payment processing and subscription management
- **Rate Limiting** - API rate limiting for security
- **Input Validation** - Request validation using express-validator

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Or run migrations
   npx prisma migrate dev
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskr_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
STRIPE_PRICE_ID_PRO="price_your_pro_plan_price_id"
STRIPE_PRICE_ID_ENTERPRISE="price_your_enterprise_plan_price_id"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Schema

### Core Models

- **User** - User accounts with subscription tiers
- **Project** - Projects with status tracking
- **Task** - Tasks with priority and status
- **TimeEntry** - Time tracking entries
- **Organization** - Team organizations
- **Subscription** - Stripe subscription management

### Subscription Tiers

- **FREE** - Limited to 4 projects
- **PRO** - Unlimited projects, $9.99/month
- **ENTERPRISE** - Advanced features, $29.99/month

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project (with limit check)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/stats` - Get project statistics

### Tasks
- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Time Tracking
- `GET /api/time-entries` - List time entries
- `POST /api/time-entries` - Create time entry
- `GET /api/time-entries/:id` - Get time entry
- `PUT /api/time-entries/:id` - Update time entry
- `DELETE /api/time-entries/:id` - Delete time entry
- `GET /api/time-entries/stats/summary` - Get time statistics

### Subscriptions
- `GET /api/subscriptions/status` - Get subscription status
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/create-checkout-session` - Create Stripe checkout
- `POST /api/subscriptions/create-portal-session` - Access billing portal
- `POST /api/subscriptions/webhook` - Stripe webhook handler

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🚦 Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: Standard rate limit headers included

## 💳 Stripe Integration

The backend integrates with Stripe for subscription management:

1. **Checkout Sessions** - Create payment flows
2. **Customer Portal** - Manage subscriptions
3. **Webhooks** - Handle subscription events
4. **Automatic Tier Management** - Update user tiers based on payments

## 🧪 Development

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio
```

## 📁 Project Structure

```
src/
├── index.ts              # Main server file
├── middleware/           # Custom middleware
│   └── auth.ts          # Authentication middleware
├── routes/               # API route handlers
│   ├── auth.ts          # Authentication routes
│   ├── projects.ts      # Project management
│   ├── tasks.ts         # Task management
│   ├── timeEntries.ts   # Time tracking
│   └── subscriptions.ts # Subscription management
├── controllers/          # Business logic (future)
├── services/            # External service integration (future)
└── utils/               # Utility functions (future)
```

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Request sanitization
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server:**
   ```bash
   npm start
   ```

## 📝 License

This project is licensed under the ISC License.
