import { z } from 'zod';

// OAuth Profile Schema
export const oAuthProfileSchema = z.object({
  provider: z.enum(['google', 'github', 'microsoft', 'slack']),
  providerId: z.string().min(1, 'Provider ID is required'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
});

// OAuth Callback Schema
export const oAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
  error: z.string().optional(),
  errorDescription: z.string().optional(),
});

// Session Creation Schema
export const sessionCreationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  ipAddress: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().max(500, 'User agent must be less than 500 characters').optional(),
  deviceInfo: z.object({
    type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    browser: z.string().max(100, 'Browser must be less than 100 characters').optional(),
    os: z.string().max(100, 'Operating system must be less than 100 characters').optional(),
    device: z.string().max(100, 'Device must be less than 100 characters').optional(),
  }).optional(),
  rememberMe: z.boolean().default(false),
});

// Session Validation Schema
export const sessionValidationSchema = z.object({
  token: z.string().min(1, 'Session token is required'),
  ipAddress: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().max(500, 'User agent must be less than 500 characters').optional(),
});

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
  ipAddress: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().max(500, 'User agent must be less than 500 characters').optional(),
});

// Two-Factor Authentication Setup Schema - Moved to user schemas

// Two-Factor Authentication Verification Schema
export const twoFactorVerificationSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
  method: z.enum(['totp', 'sms', 'email']),
  rememberDevice: z.boolean().default(false),
  backupCode: z.string().optional(),
});

// Two-Factor Authentication Disable Schema
export const twoFactorDisableSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  backupCode: z.string().optional(),
});

// Password Reset Request Schema - Moved to user schemas

// Password Reset Verification Schema
export const passwordResetVerificationSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().email('Invalid email address'),
});

// Password Reset Confirm Schema - Moved to user schemas

// Email Verification Schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: z.string().email('Invalid email address'),
});

// Email Verification Resend Schema
export const emailVerificationResendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Account Deletion Schema
export const accountDeletionSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
  feedback: z.string().max(1000, 'Feedback must be less than 1000 characters').optional(),
});

// Account Suspension Schema
export const accountSuspensionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().min(1, 'Suspension reason is required').max(500, 'Reason must be less than 500 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 day').max(365, 'Duration must be less than 1 year'), // days
  adminNotes: z.string().max(1000, 'Admin notes must be less than 1000 characters').optional(),
});

// Account Reactivation Schema
export const accountReactivationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().min(1, 'Reactivation reason is required').max(500, 'Reason must be less than 500 characters'),
  adminNotes: z.string().max(1000, 'Admin notes must be less than 1000 characters').optional(),
});

// Security Log Schema
export const securityLogSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum([
    'login',
    'logout',
    'login_failed',
    'password_change',
    'password_reset',
    'two_factor_enable',
    'two_factor_disable',
    'profile_update',
    'session_expired',
    'suspicious_activity',
    'account_suspended',
    'account_reactivated',
    'account_deleted'
  ]),
  ipAddress: z.string().ip('Invalid IP address').optional(),
  userAgent: z.string().max(500, 'User agent must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  success: z.boolean().default(true),
  details: z.string().max(1000, 'Details must be less than 1000 characters').optional(),
  metadata: z.record(z.any()).optional(),
});

// Permission Check Schema
export const permissionCheckSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  context: z.record(z.any()).optional(),
});

// Role Assignment Schema
export const roleAssignmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roleId: z.string().min(1, 'Role ID is required'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  assignedBy: z.string().min(1, 'Assigned by user ID is required'),
  expiresAt: z.date().optional(),
});

// Role Update Schema
export const roleUpdateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Permission Update Schema
export const permissionUpdateSchema = z.object({
  name: z.string().min(1, 'Permission name is required').max(100, 'Permission name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  resource: z.string().min(1, 'Resource is required').optional(),
  action: z.string().min(1, 'Action is required').optional(),
  conditions: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// Types
export type OAuthProfile = z.infer<typeof oAuthProfileSchema>;
export type OAuthCallback = z.infer<typeof oAuthCallbackSchema>;
export type SessionCreation = z.infer<typeof sessionCreationSchema>;
export type SessionValidation = z.infer<typeof sessionValidationSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
// export type TwoFactorSetup = z.infer<typeof twoFactorSetupSchema>;
export type TwoFactorVerification = z.infer<typeof twoFactorVerificationSchema>;
export type TwoFactorDisable = z.infer<typeof twoFactorDisableSchema>;
// export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetVerification = z.infer<typeof passwordResetVerificationSchema>;
// export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type EmailVerification = z.infer<typeof emailVerificationSchema>;
export type EmailVerificationResend = z.infer<typeof emailVerificationResendSchema>;
export type AccountDeletion = z.infer<typeof accountDeletionSchema>;
export type AccountSuspension = z.infer<typeof accountSuspensionSchema>;
export type AccountReactivation = z.infer<typeof accountReactivationSchema>;
export type SecurityLog = z.infer<typeof securityLogSchema>;
export type PermissionCheck = z.infer<typeof permissionCheckSchema>;
export type RoleAssignment = z.infer<typeof roleAssignmentSchema>;
export type RoleUpdate = z.infer<typeof roleUpdateSchema>;
export type PermissionUpdate = z.infer<typeof permissionUpdateSchema>;
