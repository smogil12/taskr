import { z } from 'zod';

// Project Creation Schema
export const projectCreationSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(1000, 'Project description must be less than 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  settings: z.object({
    timeTracking: z.boolean().default(true),
    taskManagement: z.boolean().default(true),
    fileSharing: z.boolean().default(true),
    teamCollaboration: z.boolean().default(true),
    reporting: z.boolean().default(true),
    integrations: z.array(z.string()).optional(),
  }).optional(),
  members: z.array(z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: z.enum(['owner', 'manager', 'member', 'viewer']).default('member'),
    permissions: z.object({
      canView: z.boolean().default(true),
      canEdit: z.boolean().default(false),
      canDelete: z.boolean().default(false),
      canManageMembers: z.boolean().default(false),
      canViewReports: z.boolean().default(true),
      canExportData: z.boolean().default(false),
    }).optional(),
  })).optional(),
});

// Project Update Schema
export const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Project description must be less than 1000 characters').optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  settings: z.object({
    timeTracking: z.boolean().optional(),
    taskManagement: z.boolean().optional(),
    fileSharing: z.boolean().optional(),
    teamCollaboration: z.boolean().optional(),
    reporting: z.boolean().optional(),
    integrations: z.array(z.string()).optional(),
  }).optional(),
});

// Project Member Management Schema
export const projectMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['owner', 'manager', 'member', 'viewer']),
  permissions: z.object({
    canView: z.boolean().default(true),
    canEdit: z.boolean().default(false),
    canDelete: z.boolean().default(false),
    canManageMembers: z.boolean().default(false),
    canViewReports: z.boolean().default(true),
    canExportData: z.boolean().default(false),
  }).optional(),
});

// Project Member Update Schema
export const projectMemberUpdateSchema = z.object({
  role: z.enum(['owner', 'manager', 'member', 'viewer']).optional(),
  permissions: z.object({
    canView: z.boolean().optional(),
    canEdit: z.boolean().optional(),
    canDelete: z.boolean().optional(),
    canManageMembers: z.boolean().optional(),
    canViewReports: z.boolean().optional(),
    canExportData: z.boolean().optional(),
  }).optional(),
});

// Project Search Schema
export const projectSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  ownerId: z.string().optional(),
  memberId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').optional(),
});

// Project Filter Schema
export const projectFilterSchema = z.object({
  statuses: z.array(z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'])).optional(),
  priorities: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  ownerIds: z.array(z.string()).optional(),
  memberIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  hasTimeTracking: z.boolean().optional(),
  hasTasks: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  isUnderBudget: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  startDateAfter: z.date().optional(),
  startDateBefore: z.date().optional(),
  endDateAfter: z.date().optional(),
  endDateBefore: z.date().optional(),
});

// Project Sort Schema
export const projectSortSchema = z.object({
  field: z.enum(['name', 'status', 'priority', 'startDate', 'endDate', 'estimatedHours', 'actualHours', 'budget', 'createdAt', 'updatedAt']),
  direction: z.enum(['asc', 'desc']),
});

// Project Template Schema
export const projectTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name must be less than 100 characters'),
  description: z.string().max(1000, 'Template description must be less than 1000 characters').optional(),
  isGlobal: z.boolean().default(false),
  settings: z.object({
    timeTracking: z.boolean().default(true),
    taskManagement: z.boolean().default(true),
    fileSharing: z.boolean().default(true),
    teamCollaboration: z.boolean().default(true),
    reporting: z.boolean().default(true),
    integrations: z.array(z.string()).optional(),
  }),
  defaultTasks: z.array(z.object({
    name: z.string().min(1, 'Task name is required').max(100, 'Task name must be less than 100 characters'),
    description: z.string().max(500, 'Task description must be less than 500 characters').optional(),
    estimatedHours: z.number().min(0, 'Estimated hours must be positive'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
    dependencies: z.array(z.string()).optional(),
  })).optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
});

// Project Export Schema
export const projectExportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf', 'json']),
  includeTasks: z.boolean().default(true),
  includeTimeEntries: z.boolean().default(true),
  includeMembers: z.boolean().default(true),
  includeFiles: z.boolean().default(false),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  filters: projectFilterSchema.optional(),
});

// Types
export type ProjectCreation = z.infer<typeof projectCreationSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type ProjectMember = z.infer<typeof projectMemberSchema>;
export type ProjectMemberUpdate = z.infer<typeof projectMemberUpdateSchema>;
export type ProjectSearch = z.infer<typeof projectSearchSchema>;
export type ProjectFilter = z.infer<typeof projectFilterSchema>;
export type ProjectSort = z.infer<typeof projectSortSchema>;
export type ProjectTemplate = z.infer<typeof projectTemplateSchema>;
export type ProjectExport = z.infer<typeof projectExportSchema>;
