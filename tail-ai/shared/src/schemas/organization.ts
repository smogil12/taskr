import { z } from 'zod';

// Organization Creation Schema
export const organizationCreationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug must be less than 50 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  industry: z.string().max(100, 'Industry must be less than 100 characters').optional(),
  size: z.enum(['solo', 'small', 'medium', 'large', 'enterprise']).default('solo'),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  settings: z.object({
    features: z.object({
      timeTracking: z.boolean().default(true),
      projectManagement: z.boolean().default(true),
      teamCollaboration: z.boolean().default(true),
      reporting: z.boolean().default(true),
      aiFeatures: z.boolean().default(true),
      apiAccess: z.boolean().default(false),
      sso: z.boolean().default(false),
      auditLogs: z.boolean().default(false),
    }).optional(),
    security: z.object({
      passwordPolicy: z.object({
        minLength: z.number().min(6, 'Minimum password length must be at least 6').max(50, 'Maximum password length must be less than 50').default(8),
        requireUppercase: z.boolean().default(true),
        requireLowercase: z.boolean().default(true),
        requireNumbers: z.boolean().default(true),
        requireSymbols: z.boolean().default(false),
        maxAge: z.number().min(0, 'Password max age must be positive').max(3650, 'Password max age must be less than 10 years').default(365),
        preventReuse: z.number().min(0, 'Prevent reuse count must be positive').max(50, 'Prevent reuse count must be less than 50').default(5),
      }).optional(),
      sessionPolicy: z.object({
        maxSessions: z.number().min(1, 'Maximum sessions must be at least 1').max(100, 'Maximum sessions must be less than 100').default(10),
        sessionTimeout: z.number().min(15, 'Session timeout must be at least 15 minutes').max(1440, 'Session timeout must be less than 24 hours').default(480),
        idleTimeout: z.number().min(5, 'Idle timeout must be at least 5 minutes').max(1440, 'Idle timeout must be less than 24 hours').default(30),
        requireReauth: z.boolean().default(false),
      }).optional(),
      twoFactorPolicy: z.object({
        required: z.boolean().default(false),
        allowedMethods: z.array(z.enum(['totp', 'sms', 'email'])).default(['totp']),
        backupCodes: z.boolean().default(true),
        rememberDevice: z.boolean().default(true),
      }).optional(),
      ipWhitelist: z.array(z.string().ip('Invalid IP address')).optional(),
      allowedDomains: z.array(z.string().max(100, 'Domain must be less than 100 characters')).optional(),
    }).optional(),
    notifications: z.object({
      email: z.object({
        enabled: z.boolean().default(true),
        frequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
        types: z.array(z.string()).default(['project_updates', 'time_reminders', 'weekly_reports']),
        digest: z.boolean().default(false),
      }).optional(),
      push: z.object({
        enabled: z.boolean().default(true),
        types: z.array(z.string()).default(['project_updates', 'time_reminders']),
        quietHours: z.object({
          enabled: z.boolean().default(false),
          start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format').optional(),
          end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format').optional(),
          timezone: z.string().default('UTC'),
        }).optional(),
      }).optional(),
      slack: z.object({
        enabled: z.boolean().default(false),
        channels: z.array(z.string()).optional(),
        types: z.array(z.string()).default(['project_updates', 'time_reminders']),
        mentions: z.boolean().default(true),
      }).optional(),
    }).optional(),
  }).optional(),
});

// Organization Update Schema
export const organizationUpdateSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  industry: z.string().max(100, 'Industry must be less than 100 characters').optional(),
  size: z.enum(['solo', 'small', 'medium', 'large', 'enterprise']).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
  logo: z.string().url('Invalid logo URL').optional(),
});

