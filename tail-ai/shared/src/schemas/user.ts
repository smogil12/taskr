import { z } from 'zod';

// User Registration Schema
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  organizationName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  acceptMarketing: z.boolean().optional(),
});

// User Login Schema
export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
});

// User Profile Update Schema
export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
});

// User Preferences Update Schema
export const userPreferencesUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    projectUpdates: z.boolean().optional(),
    timeReminders: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'organization']).optional(),
    timeTrackingVisibility: z.enum(['public', 'private', 'organization']).optional(),
    activityFeed: z.boolean().optional(),
  }).optional(),
  timeTracking: z.object({
    autoStart: z.boolean().optional(),
    autoStop: z.boolean().optional(),
    reminderInterval: z.number().min(1, 'Reminder interval must be at least 1 minute').max(1440, 'Reminder interval must be less than 24 hours').optional(),
    breakReminders: z.boolean().optional(),
    idleDetection: z.boolean().optional(),
  }).optional(),
});

// Password Change Schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Password Reset Confirm Schema
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Two-Factor Setup Schema
export const twoFactorSetupSchema = z.object({
  code: z.string().length(6, 'Two-factor code must be 6 digits'),
});

// Two-Factor Verify Schema
export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Two-factor code must be 6 digits'),
  rememberDevice: z.boolean().optional(),
});

// User Invitation Schema
export const userInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
  projectIds: z.array(z.string()).optional(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

// User Search Schema
export const userSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  role: z.enum(['admin', 'manager', 'member', 'viewer']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  organizationId: z.string().optional(),
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').optional(),
});

// User Filter Schema
export const userFilterSchema = z.object({
  roles: z.array(z.enum(['admin', 'manager', 'member', 'viewer'])).optional(),
  statuses: z.array(z.enum(['active', 'inactive', 'suspended'])).optional(),
  organizationIds: z.array(z.string()).optional(),
  hasProjects: z.boolean().optional(),
  isActive: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
});

// User Sort Schema
export const userSortSchema = z.object({
  field: z.enum(['firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'lastLoginAt']),
  direction: z.enum(['asc', 'desc']),
});

// Types
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type UserPreferencesUpdate = z.infer<typeof userPreferencesUpdateSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type TwoFactorSetup = z.infer<typeof twoFactorSetupSchema>;
export type TwoFactorVerify = z.infer<typeof twoFactorVerifySchema>;
export type UserInvitation = z.infer<typeof userInvitationSchema>;
export type UserSearch = z.infer<typeof userSearchSchema>;
export type UserFilter = z.infer<typeof userFilterSchema>;
export type UserSort = z.infer<typeof userSortSchema>;
