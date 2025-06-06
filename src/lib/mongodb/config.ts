// Environment configuration for logging
export interface LoggingConfig {
  level: string;
  enableFileLogging: boolean;
  enableGcpLogging: boolean;
  gcpProjectId?: string;
  gcpCredentials?: string;
  serviceName: string;
  serviceVersion: string;
}

export const getLoggingConfig = (): LoggingConfig => {
  const environment = process.env.NODE_ENV ?? 'development';

  const baseConfig: LoggingConfig = {
    serviceName: 'boishakh-auth',
    serviceVersion: '1.0.0',
    level: 'debug',
    enableFileLogging: false,
    enableGcpLogging: false,
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        level: 'info',
        enableGcpLogging: true,
        gcpProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        gcpCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      };

    case 'testing':
      return {
        ...baseConfig,
        level: process.env.LOG_LEVEL === 'silent' ? 'error' : 'debug',
        enableFileLogging: false,
        enableGcpLogging: false,
      };

    case 'development':
    default:
      return {
        ...baseConfig,
        level: 'debug',
        enableFileLogging: true,
        enableGcpLogging: false,
      };
  }
};

// MongoDB configuration interface
export interface MongoDBConfig {
  uri: string;
  database: string;
  username?: string;
  password?: string;
  retryAttempts: number;
  retryDelayMs: number;
}

export const getMongoDBConfig = (): MongoDBConfig => {
  const environment = process.env.NODE_ENV ?? 'development';

  const baseConfig: MongoDBConfig = {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE ?? 'boishakh_auth',
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    retryAttempts: 3,
    retryDelayMs: 1000,
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        retryAttempts: 5,
        retryDelayMs: 2000,
      };

    case 'testing':
      return {
        ...baseConfig,
        database:
          process.env.MONGODB_TEST_DATABASE ??
          process.env.MONGODB_DATABASE ??
          `${baseConfig.database}_test`,
        retryAttempts: 1,
        retryDelayMs: 500,
      };

    case 'development':
    default:
      return baseConfig;
  }
};