// Organization Settings Update Schema
export const organizationSettingsUpdateSchema = z.object({
  features: z.object({
    timeTracking: z.boolean().optional(),
    projectManagement: z.boolean().optional(),
    teamCollaboration: z.boolean().optional(),
    reporting: z.boolean().optional(),
    aiFeatures: z.boolean().optional(),
    apiAccess: z.boolean().optional(),
    sso: z.boolean().optional(),
    auditLogs: z.boolean().optional(),
  }).optional(),
  integrations: z.object({
    slack: z.object({
      enabled: z.boolean().optional(),
      workspaceId: z.string().optional(),
      workspaceName: z.string().optional(),
      channels: z.array(z.string()).optional(),
      webhookUrl: z.string().url('Invalid webhook URL').optional(),
    }).optional(),
    github: z.object({
      enabled: z.boolean().optional(),
      organization: z.string().optional(),
      repositories: z.array(z.string()).optional(),
      webhookSecret: z.string().optional(),
    }).optional(),
    jira: z.object({
      enabled: z.boolean().optional(),
      domain: z.string().optional(),
      projectKeys: z.array(z.string()).optional(),
      apiToken: z.string().optional(),
    }).optional(),
    asana: z.object({
      enabled: z.boolean().optional(),
      workspaceId: z.string().optional(),
      projects: z.array(z.string()).optional(),
      accessToken: z.string().optional(),
    }).optional(),
    trello: z.object({
      enabled: z.boolean().optional(),
      boardIds: z.array(z.string()).optional(),
      apiKey: z.string().optional(),
      token: z.string().optional(),
    }).optional(),
  }).optional(),
  security: z.object({
    passwordPolicy: z.object({
      minLength: z.number().min(6, 'Minimum password length must be at least 6').max(50, 'Maximum password length must be less than 50').optional(),
      requireUppercase: z.boolean().optional(),
      requireLowercase: z.boolean().optional(),
      requireNumbers: z.boolean().optional(),
      requireSymbols: z.boolean().optional(),
      maxAge: z.number().min(0, 'Password max age must be positive').max(3650, 'Password max age must be less than 10 years').optional(),
      preventReuse: z.number().min(0, 'Prevent reuse count must be positive').max(50, 'Prevent reuse count must be less than 50').optional(),
    }).optional(),
    sessionPolicy: z.object({
      maxSessions: z.number().min(1, 'Maximum sessions must be at least 1').max(100, 'Maximum sessions must be less than 100').optional(),
      sessionTimeout: z.number().min(15, 'Session timeout must be at least 15 minutes').max(1440, 'Session timeout must be less than 24 hours').optional(),
      idleTimeout: z.number().min(5, 'Idle timeout must be at least 5 minutes').max(1440, 'Idle timeout must be less than 24 hours').optional(),
      requireReauth: z.boolean().optional(),
    }).optional(),
    twoFactorPolicy: z.object({
      required: z.boolean().optional(),
      allowedMethods: z.array(z.enum(['totp', 'sms', 'email'])).optional(),
      backupCodes: z.boolean().optional(),
      rememberDevice: z.boolean().optional(),
    }).optional(),
    ipWhitelist: z.array(z.string().ip('Invalid IP address')).optional(),
    allowedDomains: z.array(z.string().max(100, 'Domain must be less than 100 characters')).optional(),
  }).optional(),
  notifications: z.object({
    email: z.object({
      enabled: z.boolean().optional(),
      frequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
      types: z.array(z.string()).optional(),
      digest: z.boolean().optional(),
    }).optional(),
    push: z.object({
      enabled: z.boolean().optional(),
      types: z.array(z.string()).optional(),
      quietHours: z.object({
        enabled: z.boolean().optional(),
        start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format').optional(),
        end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format').optional(),
        timezone: z.string().optional(),
      }).optional(),
    }).optional(),
    slack: z.object({
      enabled: z.boolean().optional(),
      channels: z.array(z.string()).optional(),
      types: z.array(z.string()).optional(),
      mentions: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Team Creation Schema
export const teamCreationSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  leaderId: z.string().min(1, 'Team leader ID is required'),
  members: z.array(z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: z.enum(['leader', 'member', 'viewer']).default('member'),
    permissions: z.object({
      canView: z.boolean().default(true),
      canEdit: z.boolean().default(false),
      canDelete: z.boolean().default(false),
      canManageMembers: z.boolean().default(false),
      canViewReports: z.boolean().default(true),
    }).optional(),
  })).optional(),
  settings: z.object({
    autoAssign: z.boolean().default(false),
    defaultProjectId: z.string().optional(),
    notificationPreferences: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      slack: z.boolean().default(false),
    }).optional(),
  }).optional(),
});

// Team Update Schema
export const teamUpdateSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  leaderId: z.string().min(1, 'Team leader ID is required').optional(),
  settings: z.object({
    autoAssign: z.boolean().optional(),
    defaultProjectId: z.string().optional(),
    notificationPreferences: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      slack: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Team Member Management Schema
export const teamMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['leader', 'member', 'viewer']),
  permissions: z.object({
    canView: z.boolean().default(true),
    canEdit: z.boolean().default(false),
    canDelete: z.boolean().default(false),
    canManageMembers: z.boolean().default(false),
    canViewReports: z.boolean().default(true),
  }).optional(),
});

// Organization Search Schema
export const organizationSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  industry: z.string().optional(),
  size: z.enum(['solo', 'small', 'medium', 'large', 'enterprise']).optional(),
  hasActiveSubscription: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').optional(),
});

// Organization Invitation Schema
export const organizationInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'member', 'viewer']),
  teamIds: z.array(z.string()).optional(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
  expiresIn: z.number().min(1, 'Expiration must be at least 1 day').max(30, 'Expiration must be less than 30 days').default(7),
});

// Types
export type OrganizationCreation = z.infer<typeof organizationCreationSchema>;
export type OrganizationUpdate = z.infer<typeof organizationUpdateSchema>;
export type OrganizationSettingsUpdate = z.infer<typeof organizationSettingsUpdateSchema>;
export type TeamCreation = z.infer<typeof teamCreationSchema>;
export type TeamUpdate = z.infer<typeof teamUpdateSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type OrganizationSearch = z.infer<typeof organizationSearchSchema>;
export type OrganizationInvitation = z.infer<typeof organizationInvitationSchema>;
