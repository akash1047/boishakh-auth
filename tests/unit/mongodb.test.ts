import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import mongoose from 'mongoose';
import {
  connectToMongoDB,
  disconnectFromMongoDB,
  getConnectionInfo,
  getMongoDBConfig,
  healthCheck,
  initializeMongoDB,
  isMongoDBConnected,
  type MongoDBConfig,
} from '../../src/lib/mongodb';

// Mock logger to avoid logging during tests
jest.mock('../../src/lib/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('MongoDB Utility Functions', () => {
  const testConfig: MongoDBConfig = {
    uri: 'mongodb://localhost:27017/test_db',
    options: {
      dbName: 'test_db',
    },
    retryAttempts: 1,
    retryDelayMs: 100,
  };

  afterAll(async () => {
    // Ensure all connections are closed after tests
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('getMongoDBConfig', () => {
    beforeAll(() => {
      // Set test environment variables
      process.env.NODE_ENV = 'testing';
      process.env.MONGODB_URI = 'mongodb://localhost:27017';
      process.env.MONGODB_DATABASE = 'test_database';
    });

    it('should return correct configuration for testing environment', () => {
      const config = getMongoDBConfig();

      expect(config.uri).toBe('mongodb://localhost:27017/test_database');
      expect(config.retryAttempts).toBe(1);
      expect(config.retryDelayMs).toBe(500);
      expect(config.options?.dbName).toBe('test_database');
    });

    it('should handle authentication when provided', () => {
      process.env.MONGODB_USERNAME = 'testuser';
      process.env.MONGODB_PASSWORD = 'testpass';

      const config = getMongoDBConfig();

      expect(config.options?.auth).toEqual({
        username: 'testuser',
        password: 'testpass',
      });

      // Clean up
      delete process.env.MONGODB_USERNAME;
      delete process.env.MONGODB_PASSWORD;
    });
  });

  describe('Connection Status Functions', () => {
    it('should return false when not connected', () => {
      expect(isMongoDBConnected()).toBe(false);
    });

    it('should return connection info', () => {
      const info = getConnectionInfo();

      expect(info).toHaveProperty('isConnected');
      expect(info).toHaveProperty('readyState');
      expect(info).toHaveProperty('host');
      expect(info).toHaveProperty('port');
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('models');
      expect(Array.isArray(info.models)).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should return unhealthy status when not connected', async () => {
      const health = await healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details).toHaveProperty('connection');
      expect(health.details).toHaveProperty('reason');
    });
  });

  describe('Connection Management', () => {
    // Skip actual connection tests if MongoDB is not available
    const mongoAvailable = process.env.TEST_MONGODB === 'true';

    (mongoAvailable ? describe : describe.skip)(
      'with MongoDB available',
      () => {
        afterAll(async () => {
          // Ensure cleanup after tests
          if (mongoose.connection.readyState !== 0) {
            await disconnectFromMongoDB();
          }
        });

        it('should connect to MongoDB', async () => {
          const connection = await connectToMongoDB(testConfig);

          expect(connection).toBeDefined();
          expect(isMongoDBConnected()).toBe(true);
        });

        it('should return existing connection on subsequent calls', async () => {
          const connection1 = await connectToMongoDB(testConfig);
          const connection2 = await connectToMongoDB(testConfig);

          expect(connection1).toBe(connection2);
        });

        it('should return healthy status when connected', async () => {
          await connectToMongoDB(testConfig);
          const health = await healthCheck();

          expect(health.status).toBe('healthy');
          expect(health.details).toHaveProperty('connection');
          expect(health.details).toHaveProperty('ping');
        });

        it('should disconnect from MongoDB', async () => {
          await connectToMongoDB(testConfig);
          await disconnectFromMongoDB();

          expect(isMongoDBConnected()).toBe(false);
        });

        it('should initialize MongoDB with listeners', async () => {
          const connection = await initializeMongoDB(testConfig);

          expect(connection).toBeDefined();
          expect(isMongoDBConnected()).toBe(true);

          await disconnectFromMongoDB();
        });
      }
    );

    describe('without MongoDB available', () => {
      it('should handle connection failures gracefully', async () => {
        const invalidConfig: MongoDBConfig = {
          uri: 'mongodb://invalid-host:27017/test',
          options: {
            serverSelectionTimeoutMS: 1000, // 1 second timeout
            socketTimeoutMS: 1000,
          },
          retryAttempts: 1,
          retryDelayMs: 100,
        };

        await expect(connectToMongoDB(invalidConfig)).rejects.toThrow();
      }, 15000); // Increase timeout to 15 seconds
    });
  });
});
