import jwt from 'jsonwebtoken';

/**
 * JWT Security Utility
 * Provides secure JWT operations with proper secret validation
 */

// Common weak secrets that should be rejected
const WEAK_SECRETS = [
  'your-super-secret-jwt-key-here',
  'fallback-secret',
  'secret',
  'jwt-secret',
  'my-secret-key',
  'test-secret',
  'dev-secret',
  'staging-secret',
  'prod-secret',
  '1234567890',
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
];

/**
 * Validates that a JWT secret meets security requirements
 * @param secret - The JWT secret to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateJwtSecret(secret: string): { isValid: boolean; error?: string } {
  if (!secret) {
    return { isValid: false, error: 'JWT secret is required' };
  }

  // Check minimum length (256 bits = 32 characters for hex, 64 for base64)
  if (secret.length < 32) {
    return { isValid: false, error: 'JWT secret must be at least 32 characters long' };
  }

  // Check for weak/common secrets
  if (WEAK_SECRETS.includes(secret.toLowerCase())) {
    return { isValid: false, error: 'JWT secret is too weak or predictable' };
  }

  // Check for sufficient entropy (mix of character types)
  const hasLowercase = /[a-z]/.test(secret);
  const hasUppercase = /[A-Z]/.test(secret);
  const hasNumbers = /[0-9]/.test(secret);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret);

  const characterTypes = [hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length;
  
  if (characterTypes < 2) {
    return { isValid: false, error: 'JWT secret must contain at least 2 different character types (letters, numbers, special characters)' };
  }

  return { isValid: true };
}

/**
 * Safely gets JWT secret from environment variables with validation
 * @returns The validated JWT secret
 * @throws Error if secret is missing or invalid
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const validation = validateJwtSecret(secret);
  if (!validation.isValid) {
    throw new Error(`Invalid JWT secret: ${validation.error}`);
  }

  return secret;
}

/**
 * Safely signs a JWT token with proper validation
 * @param payload - The JWT payload
 * @param options - JWT signing options
 * @returns The signed JWT token
 */
export function signJwt(payload: any, options?: jwt.SignOptions): string {
  const secret = getJwtSecret();
  
  return jwt.sign(payload, secret, {
    issuer: 'tail-ai',
    audience: 'tail-ai-users',
    ...options
  } as jwt.SignOptions);
}

/**
 * Safely verifies a JWT token with proper validation
 * @param token - The JWT token to verify
 * @returns The decoded JWT payload
 * @throws Error if token is invalid or secret is missing
 */
export function verifyJwt(token: string): any {
  const secret = getJwtSecret();
  
  return jwt.verify(token, secret, {
    issuer: 'tail-ai',
    audience: 'tail-ai-users'
  });
}

/**
 * Generates a cryptographically strong JWT secret
 * @param prefix - Optional prefix for the secret (e.g., 'dev_', 'staging_', 'prod_')
 * @returns A secure JWT secret
 */
export function generateJwtSecret(prefix: string = ''): string {
  const crypto = require('crypto');
  const randomBytes = crypto.randomBytes(32);
  const secret = randomBytes.toString('hex');
  return prefix + secret;
}

/**
 * Environment-specific JWT secret generation
 */
export const JWT_SECRETS = {
  development: 'dev_a9e8a5ff0e7c15a9626a1dcd4198923127d42c61c0eee1bb27e6c2915bc52cea',
  staging: 'staging_e5520806aecc5c24eca04c1405cba447268970c7a31d513d554c5d710976e830',
  production: 'prod_dc1938d45e66da7c0cfc6c63beeb604b64f246dff617d38b52755f04d90a0390'
} as const;

/**
 * Gets the appropriate JWT secret for the current environment
 * @returns The environment-specific JWT secret
 */
export function getEnvironmentJwtSecret(): string {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'development':
      return JWT_SECRETS.development;
    case 'staging':
      return JWT_SECRETS.staging;
    case 'production':
      return JWT_SECRETS.production;
    default:
      console.warn(`Unknown environment: ${env}, using development secret`);
      return JWT_SECRETS.development;
  }
}
