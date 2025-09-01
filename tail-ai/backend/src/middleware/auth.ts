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

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
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
      res.status(401).json({ error: 'User not found' });
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
    next();
  } catch (error) {
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

