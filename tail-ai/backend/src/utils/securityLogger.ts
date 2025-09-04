import { Request } from 'express';

export interface SecurityEvent {
  eventType: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCKOUT' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED';
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  private logs: SecurityEvent[] = [];

  private constructor() {}

  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  public logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.logs.push(securityEvent);
    
    // Log to console in development, could be extended to log to external service
    console.log(`[SECURITY] ${securityEvent.eventType} - ${securityEvent.severity}`, {
      userId: securityEvent.userId,
      email: securityEvent.email,
      ipAddress: securityEvent.ipAddress,
      timestamp: securityEvent.timestamp,
      details: securityEvent.details,
    });

    // In production, you might want to send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external security monitoring service
      // this.sendToSecurityService(securityEvent);
    }
  }

  public logLoginAttempt(req: Request, email: string, success: boolean, userId?: string): void {
    this.logEvent({
      eventType: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      userId,
      email,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      details: {
        success,
        endpoint: req.path,
        method: req.method,
      },
      severity: success ? 'LOW' : 'MEDIUM',
    });
  }

  public logPasswordChange(req: Request, userId: string, email: string): void {
    this.logEvent({
      eventType: 'PASSWORD_CHANGE',
      userId,
      email,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      details: {
        endpoint: req.path,
        method: req.method,
      },
      severity: 'MEDIUM',
    });
  }

  public logAccountLockout(req: Request, email: string, reason: string): void {
    this.logEvent({
      eventType: 'ACCOUNT_LOCKOUT',
      email,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      details: {
        reason,
        endpoint: req.path,
        method: req.method,
      },
      severity: 'HIGH',
    });
  }

  public logSuspiciousActivity(req: Request, details: Record<string, any>, severity: 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'): void {
    this.logEvent({
      eventType: 'SUSPICIOUS_ACTIVITY',
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      details: {
        ...details,
        endpoint: req.path,
        method: req.method,
      },
      severity,
    });
  }

  public logRateLimitExceeded(req: Request, limit: number, windowMs: number): void {
    this.logEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent'),
      details: {
        limit,
        windowMs,
        endpoint: req.path,
        method: req.method,
      },
      severity: 'MEDIUM',
    });
  }

  private getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  public getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getEventsByType(eventType: SecurityEvent['eventType'], limit: number = 50): SecurityEvent[] {
    return this.logs
      .filter(event => event.eventType === eventType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 50): SecurityEvent[] {
    return this.logs
      .filter(event => event.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const securityLogger = SecurityLogger.getInstance();
