// Authentication Constants
export const AUTH_CONSTANTS = {
  // JWT Configuration
  JWT_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  JWT_ISSUER: 'tail-ai',
  JWT_AUDIENCE: 'tail-ai-users',

  // Session Configuration
  MAX_SESSIONS_PER_USER: 10,
  SESSION_TIMEOUT_MINUTES: 480, // 8 hours
  IDLE_TIMEOUT_MINUTES: 30,
  REMEMBER_ME_DAYS: 30,

  // Password Policy
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: false,
  MAX_PASSWORD_AGE_DAYS: 365,
  PREVENT_REUSE_COUNT: 5,

  // Two-Factor Authentication
  TOTP_ISSUER: 'Tail.AI',
  TOTP_ALGORITHM: 'SHA1',
  TOTP_DIGITS: 6,
  TOTP_PERIOD: 30,
  BACKUP_CODES_COUNT: 10,
  BACKUP_CODE_LENGTH: 8,

  // OAuth Configuration
  OAUTH_STATE_LENGTH: 32,
  OAUTH_PKCE_LENGTH: 128,
  OAUTH_CODE_VERIFIER_LENGTH: 128,

  // Rate Limiting
  LOGIN_ATTEMPTS_MAX: 5,
  LOGIN_ATTEMPTS_WINDOW_MINUTES: 15,
  PASSWORD_RESET_ATTEMPTS_MAX: 3,
  PASSWORD_RESET_ATTEMPTS_WINDOW_MINUTES: 60,
  VERIFICATION_ATTEMPTS_MAX: 5,
  VERIFICATION_ATTEMPTS_WINDOW_MINUTES: 30,

  // Security
  BCRYPT_ROUNDS: 12,
  PASSWORD_HISTORY_SIZE: 5,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
  IP_WHITELIST_CHECK_ENABLED: false,
  DEVICE_FINGERPRINTING_ENABLED: true,

  // Email Verification
  VERIFICATION_TOKEN_EXPIRES_HOURS: 24,
  VERIFICATION_RESEND_COOLDOWN_MINUTES: 5,

  // Account Lockout
  ACCOUNT_LOCKOUT_THRESHOLD: 10,
  ACCOUNT_LOCKOUT_DURATION_MINUTES: 30,
  ACCOUNT_LOCKOUT_WINDOW_MINUTES: 60,

  // Session Security
  SESSION_FIXATION_PROTECTION: true,
  SESSION_HIJACKING_PROTECTION: true,
  SESSION_REPLAY_PROTECTION: true,
  FORCE_HTTPS: true,
  SECURE_COOKIES: true,
  HTTP_ONLY_COOKIES: true,
  SAME_SITE_COOKIES: 'strict',

  // Audit Logging
  LOG_AUTHENTICATION_ATTEMPTS: true,
  LOG_PASSWORD_CHANGES: true,
  LOG_PROFILE_UPDATES: true,
  LOG_SESSION_ACTIVITY: true,
  LOG_SUSPICIOUS_ACTIVITY: true,
} as const;

// OAuth Provider Constants
export const OAUTH_PROVIDERS = {
  GOOGLE: {
    NAME: 'google',
    DISPLAY_NAME: 'Google',
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
    SCOPE: 'openid email profile',
  },
  GITHUB: {
    NAME: 'github',
    DISPLAY_NAME: 'GitHub',
    AUTH_URL: 'https://github.com/login/oauth/authorize',
    TOKEN_URL: 'https://github.com/login/oauth/access_token',
    USER_INFO_URL: 'https://api.github.com/user',
    SCOPE: 'read:user user:email',
  },
  MICROSOFT: {
    NAME: 'microsoft',
    DISPLAY_NAME: 'Microsoft',
    AUTH_URL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    TOKEN_URL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    USER_INFO_URL: 'https://graph.microsoft.com/v1.0/me',
    SCOPE: 'openid email profile',
  },
  SLACK: {
    NAME: 'slack',
    DISPLAY_NAME: 'Slack',
    AUTH_URL: 'https://slack.com/oauth/v2/authorize',
    TOKEN_URL: 'https://slack.com/api/oauth.v2.access',
    USER_INFO_URL: 'https://slack.com/api/users.info',
    SCOPE: 'identity.basic identity.email identity.team',
  },
} as const;

// Authentication Error Codes
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  INVALID_TWO_FACTOR_CODE: 'INVALID_TWO_FACTOR_CODE',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  PASSWORD_REUSE_NOT_ALLOWED: 'PASSWORD_REUSE_NOT_ALLOWED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
} as const;

// Authentication Success Messages
export const AUTH_SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  TWO_FACTOR_ENABLED: 'Two-factor authentication enabled',
  TWO_FACTOR_DISABLED: 'Two-factor authentication disabled',
  PROFILE_UPDATED: 'Profile updated successfully',
  SESSION_REFRESHED: 'Session refreshed successfully',
} as const;
