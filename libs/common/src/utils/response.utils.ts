/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

/**
 * Paginated API response structure
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Response utility functions
 */
export class ResponseUtils {
  /**
   * Create success response
   */
  static success<T = any>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      message: message || 'Operation successful',
      data,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Create error response
   */
  static error(
    message: string,
    code: string = 'INTERNAL_ERROR',
    details?: any,
  ): ApiResponse {
    return {
      success: false,
      message: 'Operation failed',
      error: {
        code,
        message,
        details,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Create paginated response
   */
  static paginated<T = any>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string,
  ): PaginatedApiResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: message || 'Data retrieved successfully',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Create not found response
   */
  static notFound(resource: string = 'Resource'): ApiResponse {
    return this.error(`${resource} not found`, 'NOT_FOUND');
  }

  /**
   * Create validation error response
   */
  static validationError(errors: any): ApiResponse {
    return this.error('Validation failed', 'VALIDATION_ERROR', errors);
  }

  /**
   * Create unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized access'): ApiResponse {
    return this.error(message, 'UNAUTHORIZED');
  }

  /**
   * Create forbidden response
   */
  static forbidden(message: string = 'Access forbidden'): ApiResponse {
    return this.error(message, 'FORBIDDEN');
  }
}
