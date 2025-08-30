// API Constants
export const API_CONSTANTS = {
  // API Versioning
  CURRENT_VERSION: 'v1',
  SUPPORTED_VERSIONS: ['v1'],
  DEPRECATION_WARNING_DAYS: 90,

  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Rate Limiting
  RATE_LIMITS: {
    DEFAULT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    DEFAULT_MAX_REQUESTS: 100,
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 5,
    UPLOAD_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    UPLOAD_MAX_REQUESTS: 10,
    API_WINDOW_MS: 60 * 1000, // 1 minute
    API_MAX_REQUESTS: 60,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_PER_REQUEST: 10,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALLOWED_SPREADSHEET_TYPES: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ALLOWED_PRESENTATION_TYPES: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    IMAGE_THUMBNAIL_SIZE: 200,
    IMAGE_PREVIEW_SIZE: 800,
  },

  // Search
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    DEFAULT_RESULTS_LIMIT: 50,
    MAX_RESULTS_LIMIT: 200,
    FUZZY_SEARCH_THRESHOLD: 0.7,
  },

  // Caching
  CACHE: {
    DEFAULT_TTL: 5 * 60, // 5 minutes
    USER_PROFILE_TTL: 15 * 60, // 15 minutes
    PROJECT_LIST_TTL: 10 * 60, // 10 minutes
    TASK_LIST_TTL: 5 * 60, // 5 minutes
    TIME_ENTRY_TTL: 2 * 60, // 2 minutes
    STATISTICS_TTL: 60 * 60, // 1 hour
    MAX_CACHE_SIZE: 1000,
  },

  // Webhooks
  WEBHOOK: {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 5000, // 5 seconds
    MAX_PAYLOAD_SIZE: 1024 * 1024, // 1MB
    TIMEOUT_MS: 10000, // 10 seconds
    MAX_WEBHOOKS_PER_ORGANIZATION: 50,
  },

  // Export/Import
  EXPORT_IMPORT: {
    MAX_EXPORT_SIZE: 10000, // records
    MAX_IMPORT_SIZE: 10000, // records
    SUPPORTED_FORMATS: ['csv', 'xlsx', 'json'],
    EXPORT_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
    IMPORT_TIMEOUT_MS: 10 * 60 * 1000, // 10 minutes
  },

  // Bulk Operations
  BULK_OPERATIONS: {
    MAX_ITEMS_PER_OPERATION: 1000,
    MAX_CONCURRENT_OPERATIONS: 5,
    OPERATION_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  },

  // Real-time Updates
  REAL_TIME: {
    HEARTBEAT_INTERVAL_MS: 30000, // 30 seconds
    CONNECTION_TIMEOUT_MS: 60000, // 1 minute
    MAX_CONNECTIONS_PER_USER: 5,
    MAX_CHANNELS_PER_CONNECTION: 20,
  },

  // Health Checks
  HEALTH_CHECK: {
    TIMEOUT_MS: 5000, // 5 seconds
    CHECK_INTERVAL_MS: 30000, // 30 seconds
    UNHEALTHY_THRESHOLD: 3,
    HEALTHY_THRESHOLD: 2,
  },

  // Monitoring
  MONITORING: {
    SLOW_QUERY_THRESHOLD_MS: 1000, // 1 second
    ERROR_RATE_THRESHOLD: 0.05, // 5%
    RESPONSE_TIME_THRESHOLD_MS: 2000, // 2 seconds
    LOG_LEVEL: 'info',
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    TWO_FACTOR_SETUP: '/api/auth/2fa/setup',
    TWO_FACTOR_VERIFY: '/api/auth/2fa/verify',
    OAUTH_CALLBACK: '/api/auth/oauth/callback',
  },

  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    PREFERENCES: '/api/users/preferences',
    SESSIONS: '/api/users/sessions',
    INVITATIONS: '/api/users/invitations',
  },

  // Organizations
  ORGANIZATIONS: {
    LIST: '/api/organizations',
    CREATE: '/api/organizations',
    DETAILS: '/api/organizations/:id',
    UPDATE: '/api/organizations/:id',
    DELETE: '/api/organizations/:id',
    MEMBERS: '/api/organizations/:id/members',
    INVITE_MEMBER: '/api/organizations/:id/members/invite',
    SETTINGS: '/api/organizations/:id/settings',
    TEAMS: '/api/organizations/:id/teams',
  },

  // Projects
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    DETAILS: '/api/projects/:id',
    UPDATE: '/api/projects/:id',
    DELETE: '/api/projects/:id',
    MEMBERS: '/api/projects/:id/members',
    TASKS: '/api/projects/:id/tasks',
    TIME_ENTRIES: '/api/projects/:id/time-entries',
    REPORTS: '/api/projects/:id/reports',
  },

  // Tasks
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    DETAILS: '/api/tasks/:id',
    UPDATE: '/api/tasks/:id',
    DELETE: '/api/tasks/:id',
    COMMENTS: '/api/tasks/:id/comments',
    ATTACHMENTS: '/api/tasks/:id/attachments',
    DEPENDENCIES: '/api/tasks/:id/dependencies',
    TIME_ENTRIES: '/api/tasks/:id/time-entries',
  },

  // Time Entries
  TIME_ENTRIES: {
    LIST: '/api/time-entries',
    CREATE: '/api/time-entries',
    START: '/api/time-entries/start',
    STOP: '/api/time-entries/:id/stop',
    UPDATE: '/api/time-entries/:id',
    DELETE: '/api/time-entries/:id',
    BULK_CREATE: '/api/time-entries/bulk',
    EXPORT: '/api/time-entries/export',
    SUMMARY: '/api/time-entries/summary',
  },

  // Reports
  REPORTS: {
    DASHBOARD: '/api/reports/dashboard',
    PROJECTS: '/api/reports/projects',
    TIME_TRACKING: '/api/reports/time-tracking',
    PRODUCTIVITY: '/api/reports/productivity',
    BILLING: '/api/reports/billing',
    TEAM_PERFORMANCE: '/api/reports/team-performance',
    EXPORT: '/api/reports/export',
  },

  // Integrations
  INTEGRATIONS: {
    LIST: '/api/integrations',
    CONFIGURE: '/api/integrations/:provider/configure',
    CONNECT: '/api/integrations/:provider/connect',
    DISCONNECT: '/api/integrations/:provider/disconnect',
    WEBHOOKS: '/api/integrations/:provider/webhooks',
    SYNC: '/api/integrations/:provider/sync',
  },

  // Webhooks
  WEBHOOKS: {
    LIST: '/api/webhooks',
    CREATE: '/api/webhooks',
    UPDATE: '/api/webhooks/:id',
    DELETE: '/api/webhooks/:id',
    TEST: '/api/webhooks/:id/test',
    LOGS: '/api/webhooks/:id/logs',
  },

  // System
  SYSTEM: {
    HEALTH: '/api/health',
    STATUS: '/api/status',
    METRICS: '/api/metrics',
    LOGS: '/api/logs',
    CONFIG: '/api/config',
  },
} as const;

// API Error Codes
export const API_ERROR_CODES = {
  // General Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INVALID_REQUEST: 'INVALID_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE: 'RESOURCE_IN_USE',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',

  // Business Logic Errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_OPERATION: 'INVALID_OPERATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  DEPENDENCY_CONFLICT: 'DEPENDENCY_CONFLICT',

  // External Service Errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  EXTERNAL_SERVICE_TIMEOUT: 'EXTERNAL_SERVICE_TIMEOUT',
  EXTERNAL_SERVICE_UNAVAILABLE: 'EXTERNAL_SERVICE_UNAVAILABLE',

  // File Upload Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',

  // Export/Import Errors
  EXPORT_FAILED: 'EXPORT_FAILED',
  IMPORT_FAILED: 'IMPORT_FAILED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
} as const;
