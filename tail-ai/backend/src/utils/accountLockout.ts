import { prisma } from '../index';
import { securityLogger } from './securityLogger';

export interface LockoutResult {
  isLocked: boolean;
  lockoutExpires?: Date;
  remainingAttempts?: number;
  message?: string;
}

export class AccountLockoutManager {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Check if an account is currently locked out
   */
  static async checkAccountLockout(userId: string): Promise<LockoutResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        accountLockedUntil: true,
      },
    });

    if (!user) {
      return { isLocked: false };
    }

    // Check if account is locked and lockout period has expired
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / (1000 * 60));
      return {
        isLocked: true,
        lockoutExpires: user.accountLockedUntil,
        message: `Account is locked due to too many failed login attempts. Please try again in ${remainingTime} minutes.`,
      };
    }

    // If lockout period has expired, reset the lockout
    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      await this.resetAccountLockout(userId);
      return { isLocked: false };
    }

    const remainingAttempts = this.MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
    return {
      isLocked: false,
      remainingAttempts: Math.max(0, remainingAttempts),
    };
  }

  /**
   * Record a failed login attempt
   */
  static async recordFailedAttempt(
    userId: string,
    email: string,
    req: any
  ): Promise<LockoutResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        accountLockedUntil: true,
      },
    });

    if (!user) {
      return { isLocked: false };
    }

    const newFailedAttempts = user.failedLoginAttempts + 1;
    const remainingAttempts = this.MAX_FAILED_ATTEMPTS - newFailedAttempts;

    // Check if this attempt should trigger a lockout
    if (newFailedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockoutExpires = new Date(Date.now() + this.LOCKOUT_DURATION_MS);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: newFailedAttempts,
          accountLockedUntil: lockoutExpires,
        },
      });

      // Log the account lockout
      securityLogger.logAccountLockout(req, email, `Account locked after ${newFailedAttempts} failed attempts`);

      return {
        isLocked: true,
        lockoutExpires,
        message: `Account has been locked due to too many failed login attempts. Please try again in 30 minutes.`,
      };
    }

    // Update failed attempts count
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newFailedAttempts,
      },
    });

    return {
      isLocked: false,
      remainingAttempts: Math.max(0, remainingAttempts),
      message: remainingAttempts > 0 
        ? `${remainingAttempts} login attempts remaining before account lockout.`
        : 'Account will be locked on next failed attempt.',
    };
  }

  /**
   * Reset account lockout after successful login
   */
  static async resetAccountLockout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });
  }

  /**
   * Check lockout by email (for login attempts)
   */
  static async checkLockoutByEmail(email: string): Promise<LockoutResult> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        accountLockedUntil: true,
      },
    });

    if (!user) {
      return { isLocked: false };
    }

    return this.checkAccountLockout(user.id);
  }

  /**
   * Record failed attempt by email
   */
  static async recordFailedAttemptByEmail(
    email: string,
    req: any
  ): Promise<LockoutResult> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        accountLockedUntil: true,
      },
    });

    if (!user) {
      return { isLocked: false };
    }

    return this.recordFailedAttempt(user.id, email, req);
  }
}
