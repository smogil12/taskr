import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
const { body, validationResult } = require('express-validator');
import { prisma } from '../index';
import { EmailService } from '../services/emailService';
import { securityLogger } from '../utils/securityLogger';
import { getJwtSecret, signJwt, verifyJwt } from '../utils/jwtSecurity';

const router = Router();

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
    .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/).withMessage('Password must contain at least one special character'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register new user
router.post('/signup', validateRegistration, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const verificationToken = EmailService.generateVerificationToken();
    const verificationExpires = EmailService.getVerificationExpiry();

    // Create user with FREE tier by default and email verification fields
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscriptionTier: 'FREE',
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    const emailResult = await EmailService.sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationToken,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail the signup, but log the error
    }

    return res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login user
router.post('/signin', validateLogin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      securityLogger.logLoginAttempt(req, email, false);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      securityLogger.logLoginAttempt(req, email, false, user.id);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Email not verified',
        message: 'Please verify your email address before logging in. Check your inbox for a verification email.',
        emailVerified: false
      });
    }

    // Generate JWT token
    const token = signJwt(
      { 
        userId: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      },
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      } as jwt.SignOptions
    );

    // Log successful login
    securityLogger.logLoginAttempt(req, email, true, user.id);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyJwt(token) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionEnds: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true,
            tasks: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Verify email endpoint
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    console.log('Email verification request received:', { token: token ? 'present' : 'missing' });

    if (!token) {
      console.log('No token provided in verification request');
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user with the verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      console.log('No user found with token:', token);
      // Check if token exists but is expired
      const expiredUser = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
        },
      });
      
      if (expiredUser) {
        console.log('Token found but expired for user:', expiredUser.email);
        return res.status(400).json({ 
          error: 'Verification token has expired',
          message: 'The verification link has expired. Please request a new verification email.'
        });
      }
      
      // Check if user is already verified (token was already used)
      const alreadyVerifiedUser = await prisma.user.findFirst({
        where: {
          email: req.body.email || 'unknown',
          isEmailVerified: true,
        },
      });
      
      if (alreadyVerifiedUser) {
        console.log('User already verified:', alreadyVerifiedUser.email);
        
        // Generate JWT token for the already verified user
        const authToken = signJwt(
          { userId: alreadyVerifiedUser.id },
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
        );
        
        return res.status(200).json({ 
          message: 'Email already verified',
          user: {
            id: alreadyVerifiedUser.id,
            name: alreadyVerifiedUser.name,
            email: alreadyVerifiedUser.email,
            isEmailVerified: true,
          },
          token: authToken,
        });
      }
      
      return res.status(400).json({ 
        error: 'Invalid verification token',
        message: 'The verification link is invalid. Please request a new verification email.'
      });
    }

    // Update user to mark email as verified and clear verification fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    console.log('Email verified successfully for user:', user.email);

    // Generate JWT token for the newly verified user
    const authToken = signJwt(
      { userId: user.id },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    return res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: true,
      },
      token: authToken,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Resend verification email endpoint
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = EmailService.generateVerificationToken();
    const verificationExpires = EmailService.getVerificationExpiry();

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    const emailResult = await EmailService.sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationToken,
    });

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: 'Failed to send verification email',
        message: emailResult.error 
      });
    }

    return res.json({
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

export default router;

