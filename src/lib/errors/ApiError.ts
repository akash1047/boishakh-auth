/**
 * HTTP status codes enum for better type safety
 */
export enum HttpStatusCode {
  // Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,

  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Error types for categorizing errors
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  NETWORK = 'NETWORK_ERROR',
}

/**
 * Interface for error details that can be included in the error response
 */
export interface ErrorDetails {
  field?: string;
  code?: string;
  value?: unknown;
  constraint?: string;
  resource?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Interface for structured error metadata for logging
 */
export interface ErrorMetadata {
  userId?: string;
  requestId?: string;
  correlationId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  timestamp?: string;
  environment?: string;
  service?: string;
  version?: string;
  [key: string]: unknown;
}

/**
 * Interface for Mongoose validation errors
 */
interface MongooseValidationError extends Error {
  errors?: Record<
    string,
    {
      message: string;
      value: unknown;
      kind: string;
      path: string;
    }
  >;
}

/**
 * ApiError class that extends Error for comprehensive error handling
 * Designed for Express servers with Winston logging support
 */
export default class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly type: ErrorType;
  public readonly details?: ErrorDetails;
  public readonly metadata?: ErrorMetadata;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly errorId: string;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    type: ErrorType = ErrorType.INTERNAL,
    details?: ErrorDetails,
    metadata?: ErrorMetadata,
    isOperational = true
  ) {
    super(message);

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // Set error properties
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.metadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      service: 'boishakh-auth',
      version: '1.0.0',
    };
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    this.errorId = this.generateErrorId();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Generate a unique error ID for tracking
   */
  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  /**
   * Get error response object for API responses
   */
  public toJSON(): Record<string, unknown> {
    const errorObj: Record<string, unknown> = {
      message: this.message,
      type: this.type,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      errorId: this.errorId,
    };

    // Include details if available and not in production
    if (this.details && process.env.NODE_ENV !== 'production') {
      errorObj.details = this.details;
    }

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development' && this.stack) {
      errorObj.stack = this.stack;
    }

    return {
      error: errorObj,
    };
  }

  /**
   * Get logging object optimized for Winston
   */
  public toLogObject(): Record<string, unknown> {
    return {
      message: this.message,
      errorId: this.errorId,
      statusCode: this.statusCode,
      type: this.type,
      name: this.name,
      stack: this.stack,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      details: this.details,
      metadata: this.metadata,
    };
  }

  /**
   * Check if error is operational (expected business logic error)
   */
  public isOperationalError(): boolean {
    return this.isOperational;
  }

  /**
   * Check if error should be exposed to client
   */
  public shouldExposeToClient(): boolean {
    return this.isOperational && this.statusCode < 500;
  }

  /**
   * Get log level based on status code
   */
  public getLogLevel(): string {
    if (this.statusCode >= 500) {
      return 'error';
    } else if (this.statusCode >= 400) {
      return 'warn';
    } else {
      return 'info';
    }
  }

  // Static factory methods for common error types

  /**
   * Create a validation error
   */
  static validation(
    message: string,
    details?: ErrorDetails,
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message,
      HttpStatusCode.BAD_REQUEST,
      ErrorType.VALIDATION,
      details,
      metadata
    );
  }

  /**
   * Create an authentication error
   */
  static authentication(
    message = 'Authentication required',
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message,
      HttpStatusCode.UNAUTHORIZED,
      ErrorType.AUTHENTICATION,
      undefined,
      metadata
    );
  }

  /**
   * Create an authorization error
   */
  static authorization(
    message = 'Insufficient permissions',
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message,
      HttpStatusCode.FORBIDDEN,
      ErrorType.AUTHORIZATION,
      undefined,
      metadata
    );
  }

  /**
   * Create a not found error
   */
  static notFound(resource = 'Resource', metadata?: ErrorMetadata): ApiError {
    return new ApiError(
      `${resource} not found`,
      HttpStatusCode.NOT_FOUND,
      ErrorType.NOT_FOUND,
      { resource },
      metadata
    );
  }

  /**
   * Create a conflict error
   */
  static conflict(
    message: string,
    details?: ErrorDetails,
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message,
      HttpStatusCode.CONFLICT,
      ErrorType.CONFLICT,
      details,
      metadata
    );
  }

  /**
   * Create a rate limit error
   */
  static rateLimitExceeded(
    message = 'Rate limit exceeded',
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message,
      HttpStatusCode.TOO_MANY_REQUESTS,
      ErrorType.RATE_LIMIT,
      undefined,
      metadata
    );
  }

  /**
   * Create an internal server error
   */
  static internal(
    message = 'Internal server error',
    details?: ErrorDetails,
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      ErrorType.INTERNAL,
      details,
      metadata,
      false // Internal errors are not operational by default
    );
  }

  /**
   * Create a database error
   */
  static database(
    message: string,
    details?: ErrorDetails,
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      ErrorType.DATABASE,
      details,
      metadata,
      false
    );
  }

  /**
   * Create an external service error
   */
  static externalService(
    serviceName: string,
    message?: string,
    metadata?: ErrorMetadata
  ): ApiError {
    return new ApiError(
      message ?? `External service '${serviceName}' is unavailable`,
      HttpStatusCode.BAD_GATEWAY,
      ErrorType.EXTERNAL_SERVICE,
      { service: serviceName },
      metadata,
      false
    );
  }

  /**
   * Convert a generic Error to ApiError
   */
  static fromError(
    error: Error,
    statusCode?: HttpStatusCode,
    type?: ErrorType,
    metadata?: ErrorMetadata
  ): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    return new ApiError(
      error.message,
      statusCode ?? HttpStatusCode.INTERNAL_SERVER_ERROR,
      type ?? ErrorType.INTERNAL,
      undefined,
      metadata,
      false
    );
  }

  /**
   * Handle mongoose validation errors
   */
  static fromMongooseValidation(
    error: MongooseValidationError,
    metadata?: ErrorMetadata
  ): ApiError {
    const details: ErrorDetails = {};

    if (error.errors) {
      Object.keys(error.errors).forEach(field => {
        const fieldError = error.errors?.[field];
        if (fieldError) {
          details[field] = {
            message: fieldError.message,
            value: fieldError.value,
            kind: fieldError.kind,
          };
        }
      });
    }

    return new ApiError(
      'Validation failed',
      HttpStatusCode.BAD_REQUEST,
      ErrorType.VALIDATION,
      details,
      metadata
    );
  }
}
