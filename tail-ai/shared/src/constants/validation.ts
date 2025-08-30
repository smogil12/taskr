// Validation Constants
export const VALIDATION_CONSTANTS = {
  // String Lengths
  STRING_LENGTHS: {
    MIN_NAME: 1,
    MAX_NAME: 100,
    MIN_DESCRIPTION: 0,
    MAX_DESCRIPTION: 1000,
    MIN_BIO: 0,
    MAX_BIO: 500,
    MIN_PASSWORD: 8,
    MAX_PASSWORD: 128,
    MIN_EMAIL: 5,
    MAX_EMAIL: 254,
    MIN_PHONE: 10,
    MAX_PHONE: 20,
    MIN_URL: 10,
    MAX_URL: 2048,
    MIN_TAG: 1,
    MAX_TAG: 50,
    MAX_TAGS: 20,
    MIN_COMMENT: 1,
    MAX_COMMENT: 1000,
    MIN_NOTE: 0,
    MAX_NOTE: 1000,
    MIN_MESSAGE: 1,
    MAX_MESSAGE: 500,
    MIN_TOKEN: 1,
    MAX_TOKEN: 1000,
    MIN_CODE: 6,
    MAX_CODE: 8,
    MIN_SECRET: 32,
    MAX_SECRET: 128,
  },

  // Numeric Ranges
  NUMERIC_RANGES: {
    MIN_ID: 1,
    MAX_ID: 999999999,
    MIN_PAGE: 1,
    MAX_PAGE: 999999,
    MIN_LIMIT: 1,
    MAX_LIMIT: 1000,
    MIN_PRIORITY: 1,
    MAX_PRIORITY: 5,
    MIN_PERCENTAGE: 0,
    MAX_PERCENTAGE: 100,
    MIN_HOURS: 0,
    MAX_HOURS: 8760, // 1 year
    MIN_MINUTES: 0,
    MAX_MINUTES: 525600, // 1 year
    MIN_SECONDS: 0,
    MAX_SECONDS: 31536000, // 1 year
    MIN_AMOUNT: 0,
    MAX_AMOUNT: 999999999.99,
    MIN_RATING: 1,
    MAX_RATING: 5,
    MIN_SCORE: 0,
    MAX_SCORE: 100,
  },

  // Date Ranges
  DATE_RANGES: {
    MIN_DATE: '1900-01-01',
    MAX_DATE: '2100-12-31',
    MIN_AGE: 13,
    MAX_AGE: 120,
    MIN_DURATION_DAYS: 1,
    MAX_DURATION_DAYS: 3650, // 10 years
    MIN_DURATION_HOURS: 0.1,
    MAX_DURATION_HOURS: 8760, // 1 year
    MIN_DURATION_MINUTES: 1,
    MAX_DURATION_MINUTES: 525600, // 1 year
  },

  // File Constraints
  FILE_CONSTRAINTS: {
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
    MAX_FILE_SIZE_MB: 10,
    MAX_FILES_PER_REQUEST: 10,
    MAX_TOTAL_SIZE_BYTES: 100 * 1024 * 1024, // 100MB
    MAX_TOTAL_SIZE_MB: 100,
    ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    ALLOWED_SPREADSHEET_EXTENSIONS: ['.xls', '.xlsx', '.csv'],
    ALLOWED_PRESENTATION_EXTENSIONS: ['.ppt', '.pptx'],
    ALLOWED_ARCHIVE_EXTENSIONS: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    ALLOWED_VIDEO_EXTENSIONS: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
    ALLOWED_AUDIO_EXTENSIONS: ['.mp3', '.wav', '.flac', '.aac', '.ogg'],
  },

  // Pattern Constraints
  PATTERNS: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/,
    IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
    DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  },

  // Business Rules
  BUSINESS_RULES: {
    MAX_PROJECTS_PER_ORGANIZATION: 1000,
    MAX_TASKS_PER_PROJECT: 10000,
    MAX_TIME_ENTRIES_PER_DAY: 100,
    MAX_COMMENTS_PER_TASK: 1000,
    MAX_ATTACHMENTS_PER_TASK: 50,
    MAX_MEMBERS_PER_ORGANIZATION: 1000,
    MAX_MEMBERS_PER_PROJECT: 100,
    MAX_TEAMS_PER_ORGANIZATION: 100,
    MAX_MEMBERS_PER_TEAM: 50,
    MAX_WEBHOOKS_PER_ORGANIZATION: 50,
    MAX_INTEGRATIONS_PER_ORGANIZATION: 20,
    MAX_TEMPLATES_PER_ORGANIZATION: 100,
    MAX_CUSTOM_FIELDS_PER_ENTITY: 50,
    MAX_TAGS_PER_ENTITY: 20,
    MAX_DEPENDENCIES_PER_TASK: 20,
    MAX_SUBTASKS_PER_TASK: 100,
    MAX_VERSIONS_PER_ENTITY: 100,
    MAX_AUDIT_LOGS_PER_ENTITY: 10000,
    MAX_NOTIFICATIONS_PER_USER: 1000,
    MAX_SESSIONS_PER_USER: 10,
  },

  // Rate Limiting
  RATE_LIMITING: {
    MAX_REQUESTS_PER_MINUTE: 100,
    MAX_REQUESTS_PER_HOUR: 1000,
    MAX_REQUESTS_PER_DAY: 10000,
    MAX_LOGIN_ATTEMPTS_PER_15MIN: 5,
    MAX_PASSWORD_RESET_ATTEMPTS_PER_HOUR: 3,
    MAX_EMAIL_VERIFICATION_ATTEMPTS_PER_HOUR: 5,
    MAX_FILE_UPLOADS_PER_HOUR: 100,
    MAX_EXPORTS_PER_HOUR: 10,
    MAX_IMPORTS_PER_HOUR: 5,
    MAX_BULK_OPERATIONS_PER_HOUR: 20,
    MAX_WEBHOOK_CALLS_PER_MINUTE: 60,
    MAX_API_CALLS_PER_MINUTE: 1000,
  },

  // Cache TTL (Time To Live)
  CACHE_TTL: {
    USER_PROFILE: 15 * 60, // 15 minutes
    PROJECT_LIST: 10 * 60, // 10 minutes
    TASK_LIST: 5 * 60, // 5 minutes
    TIME_ENTRY_LIST: 2 * 60, // 2 minutes
    ORGANIZATION_LIST: 30 * 60, // 30 minutes
    TEAM_LIST: 15 * 60, // 15 minutes
    STATISTICS: 60 * 60, // 1 hour
    REPORTS: 30 * 60, // 30 minutes
    INTEGRATIONS: 60 * 60, // 1 hour
    WEBHOOKS: 15 * 60, // 15 minutes
    TEMPLATES: 60 * 60, // 1 hour
    SETTINGS: 30 * 60, // 30 minutes
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MIN_LIMIT: 1,
    MAX_LIMIT: 1000,
    MAX_OFFSET: 100000,
  },

  // Search
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    MAX_SEARCH_RESULTS: 1000,
    FUZZY_SEARCH_THRESHOLD: 0.7,
    AUTOCOMPLETE_LIMIT: 10,
    SUGGESTION_LIMIT: 5,
  },

  // Export/Import
  EXPORT_IMPORT: {
    MAX_EXPORT_RECORDS: 100000,
    MAX_IMPORT_RECORDS: 100000,
    MAX_EXPORT_SIZE_MB: 100,
    MAX_IMPORT_SIZE_MB: 100,
    EXPORT_TIMEOUT_SECONDS: 300, // 5 minutes
    IMPORT_TIMEOUT_SECONDS: 600, // 10 minutes
    SUPPORTED_FORMATS: ['csv', 'xlsx', 'json', 'xml', 'pdf'],
  },

  // Real-time
  REAL_TIME: {
    MAX_CONNECTIONS_PER_USER: 5,
    MAX_CHANNELS_PER_CONNECTION: 20,
    HEARTBEAT_INTERVAL_SECONDS: 30,
    CONNECTION_TIMEOUT_SECONDS: 60,
    MAX_MESSAGE_SIZE_BYTES: 1024 * 1024, // 1MB
    MAX_MESSAGES_PER_MINUTE: 1000,
  },

  // Security
  SECURITY: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    PASSWORD_COMPLEXITY: {
      MIN_UPPERCASE: 1,
      MIN_LOWERCASE: 1,
      MIN_NUMBERS: 1,
      MIN_SYMBOLS: 1,
    },
    SESSION_TIMEOUT_MINUTES: 480, // 8 hours
    IDLE_TIMEOUT_MINUTES: 30,
    MAX_SESSIONS_PER_USER: 10,
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCKOUT_DURATION_MINUTES: 30,
    PASSWORD_HISTORY_SIZE: 5,
    PASSWORD_MAX_AGE_DAYS: 365,
    TWO_FACTOR_BACKUP_CODES_COUNT: 10,
    TWO_FACTOR_BACKUP_CODE_LENGTH: 8,
    JWT_EXPIRES_IN_MINUTES: 15,
    REFRESH_TOKEN_EXPIRES_IN_DAYS: 7,
  },
} as const;

