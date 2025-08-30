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
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        subscriptionEnds: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
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
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

export const requireSubscription = (tier: 'PRO' | 'ENTERPRISE' = 'PRO') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userTier = req.user.subscriptionTier;
    
    if (userTier === 'FREE') {
      return res.status(403).json({ 
        error: `${tier} subscription required`,
        currentTier: userTier,
        requiredTier: tier
      });
    }

    if (tier === 'ENTERPRISE' && userTier !== 'ENTERPRISE') {
      return res.status(403).json({ 
        error: 'Enterprise subscription required',
        currentTier: userTier,
        requiredTier: tier
      });
    }

    next();
  };
};

export const checkProjectLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Free users are limited to 4 projects
    if (req.user.subscriptionTier === 'FREE') {
      const projectCount = await prisma.project.count({
        where: { userId: req.user.id },
      });

      if (projectCount >= 4) {
        return res.status(403).json({
          error: 'Project limit reached for free tier',
          currentCount: projectCount,
          limit: 4,
          upgradeRequired: true,
        });
      }
    }

    next();
  } catch (error) {
    console.error('Project limit check error:', error);
    return res.status(500).json({ error: 'Failed to check project limit' });
  }
};
