import { NextFunction, Request, Response } from 'express';
import { ApiError, HttpStatusCode } from './errors';
import logger from './logger';

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip ?? req.connection.remoteAddress,
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message, { metadata: logData });
    } else if (res.statusCode >= 400) {
      logger.warn(message, { metadata: logData });
    } else {
      logger.http(message, { metadata: logData });
    }
  });

  next();
};

// Define interfaces for better type safety
interface MongoServerError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

interface CastError extends Error {
  value: unknown;
  path: string;
}

/**
 * Global error handling middleware for Express
 * Handles ApiError instances and converts other errors to ApiError
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let apiError: ApiError;

  // Convert error to ApiError if it's not already one
  if (error instanceof ApiError) {
    apiError = error;
  } else {
    // Handle common error types
    if (error.name === 'ValidationError') {
      apiError = ApiError.fromMongooseValidation(error, {
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    } else if (error.name === 'CastError') {
      const castError = error as CastError;
      apiError = ApiError.validation('Invalid ID format', {
        field: 'id',
        value: castError.value,
      });
    } else if (error.name === 'MongoServerError') {
      const mongoError = error as MongoServerError;
      if (mongoError.code === 11000) {
        const keyValue = mongoError.keyValue ?? {};
        apiError = ApiError.conflict('Resource already exists', {
          field: Object.keys(keyValue)[0],
          value: Object.values(keyValue)[0],
        });
      } else {
        apiError = ApiError.database(mongoError.message);
      }
    } else if (error.name === 'JsonWebTokenError') {
      apiError = ApiError.authentication('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      apiError = ApiError.authentication('Token expired');
    } else if (error.name === 'SyntaxError' && 'body' in error) {
      apiError = ApiError.validation('Invalid JSON in request body');
    } else {
      // Convert unknown errors to internal server error
      apiError = ApiError.fromError(
        error,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        undefined,
        {
          url: req.originalUrl,
          method: req.method,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        }
      );
    }
  }

  // Add request context to metadata if not already present
  if (!apiError.metadata?.url) {
    // Create new ApiError with updated metadata instead of modifying readonly property
    const updatedMetadata = {
      ...apiError.metadata,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };

    apiError = new ApiError(
      apiError.message,
      apiError.statusCode,
      apiError.type,
      apiError.details,
      updatedMetadata,
      apiError.isOperational
    );
  }

  // Log the error with appropriate level
  const logObject = apiError.toLogObject();
  const logLevel = apiError.getLogLevel();

  if (logLevel === 'error') {
    logger.error(`API Error: ${apiError.message}`, { metadata: logObject });
  } else if (logLevel === 'warn') {
    logger.warn(`API Warning: ${apiError.message}`, { metadata: logObject });
  } else {
    logger.info(`API Info: ${apiError.message}`, { metadata: logObject });
  }

  // Send error response
  const errorResponse = apiError.toJSON();

  // Don't expose internal error details in production
  if (
    process.env.NODE_ENV === 'production' &&
    !apiError.shouldExposeToClient()
  ) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'An internal error occurred',
        type: 'INTERNAL_ERROR',
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
        errorId: apiError.errorId,
      },
    });
  } else {
    res.status(apiError.statusCode).json(errorResponse);
  }
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = ApiError.notFound(`Route ${req.originalUrl}`, {
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  next(error);
};
