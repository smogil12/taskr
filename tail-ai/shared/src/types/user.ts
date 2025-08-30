export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

export interface UserProfile extends Omit<User, 'password' | 'twoFactorSecret'> {
  fullName: string;
  displayName: string;
  timezone: string;
  locale: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  currency: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  timeTracking: TimeTrackingPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  projectUpdates: boolean;
  timeReminders: boolean;
  weeklyReports: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'organization';
  timeTrackingVisibility: 'public' | 'private' | 'organization';
  activityFeed: boolean;
}

export interface TimeTrackingPreferences {
  autoStart: boolean;
  autoStop: boolean;
  reminderInterval: number; // minutes
  breakReminders: boolean;
  idleDetection: boolean;
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}
