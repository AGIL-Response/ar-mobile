/**
 * Base API Response Types
 * Common response structures used across the application
 */

export interface BaseApiResponse<T> {
  code: string;
  data: T;
  message?: string;
}

export interface PaginatedApiResponse<T> extends BaseApiResponse<T[]> {
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status?: number;
}
