import { z } from 'zod';

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').default(20),
});

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  fields: z.array(z.string()).min(1, 'At least one search field is required').optional(),
  filters: z.record(z.any()).optional(),
  sort: z.object({
    field: z.string().min(1, 'Sort field is required'),
    direction: z.enum(['asc', 'desc']).default('asc'),
  }).optional(),
  pagination: paginationSchema.optional(),
});

// Sort Schema
export const sortSchema = z.object({
  field: z.string().min(1, 'Sort field is required'),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

// Filter Schema
export const filterSchema = z.object({
  field: z.string().min(1, 'Filter field is required'),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'startsWith', 'endsWith', 'regex']),
  value: z.any(),
});

// Date Range Schema
export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
}).refine(data => !data.from || !data.to || data.from <= data.to, {
  message: 'From date must be before or equal to to date',
  path: ['to'],
});

// Number Range Schema
export const numberRangeSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
}).refine(data => !data.min || !data.max || data.min <= data.max, {
  message: 'Min value must be less than or equal to max value',
  path: ['max'],
});

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.any(), // File object
  allowedTypes: z.array(z.string()).optional(),
  maxSize: z.number().min(1, 'Max file size must be positive').optional(), // bytes
  allowedExtensions: z.array(z.string()).optional(),
});

// File Upload Response Schema
export const fileUploadResponseSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  url: z.string().url('Invalid file URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  uploadedAt: z.date(),
});

// Bulk Operation Schema
export const bulkOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete', 'export', 'import']),
  items: z.array(z.any()).min(1, 'At least one item is required').max(1000, 'Maximum 1000 items allowed'),
  options: z.record(z.any()).optional(),
});

// Bulk Operation Response Schema
export const bulkOperationResponseSchema = z.object({
  success: z.number().min(0, 'Success count must be positive'),
  failed: z.number().min(0, 'Failed count must be positive'),
  errors: z.array(z.object({
    index: z.number().min(0, 'Index must be positive'),
    id: z.string().optional(),
    error: z.string().min(1, 'Error message is required'),
    details: z.any().optional(),
  })).optional(),
  results: z.array(z.object({
    index: z.number().min(0, 'Index must be positive'),
    id: z.string(),
    success: z.boolean(),
    action: z.string(),
    data: z.any().optional(),
  })).optional(),
});

// Export Schema
export const exportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf', 'json']),
  filters: z.record(z.any()).optional(),
  fields: z.array(z.string()).optional(),
  sort: sortSchema.optional(),
  dateRange: dateRangeSchema.optional(),
  includeMetadata: z.boolean().default(true),
  compression: z.boolean().default(false),
});

// Import Schema
export const importSchema = z.object({
  file: z.any(), // File object
  format: z.enum(['csv', 'xlsx', 'json']),
  mapping: z.record(z.string(), z.string()).optional(),
  options: z.object({
    skipHeader: z.boolean().default(true),
    createMissing: z.boolean().default(false),
    updateExisting: z.boolean().default(false),
    validateData: z.boolean().default(true),
    dryRun: z.boolean().default(false),
  }).optional(),
});

// Import Response Schema
export const importResponseSchema = z.object({
  total: z.number().min(0, 'Total count must be positive'),
  imported: z.number().min(0, 'Imported count must be positive'),
  skipped: z.number().min(0, 'Skipped count must be positive'),
  errors: z.array(z.object({
    row: z.number().min(1, 'Row number must be positive'),
    field: z.string().min(1, 'Field name is required'),
    message: z.string().min(1, 'Error message is required'),
    value: z.any().optional(),
  })).optional(),
  warnings: z.array(z.object({
    row: z.number().min(1, 'Row number must be positive'),
    field: z.string().min(1, 'Field name is required'),
    message: z.string().min(1, 'Warning message is required'),
    value: z.any().optional(),
  })).optional(),
  summary: z.record(z.any()).optional(),
});

// Webhook Schema
export const webhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  secret: z.string().min(1, 'Webhook secret is required'),
  headers: z.record(z.string()).optional(),
  isActive: z.boolean().default(true),
  retryCount: z.number().min(0, 'Retry count must be positive').max(10, 'Retry count must be less than 10').default(3),
  timeout: z.number().min(1000, 'Timeout must be at least 1000ms').max(30000, 'Timeout must be less than 30000ms').default(10000),
});

// Webhook Payload Schema
export const webhookPayloadSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  timestamp: z.date(),
  data: z.any(),
  signature: z.string().optional(),
  requestId: z.string().optional(),
});

