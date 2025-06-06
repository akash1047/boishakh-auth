import { LoggingWinston } from '@google-cloud/logging-winston';
import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Get environment
const environment = process.env.NODE_ENV ?? 'development';

// Define which level to log based on environment
const getLogLevel = (): string => {
  switch (environment) {
    case 'production':
      return 'info';
    case 'testing':
      return 'debug';
    case 'development':
    default:
      return 'debug';
  }
};

// Common format for development and testing
const localFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Production format for GCP Cloud Logging
const gcpFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(info => {
    const logEntry: Record<string, unknown> = {
      timestamp: info.timestamp,
      severity: info.level.toUpperCase(),
      message: info.message,
      service: 'boishakh-auth',
      version: '1.0.0',
      environment,
    };

    if (info.stack) {
      logEntry.stack = info.stack;
    }

    if (info.metadata) {
      logEntry.metadata = info.metadata;
    }

    return JSON.stringify(logEntry);
  })
);

// Create transports based on environment
const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  switch (environment) {
    case 'production':
      // GCP Cloud Logging transport
      transports.push(
        new LoggingWinston({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          logName: 'boishakh-auth',
          resource: {
            type: 'global',
          },
          serviceContext: {
            service: 'boishakh-auth',
            version: '1.0.0',
          },
        })
      );

      // Also log to console in production for local debugging if needed
      transports.push(
        new winston.transports.Console({
          format: gcpFormat,
        })
      );
      break;

    case 'testing':
      // Testing environment - minimal logging, no file outputs
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(
              info => `[TEST] ${info.timestamp} ${info.level}: ${info.message}`
            )
          ),
          silent: process.env.LOG_LEVEL === 'silent', // Allow silencing in tests
        })
      );
      break;

    case 'development':
    default:
      // Development environment - rich console logging + file logging
      transports.push(
        new winston.transports.Console({
          format: localFormat,
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
      break;
  }

  return transports;
};

// Create the logger configuration
const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  transports: createTransports(),
  // Handle uncaught exceptions and rejections in production
  exceptionHandlers:
    environment === 'production'
      ? [
          new LoggingWinston({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            logName: 'boishakh-auth-exceptions',
          }),
        ]
      : undefined,
  rejectionHandlers:
    environment === 'production'
      ? [
          new LoggingWinston({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            logName: 'boishakh-auth-rejections',
          }),
        ]
      : undefined,
});

// Log environment-specific startup message
logger.info(`Logger initialized for environment: ${environment}`);

export default logger;
