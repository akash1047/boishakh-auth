import { ApiError } from './errors';
import logger from './logger';

// Type for log metadata
type LogMetadata = Record<string, unknown>;

// Helper functions for structured logging
export const logError = (
  message: string,
  error?: Error | ApiError,
  metadata?: LogMetadata
) => {
  const logData: LogMetadata = {
    ...metadata,
  };

  if (error) {
    if (error instanceof ApiError) {
      // Use ApiError's built-in logging object
      logData.error = error.toLogObject();
    } else {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
  }

  logger.error(message, { metadata: logData });
};

export const logInfo = (message: string, metadata?: LogMetadata) => {
  logger.info(message, metadata ? { metadata } : undefined);
};

export const logWarn = (message: string, metadata?: LogMetadata) => {
  logger.warn(message, metadata ? { metadata } : undefined);
};

export const logDebug = (message: string, metadata?: LogMetadata) => {
  logger.debug(message, metadata ? { metadata } : undefined);
};

export const logHttp = (message: string, metadata?: LogMetadata) => {
  logger.http(message, metadata ? { metadata } : undefined);
};

// Performance logging helper
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: LogMetadata
) => {
  const logData: LogMetadata = {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  };

  if (duration > 1000) {
    logger.warn(`Slow operation detected: ${operation}`, { metadata: logData });
  } else {
    logger.debug(`Operation completed: ${operation}`, { metadata: logData });
  }
};

// User action logging
export const logUserAction = (
  action: string,
  userId?: string,
  metadata?: LogMetadata
) => {
  const logData: LogMetadata = {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  logger.info(`User action: ${action}`, { metadata: logData });
};