// API Response Schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  errors: z.array(z.object({
    field: z.string().optional(),
    message: z.string().min(1, 'Error message is required'),
    code: z.string().min(1, 'Error code is required'),
    details: z.any().optional(),
  })).optional(),
  meta: z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    total: z.number().optional(),
    totalPages: z.number().optional(),
    hasNext: z.boolean().optional(),
    hasPrev: z.boolean().optional(),
  }).optional(),
});

// API Error Schema
export const apiErrorSchema = z.object({
  field: z.string().optional(),
  message: z.string().min(1, 'Error message is required'),
  code: z.string().min(1, 'Error code is required'),
  details: z.any().optional(),
});

// Validation Error Schema
export const validationErrorSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  message: z.string().min(1, 'Validation message is required'),
  code: z.string().min(1, 'Validation code is required'),
  value: z.any().optional(),
  constraints: z.record(z.any()).optional(),
});

// Validation Result Schema
export const validationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(validationErrorSchema).optional(),
  warnings: z.array(validationErrorSchema).optional(),
});

// Health Check Schema
export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.date(),
  uptime: z.number().min(0, 'Uptime must be positive'),
  version: z.string().min(1, 'Version is required'),
  checks: z.array(z.object({
    name: z.string().min(1, 'Check name is required'),
    status: z.enum(['healthy', 'unhealthy']),
    responseTime: z.number().min(0, 'Response time must be positive').optional(),
    details: z.any().optional(),
  })).optional(),
});

// Rate Limit Schema
export const rateLimitSchema = z.object({
  windowMs: z.number().min(1000, 'Window must be at least 1000ms').max(86400000, 'Window must be less than 24 hours'),
  maxRequests: z.number().min(1, 'Max requests must be at least 1').max(10000, 'Max requests must be less than 10000'),
  message: z.string().optional(),
  statusCode: z.number().min(400, 'Status code must be at least 400').max(599, 'Status code must be less than 600').default(429),
});

// Cache Config Schema
export const cacheConfigSchema = z.object({
  ttl: z.number().min(1, 'TTL must be at least 1 second').max(31536000, 'TTL must be less than 1 year'),
  maxSize: z.number().min(1, 'Max size must be at least 1').max(1000000, 'Max size must be less than 1000000'),
  strategy: z.enum(['lru', 'fifo', 'ttl']).default('lru'),
  compression: z.boolean().default(false),
  encryption: z.boolean().default(false),
});

// Database Config Schema
export const databaseConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1, 'Port must be positive').max(65535, 'Port must be less than 65536'),
  database: z.string().min(1, 'Database name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  ssl: z.boolean().default(false),
  pool: z.object({
    min: z.number().min(1, 'Min pool size must be at least 1').max(100, 'Min pool size must be less than 100').default(5),
    max: z.number().min(1, 'Max pool size must be at least 1').max(1000, 'Max pool size must be less than 1000').default(20),
    acquireTimeout: z.number().min(1000, 'Acquire timeout must be at least 1000ms').max(60000, 'Acquire timeout must be less than 60000ms').default(30000),
    idleTimeout: z.number().min(1000, 'Idle timeout must be at least 1000ms').max(600000, 'Idle timeout must be less than 600000ms').default(300000),
  }).optional(),
});

// Redis Config Schema
export const redisConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1, 'Port must be positive').max(65535, 'Port must be less than 65536'),
  password: z.string().optional(),
  db: z.number().min(0, 'Database number must be positive').max(15, 'Database number must be less than 16').default(0),
  keyPrefix: z.string().default('tail-ai:'),
  retryDelayOnFailover: z.number().min(100, 'Retry delay must be at least 100ms').max(10000, 'Retry delay must be less than 10000ms').default(1000),
  maxRetriesPerRequest: z.number().min(1, 'Max retries must be at least 1').max(10, 'Max retries must be less than 10').default(3),
});

// Types
export type Pagination = z.infer<typeof paginationSchema>;
export type Search = z.infer<typeof searchSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type Filter = z.infer<typeof filterSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type NumberRange = z.infer<typeof numberRangeSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
export type BulkOperation = z.infer<typeof bulkOperationSchema>;
export type BulkOperationResponse = z.infer<typeof bulkOperationResponseSchema>;
export type Export = z.infer<typeof exportSchema>;
export type Import = z.infer<typeof importSchema>;
export type ImportResponse = z.infer<typeof importResponseSchema>;
export type Webhook = z.infer<typeof webhookSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type RateLimit = z.infer<typeof rateLimitSchema>;
export type CacheConfig = z.infer<typeof cacheConfigSchema>;
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type RedisConfig = z.infer<typeof redisConfigSchema>;
