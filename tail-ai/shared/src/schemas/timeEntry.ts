import { z } from 'zod';

// Time Entry Start Schema
export const timeEntryStartSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  taskId: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  billable: z.boolean().default(false),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  device: z.string().max(100, 'Device must be less than 100 characters').optional(),
});

// Time Entry Stop Schema
export const timeEntryStopSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Time Entry Update Schema
export const timeEntryUpdateSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
  billable: z.boolean().optional(),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Time Entry Manual Schema
export const timeEntryManualSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  taskId: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  startTime: z.date(),
  endTime: z.date(),
  billable: z.boolean().default(false),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(20, 'Maximum 20 tags allowed').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  device: z.string().max(100, 'Device must be less than 100 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
}).refine(data => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

// Time Entry Bulk Create Schema
export const timeEntryBulkCreateSchema = z.object({
  entries: z.array(timeEntryManualSchema).min(1, 'At least one time entry is required').max(100, 'Maximum 100 time entries can be created at once'),
});

// Time Entry Search Schema
export const timeEntrySearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  billable: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  durationRange: z.object({
    min: z.number().min(0, 'Minimum duration must be positive').optional(),
    max: z.number().min(0, 'Maximum duration must be positive').optional(),
  }).optional(),
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').optional(),
});

// Time Entry Filter Schema
export const timeEntryFilterSchema = z.object({
  userIds: z.array(z.string()).optional(),
  projectIds: z.array(z.string()).optional(),
  taskIds: z.array(z.string()).optional(),
  billable: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  hasNotes: z.boolean().optional(),
  hasLocation: z.boolean().optional(),
  isRunning: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  startTimeAfter: z.date().optional(),
  startTimeBefore: z.date().optional(),
  endTimeAfter: z.date().optional(),
  endTimeBefore: z.date().optional(),
});

// Time Entry Sort Schema
export const timeEntrySortSchema = z.object({
  field: z.enum(['startTime', 'endTime', 'duration', 'description', 'billable', 'hourlyRate', 'createdAt', 'updatedAt']),
  direction: z.enum(['asc', 'desc']),
});

// Time Entry Summary Schema
export const timeEntrySummarySchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  groupBy: z.enum(['day', 'week', 'month', 'project', 'task', 'user']).default('day'),
  filters: timeEntryFilterSchema.optional(),
  includeDetails: z.boolean().default(false),
});

// Time Entry Export Schema
export const timeEntryExportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf', 'json']),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  groupBy: z.enum(['day', 'week', 'month', 'project', 'task', 'user']).optional(),
  includeDetails: z.boolean().default(true),
  includeNotes: z.boolean().default(true),
  includeLocation: z.boolean().default(false),
  filters: timeEntryFilterSchema.optional(),
});

// Time Tracking Settings Schema
export const timeTrackingSettingsSchema = z.object({
  autoStart: z.boolean().default(false),
  autoStop: z.boolean().default(false),
  reminderInterval: z.number().min(1, 'Reminder interval must be at least 1 minute').max(1440, 'Reminder interval must be less than 24 hours').default(30),
  breakReminders: z.boolean().default(true),
  idleDetection: z.boolean().default(true),
  idleTimeout: z.number().min(1, 'Idle timeout must be at least 1 minute').max(1440, 'Idle timeout must be less than 24 hours').default(15),
  roundingRules: z.array(z.object({
    name: z.string().min(1, 'Rule name is required').max(100, 'Rule name must be less than 100 characters'),
    roundTo: z.number().min(1, 'Round to must be at least 1 minute').max(60, 'Round to must be less than 60 minutes'),
    threshold: z.number().min(0, 'Threshold must be positive').max(60, 'Threshold must be less than 60 minutes'),
    enabled: z.boolean().default(true),
  })).optional(),
  defaultBillable: z.boolean().default(false),
  defaultHourlyRate: z.number().min(0, 'Default hourly rate must be positive').optional(),
});

// Time Rounding Rule Schema
export const timeRoundingRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required').max(100, 'Rule name must be less than 100 characters'),
  roundTo: z.number().min(1, 'Round to must be at least 1 minute').max(60, 'Round to must be less than 60 minutes'),
  threshold: z.number().min(0, 'Threshold must be positive').max(60, 'Threshold must be less than 60 minutes'),
  enabled: z.boolean().default(true),
});

// Time Entry Import Schema
export const timeEntryImportSchema = z.object({
  file: z.any(), // File object
  mapping: z.record(z.string(), z.string()).optional(),
  options: z.object({
    skipHeader: z.boolean().default(true),
    createMissing: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
    validateData: z.boolean().default(true),
  }).optional(),
});

// Types
export type TimeEntryStart = z.infer<typeof timeEntryStartSchema>;
export type TimeEntryStop = z.infer<typeof timeEntryStopSchema>;
export type TimeEntryUpdate = z.infer<typeof timeEntryUpdateSchema>;
export type TimeEntryManual = z.infer<typeof timeEntryManualSchema>;
export type TimeEntryBulkCreate = z.infer<typeof timeEntryBulkCreateSchema>;
export type TimeEntrySearch = z.infer<typeof timeEntrySearchSchema>;
export type TimeEntryFilter = z.infer<typeof timeEntryFilterSchema>;
export type TimeEntrySort = z.infer<typeof timeEntrySortSchema>;
export type TimeEntrySummary = z.infer<typeof timeEntrySummarySchema>;
export type TimeEntryExport = z.infer<typeof timeEntryExportSchema>;
export type TimeTrackingSettings = z.infer<typeof timeTrackingSettingsSchema>;
export type TimeRoundingRule = z.infer<typeof timeRoundingRuleSchema>;
export type TimeEntryImport = z.infer<typeof timeEntryImportSchema>;
