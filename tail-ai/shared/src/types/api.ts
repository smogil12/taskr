export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
}

export interface ApiError {
  field?: string;
  message: string;
  code: string;
  details?: any;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

export interface ApiRequest<T = any> {
  data?: T;
  params?: Record<string, any>;
  query?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ApiContext {
  userId?: string;
  organizationId?: string;
  permissions?: string[];
  ipAddress?: string;
  userAgent?: string;
  requestId: string;
  timestamp: Date;
}

export interface WebhookPayload<T = any> {
  event: string;
  timestamp: Date;
  data: T;
  signature?: string;
}

export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

export interface BulkOperationResponse {
  success: number;
  failed: number;
  errors: BulkOperationError[];
  results: BulkOperationResult[];
}

export interface BulkOperationError {
  index: number;
  id?: string;
  error: string;
}

export interface BulkOperationResult {
  index: number;
  id: string;
  success: boolean;
  action: string;
}

export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  filters?: Record<string, any>;
  fields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ImportRequest {
  file: File;
  mapping?: Record<string, string>;
  options?: ImportOptions;
}

export interface ImportOptions {
  skipHeader: boolean;
  createMissing: boolean;
  updateExisting: boolean;
  validateData: boolean;
}

export interface ImportResponse {
  total: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ApiHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  details?: any;
}
