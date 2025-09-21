import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import timeEntryRoutes from './routes/timeEntries';
import subscriptionRoutes from './routes/subscriptions';
import calendarRoutes from './routes/calendar';
import teamMemberRoutes from './routes/teamMembers';
import activityRoutes from './routes/activity';
import passwordResetRoutes from './routes/password-reset';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma with connection pool configuration
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// General rate limiting - much more lenient in development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: process.env.NODE_ENV === 'development' 
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10000') // 10,000 requests in dev
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for email verification endpoints in development
    if (process.env.NODE_ENV === 'development' && 
        (req.path.includes('/verify-email') || req.path.includes('/resend-verification'))) {
      return true;
    }
    return false;
  },
});

// Authentication rate limiting - more lenient in development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // 100 requests in dev, 5 in production
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
}));
// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'Connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/activity', activityRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      url: req.url,
      method: req.method
    })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Taskr Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;

