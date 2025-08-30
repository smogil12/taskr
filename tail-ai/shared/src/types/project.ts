export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  ownerId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours: number;
  budget?: number;
  currency: string;
  tags: string[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  timeTracking: boolean;
  taskManagement: boolean;
  fileSharing: boolean;
  teamCollaboration: boolean;
  reporting: boolean;
  integrations: string[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
  permissions: ProjectPermissions;
}

export interface ProjectPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canViewReports: boolean;
  canExportData: boolean;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ProjectRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  organizationId?: string; // null for global templates
  isGlobal: boolean;
  settings: ProjectSettings;
  defaultTasks: TaskTemplate[];
  estimatedHours: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  estimatedHours: number;
  priority: any; // Will be defined in task types
  tags: string[];
  dependencies: string[]; // task template IDs
}