// Validation Error Messages
export const VALIDATION_ERROR_MESSAGES = {
  // General
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  TOO_SHORT: 'Too short',
  TOO_LONG: 'Too long',
  INVALID_VALUE: 'Invalid value',
  MUST_BE_NUMBER: 'Must be a number',
  MUST_BE_STRING: 'Must be a string',
  MUST_BE_BOOLEAN: 'Must be a boolean',
  MUST_BE_DATE: 'Must be a valid date',
  MUST_BE_ARRAY: 'Must be an array',
  MUST_BE_OBJECT: 'Must be an object',

  // String Validation
  STRING_TOO_SHORT: 'Must be at least {min} characters',
  STRING_TOO_LONG: 'Must be no more than {max} characters',
  STRING_LENGTH_RANGE: 'Must be between {min} and {max} characters',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_URL: 'Invalid URL',
  INVALID_SLUG: 'Invalid slug format',
  INVALID_USERNAME: 'Invalid username format',
  INVALID_PASSWORD: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  INVALID_HEX_COLOR: 'Invalid hex color format',
  INVALID_UUID: 'Invalid UUID format',
  INVALID_CREDIT_CARD: 'Invalid credit card number',
  INVALID_IP_ADDRESS: 'Invalid IP address format',
  INVALID_TIME: 'Invalid time format (use HH:MM)',
  INVALID_DATE: 'Invalid date format (use YYYY-MM-DD)',
  INVALID_DATETIME: 'Invalid datetime format',

  // Numeric Validation
  NUMBER_TOO_SMALL: 'Must be at least {min}',
  NUMBER_TOO_LARGE: 'Must be no more than {max}',
  NUMBER_RANGE: 'Must be between {min} and {max}',
  MUST_BE_POSITIVE: 'Must be positive',
  MUST_BE_NEGATIVE: 'Must be negative',
  MUST_BE_INTEGER: 'Must be an integer',
  MUST_BE_DECIMAL: 'Must be a decimal number',

  // Array Validation
  ARRAY_TOO_SHORT: 'Must have at least {min} items',
  ARRAY_TOO_LONG: 'Must have no more than {max} items',
  ARRAY_LENGTH_RANGE: 'Must have between {min} and {max} items',
  DUPLICATE_ITEMS: 'Duplicate items not allowed',
  INVALID_ITEM_TYPE: 'Invalid item type',

  // File Validation
  FILE_TOO_LARGE: 'File size must be no more than {maxSize}',
  INVALID_FILE_TYPE: 'Invalid file type',
  TOO_MANY_FILES: 'Too many files (maximum {max})',
  TOTAL_SIZE_TOO_LARGE: 'Total file size must be no more than {maxSize}',

  // Business Rule Validation
  MAX_PROJECTS_EXCEEDED: 'Maximum number of projects exceeded',
  MAX_TASKS_EXCEEDED: 'Maximum number of tasks exceeded',
  MAX_MEMBERS_EXCEEDED: 'Maximum number of members exceeded',
  MAX_TEAMS_EXCEEDED: 'Maximum number of teams exceeded',
  MAX_WEBHOOKS_EXCEEDED: 'Maximum number of webhooks exceeded',
  MAX_INTEGRATIONS_EXCEEDED: 'Maximum number of integrations exceeded',

  // Date Validation
  DATE_TOO_EARLY: 'Date must be no earlier than {min}',
  DATE_TOO_LATE: 'Date must be no later than {max}',
  DATE_RANGE: 'Date must be between {min} and {max}',
  INVALID_DATE_RANGE: 'Start date must be before end date',
  DATE_IN_PAST: 'Date cannot be in the past',
  DATE_IN_FUTURE: 'Date cannot be in the future',

  // Time Validation
  TIME_TOO_EARLY: 'Time must be no earlier than {min}',
  TIME_TOO_LATE: 'Time must be no later than {max}',
  TIME_RANGE: 'Time must be between {min} and {max}',
  INVALID_TIME_RANGE: 'Start time must be before end time',
  DURATION_TOO_SHORT: 'Duration must be at least {min}',
  DURATION_TOO_LONG: 'Duration must be no more than {max}',

  // Custom Validation
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  EMAIL_ALREADY_EXISTS: 'Email address already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  SLUG_ALREADY_EXISTS: 'Slug already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_LOCKED: 'Account is locked',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  EMAIL_NOT_VERIFIED: 'Email address not verified',
  TWO_FACTOR_REQUIRED: 'Two-factor authentication required',
  INVALID_TWO_FACTOR_CODE: 'Invalid two-factor authentication code',
  SESSION_EXPIRED: 'Session has expired',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  PASSWORD_TOO_WEAK: 'Password is too weak',
  PASSWORD_REUSE_NOT_ALLOWED: 'Cannot reuse recent passwords',
  SUSPICIOUS_ACTIVITY: 'Suspicious activity detected',
} as const;
