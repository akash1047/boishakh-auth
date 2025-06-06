import mongoose, { Connection } from 'mongoose';
import logger from '../logger';
import { getMongoDBConfig as getConfigFromFile } from './config';

// MongoDB configuration interface
export interface MongoDBConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
  retryAttempts?: number;
  retryDelayMs?: number;
}

// Default connection options
const defaultOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Get MongoDB configuration from environment
export const getMongoDBConfig = (): MongoDBConfig => {
  const configFromFile = getConfigFromFile();

  // Construct full URI
  const baseUri = configFromFile.uri;
  const dbName = configFromFile.database;

  // Construct URI with database name if not already included
  const uri = baseUri.endsWith('/')
    ? `${baseUri}${dbName}`
    : `${baseUri}/${dbName}`;

  const config: MongoDBConfig = {
    uri,
    options: {
      ...defaultOptions,
      dbName,
    },
    retryAttempts: configFromFile.retryAttempts,
    retryDelayMs: configFromFile.retryDelayMs,
  };

  // Add authentication if provided
  if (configFromFile.username && configFromFile.password) {
    config.options = {
      ...config.options,
      auth: {
        username: configFromFile.username,
        password: configFromFile.password,
      },
    };
  }

  return config;
};

// Connection state management
let isConnected = false;
let isConnecting = false;
let connectionPromise: Promise<Connection> | null = null;

// Sleep utility for retry logic
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// Connect to MongoDB with retry logic
export const connectToMongoDB = async (
  config?: MongoDBConfig
): Promise<Connection> => {
  // If already connected, return existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.debug('MongoDB: Using existing connection');
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (isConnecting && connectionPromise) {
    logger.debug('MongoDB: Connection in progress, waiting...');
    return connectionPromise;
  }

  // Start new connection
  isConnecting = true;
  const mongoConfig = config ?? getMongoDBConfig();

  logger.info('MongoDB: Attempting to connect...', {
    metadata: {
      uri: mongoConfig.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
      retryAttempts: mongoConfig.retryAttempts,
    },
  });

  connectionPromise = attemptConnection(mongoConfig);

  try {
    const connection = await connectionPromise;
    isConnected = true;
    isConnecting = false;
    return connection;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    throw error;
  }
};

// Attempt connection with retry logic
const attemptConnection = async (
  config: MongoDBConfig
): Promise<Connection> => {
  const { uri, options, retryAttempts = 3, retryDelayMs = 1000 } = config;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      logger.debug(`MongoDB: Connection attempt ${attempt}/${retryAttempts}`);

      await mongoose.connect(uri, options);

      logger.info('MongoDB: Connected successfully', {
        metadata: {
          attempt,
          database: options?.dbName,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
        },
      });

      return mongoose.connection;
    } catch (error) {
      const isLastAttempt = attempt === retryAttempts;

      logger.error(`MongoDB: Connection attempt ${attempt} failed`, {
        metadata: {
          attempt,
          isLastAttempt,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });

      if (isLastAttempt) {
        throw new Error(
          `MongoDB connection failed after ${retryAttempts} attempts: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      logger.info(`MongoDB: Retrying connection in ${retryDelayMs}ms...`);
      await sleep(retryDelayMs);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('MongoDB connection failed');
};

// Disconnect from MongoDB
export const disconnectFromMongoDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      logger.info('MongoDB: Disconnecting...');
      await mongoose.disconnect();
      isConnected = false;
      connectionPromise = null;
      logger.info('MongoDB: Disconnected successfully');
    } else {
      logger.debug('MongoDB: Already disconnected');
    }
  } catch (error) {
    logger.error('MongoDB: Error during disconnection', {
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    throw error;
  }
};

// Check connection status
export const isMongoDBConnected = (): boolean =>
  isConnected && mongoose.connection.readyState === 1;

// Get connection information
export const getConnectionInfo = () => {
  const { connection } = mongoose;
  return {
    isConnected: isMongoDBConnected(),
    readyState: connection.readyState,
    host: connection.host,
    port: connection.port,
    name: connection.name,
    models: Object.keys(connection.models),
  };
};

// Setup connection event listeners
export const setupConnectionListeners = (): void => {
  // Connection successful
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB: Mongoose connected to database');
    isConnected = true;
  });

  // Connection error
  mongoose.connection.on('error', error => {
    logger.error('MongoDB: Mongoose connection error', {
      metadata: {
        error: error.message,
        stack: error.stack,
      },
    });
    isConnected = false;
  });

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB: Mongoose disconnected from database');
    isConnected = false;
  });

  // Connection reconnected
  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB: Mongoose reconnected to database');
    isConnected = true;
  });

  // Application termination
  process.on('SIGINT', async () => {
    logger.info(
      'MongoDB: Application terminating, closing database connection...'
    );
    try {
      await disconnectFromMongoDB();
      process.exit(0);
    } catch (error) {
      logger.error('MongoDB: Error during graceful shutdown', {
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      process.exit(1);
    }
  });
};

// Health check function
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  details: Record<string, unknown>;
}> => {
  try {
    const isHealthy = isMongoDBConnected();
    const connectionInfo = getConnectionInfo();

    if (isHealthy) {
      // Additional check: try to ping the database
      await mongoose.connection.db?.admin().ping();

      return {
        status: 'healthy',
        details: {
          connection: connectionInfo,
          ping: 'successful',
        },
      };
    } else {
      return {
        status: 'unhealthy',
        details: {
          connection: connectionInfo,
          reason: 'Not connected to database',
        },
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        connection: getConnectionInfo(),
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
};

// Initialize MongoDB connection with listeners
export const initializeMongoDB = async (
  config?: MongoDBConfig
): Promise<Connection> => {
  setupConnectionListeners();
  return connectToMongoDB(config);
};

// Export the mongoose instance for direct access if needed
export { mongoose };

// Default export for convenience
export default {
  connect: connectToMongoDB,
  disconnect: disconnectFromMongoDB,
  isConnected: isMongoDBConnected,
  getConnectionInfo,
  healthCheck,
  initialize: initializeMongoDB,
  mongoose,
};
