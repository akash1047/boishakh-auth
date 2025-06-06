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
