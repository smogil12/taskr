import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        subscriptionTier: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log(`🔐 AUTH MIDDLEWARE: ${req.method} ${req.path}`);
    console.log(`🔐 Auth header present: ${!!authHeader}`);
    console.log(`🔐 Token present: ${!!token}`);

    if (!token) {
      console.log(`❌ AUTH FAILED: No token provided`);
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'tail-ai',
      audience: 'tail-ai-users'
    }) as any;
    
    console.log(`🔐 Token decoded successfully, userId: ${decoded.userId}`);
    
    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        subscriptionEnds: true,
        isEmailVerified: true,
      },
    });

    console.log(`🔐 User found: ${user ? user.email : 'No user found'}`);

    if (!user) {
      console.log(`❌ AUTH FAILED: User not found in database`);
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(403).json({ 
        error: 'Email not verified',
        message: 'Please verify your email address to access this resource.',
        emailVerified: false
      });
      return;
    }

    // Check if subscription is expired
    if (user.subscriptionTier !== 'FREE' && user.subscriptionEnds && user.subscriptionEnds < new Date()) {
      // Downgrade to free tier
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionTier: 'FREE' },
      });
      user.subscriptionTier = 'FREE';
    }

    req.user = user;
    console.log(`✅ AUTH SUCCESS: User ${user.email} authenticated`);
    next();
  } catch (error) {
    console.log(`❌ AUTH ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(500).json({ error: 'Token verification failed' });
    return;
  }
};

export const requireSubscription = (tier: 'PRO' | 'ENTERPRISE' = 'PRO') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userTier = req.user.subscriptionTier;
    
    if (userTier === 'FREE') {
      res.status(403).json({ 
        error: `${tier} subscription required`,
        currentTier: userTier,
        requiredTier: tier
      });
      return;
    }

    if (tier === 'ENTERPRISE' && userTier !== 'ENTERPRISE') {
      res.status(403).json({ 
        error: 'Enterprise subscription required',
        currentTier: userTier,
        requiredTier: tier
      });
      return;
    }

    next();
  };
};

export const checkProjectLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Free users are limited to 4 projects
    if (req.user.subscriptionTier === 'FREE') {
      const projectCount = await prisma.project.count({
        where: { userId: req.user.id },
      });

      if (projectCount >= 4) {
        res.status(403).json({
          error: 'Project limit reached for free tier',
          currentCount: projectCount,
          limit: 4,
          upgradeRequired: true,
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Project limit check error:', error);
    res.status(500).json({ error: 'Failed to check project limit' });
    return;
  }
};

