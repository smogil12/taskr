import { z } from 'zod';

// Task Creation Schema
export const taskCreationSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(100, 'Task name must be less than 100 characters'),
  description: z.string().max(1000, 'Task description must be less than 1000 characters').optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  assigneeId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  type: z.enum(['feature', 'bug', 'improvement', 'task', 'story', 'epic']).default('task'),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  dependencies: z.array(z.string()).optional(),
});

// Task Update Schema
export const taskUpdateSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(100, 'Task name must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Task description must be less than 1000 characters').optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'testing', 'done', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['feature', 'bug', 'improvement', 'task', 'story', 'epic']).optional(),
  assigneeId: z.string().optional(),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  dependencies: z.array(z.string()).optional(),
});

// Task Status Update Schema
export const taskStatusUpdateSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'in_review', 'testing', 'done', 'cancelled']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  completedAt: z.date().optional(),
});

// Task Assignment Schema
export const taskAssignmentSchema = z.object({
  assigneeId: z.string().min(1, 'Assignee ID is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Task Comment Schema
export const taskCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment content must be less than 1000 characters'),
  attachments: z.array(z.string()).optional(),
});

// Task Comment Update Schema
export const taskCommentUpdateSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment content must be less than 1000 characters'),
});

// Task Search Schema
export const taskSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  projectId: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'testing', 'done', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  type: z.enum(['feature', 'bug', 'improvement', 'task', 'story', 'epic']).optional(),
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').optional(),
});

// Task Filter Schema
export const taskFilterSchema = z.object({
  statuses: z.array(z.enum(['todo', 'in_progress', 'in_review', 'testing', 'done', 'cancelled'])).optional(),
  priorities: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  types: z.array(z.enum(['feature', 'bug', 'improvement', 'task', 'story', 'epic'])).optional(),
  assigneeIds: z.array(z.string()).optional(),
  reporterIds: z.array(z.string()).optional(),
  projectIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  hasDependencies: z.boolean().optional(),
  isOverdue: z.boolean().optional(),
  hasTimeEntries: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  dueDateAfter: z.date().optional(),
  dueDateBefore: z.date().optional(),
});

// Task Sort Schema
export const taskSortSchema = z.object({
  field: z.enum(['name', 'status', 'priority', 'type', 'assigneeId', 'dueDate', 'estimatedHours', 'actualHours', 'createdAt', 'updatedAt']),
  direction: z.enum(['asc', 'desc']),
});

// Task Bulk Update Schema
export const taskBulkUpdateSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'At least one task ID is required').max(100, 'Maximum 100 tasks can be updated at once'),
  updates: z.object({
    status: z.enum(['todo', 'in_progress', 'in_review', 'testing', 'done', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigneeId: z.string().optional(),
    dueDate: z.date().optional(),
    tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  }),
});

// Task Dependency Schema
export const taskDependencySchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  dependsOnTaskId: z.string().min(1, 'Dependency task ID is required'),
  type: z.enum(['blocks', 'blocked_by', 'relates_to']).default('blocks'),
});

// Task Template Schema
export const taskTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name must be less than 100 characters'),
  description: z.string().max(1000, 'Template description must be less than 1000 characters').optional(),
  type: z.enum(['feature', 'bug', 'improvement', 'task', 'story', 'epic']).default('task'),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  dependencies: z.array(z.string()).optional(),
  checklist: z.array(z.object({
    item: z.string().min(1, 'Checklist item is required').max(200, 'Checklist item must be less than 200 characters'),
    required: z.boolean().default(false),
  })).optional(),
});

// Task Export Schema
export const taskExportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf', 'json']),
  includeComments: z.boolean().default(true),
  includeTimeEntries: z.boolean().default(true),
  includeAttachments: z.boolean().default(false),
  includeDependencies: z.boolean().default(true),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  filters: taskFilterSchema.optional(),
});

// Types
export type TaskCreation = z.infer<typeof taskCreationSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type TaskStatusUpdate = z.infer<typeof taskStatusUpdateSchema>;
export type TaskAssignment = z.infer<typeof taskAssignmentSchema>;
export type TaskComment = z.infer<typeof taskCommentSchema>;
export type TaskCommentUpdate = z.infer<typeof taskCommentUpdateSchema>;
export type TaskSearch = z.infer<typeof taskSearchSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
export type TaskSort = z.infer<typeof taskSortSchema>;
export type TaskBulkUpdate = z.infer<typeof taskBulkUpdateSchema>;
export type TaskDependency = z.infer<typeof taskDependencySchema>;
export type TaskTemplate = z.infer<typeof taskTemplateSchema>;
export type TaskExport = z.infer<typeof taskExportSchema>;
