export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: OrganizationSize;
  timezone: string;
  locale: string;
  currency: string;
  settings: OrganizationSettings;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  features: FeatureFlags;
  integrations: IntegrationSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  billing: BillingSettings;
}

export interface FeatureFlags {
  timeTracking: boolean;
  projectManagement: boolean;
  teamCollaboration: boolean;
  reporting: boolean;
  aiFeatures: boolean;
  apiAccess: boolean;
  sso: boolean;
  auditLogs: boolean;
}

export interface IntegrationSettings {
  slack?: SlackIntegration;
  github?: GitHubIntegration;
  jira?: JiraIntegration;
  asana?: AsanaIntegration;
  trello?: TrelloIntegration;
  customIntegrations: CustomIntegration[];
}

export interface SlackIntegration {
  enabled: boolean;
  workspaceId: string;
  workspaceName: string;
  channels: string[];
  webhookUrl?: string;
}

export interface GitHubIntegration {
  enabled: boolean;
  organization: string;
  repositories: string[];
  webhookSecret?: string;
}

export interface JiraIntegration {
  enabled: boolean;
  domain: string;
  projectKeys: string[];
  apiToken?: string;
}

export interface AsanaIntegration {
  enabled: boolean;
  workspaceId: string;
  projects: string[];
  accessToken?: string;
}

export interface TrelloIntegration {
  enabled: boolean;
  boardIds: string[];
  apiKey?: string;
  token?: string;
}

export interface CustomIntegration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionPolicy: SessionPolicy;
  twoFactorPolicy: TwoFactorPolicy;
  ipWhitelist: string[];
  allowedDomains: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAge: number; // days
  preventReuse: number; // last N passwords
}

export interface SessionPolicy {
  maxSessions: number;
  sessionTimeout: number; // minutes
  idleTimeout: number; // minutes
  requireReauth: boolean;
}

export interface TwoFactorPolicy {
  required: boolean;
  allowedMethods: ('totp' | 'sms' | 'email')[];
  backupCodes: boolean;
  rememberDevice: boolean;
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  slack: SlackNotificationSettings;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: string[];
  digest: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  types: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

export interface SlackNotificationSettings {
  enabled: boolean;
  channels: string[];
  types: string[];
  mentions: boolean;
}

export interface BillingSettings {
  plan: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  autoRenew: boolean;
  paymentMethod?: PaymentMethod;
  invoices: Invoice[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
  pdfUrl?: string;
}

export enum OrganizationSize {
  SOLO = 'solo',
  SMALL = 'small', // 2-10
  MEDIUM = 'medium', // 11-50
  LARGE = 'large', // 51-200
  ENTERPRISE = 'enterprise' // 200+
}

export interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  features: string[];
  limits: SubscriptionLimits;
}

export interface SubscriptionLimits {
  users: number;
  projects: number;
  storage: number; // GB
  apiCalls: number;
  integrations: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  leaderId: string;
  members: TeamMember[];
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  permissions: TeamPermissions;
}

export interface TeamPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canViewReports: boolean;
}

export enum TeamRole {
  LEADER = 'leader',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export interface TeamSettings {
  autoAssign: boolean;
  defaultProjectId?: string;
  notificationPreferences: any; // Will be defined in user types
}
