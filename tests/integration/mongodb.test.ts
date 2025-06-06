import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import {
  disconnectFromMongoDB,
  getConnectionInfo,
  healthCheck,
  initializeMongoDB,
  isMongoDBConnected,
} from '../../src/lib/mongodb';

describe('MongoDB Integration Tests', () => {
  // Skip these tests unless MongoDB is explicitly available
  const mongoAvailable = process.env.TEST_MONGODB === 'true';

  (mongoAvailable ? describe : describe.skip)(
    'with real MongoDB instance',
    () => {
      beforeAll(async () => {
        // Ensure clean state
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
        }
      });

      afterAll(async () => {
        // Clean up after tests
        if (mongoose.connection.readyState !== 0) {
          await disconnectFromMongoDB();
        }
      });

      it('should initialize MongoDB connection successfully', async () => {
        const connection = await initializeMongoDB();

        expect(connection).toBeDefined();
        expect(connection.readyState).toBe(1); // Connected state
        expect(isMongoDBConnected()).toBe(true);
      });

      it('should return healthy status when connected', async () => {
        if (!isMongoDBConnected()) {
          await initializeMongoDB();
        }

        const health = await healthCheck();

        expect(health.status).toBe('healthy');
        expect(health.details).toHaveProperty('connection');
        expect(health.details).toHaveProperty('ping');
        expect(health.details.ping).toBe('successful');
      });

      it('should provide accurate connection information', async () => {
        if (!isMongoDBConnected()) {
          await initializeMongoDB();
        }

        const info = getConnectionInfo();

        expect(info.isConnected).toBe(true);
        expect(info.readyState).toBe(1);
        expect(info.host).toBeDefined();
        expect(info.port).toBeDefined();
        expect(info.name).toBeDefined();
        expect(Array.isArray(info.models)).toBe(true);
      });

      it('should handle basic database operations', async () => {
        if (!isMongoDBConnected()) {
          await initializeMongoDB();
        }

        // Test basic database operation
        const db = mongoose.connection.db;
        expect(db).toBeDefined();

        // List collections (should not throw)
        const collections = await db?.listCollections().toArray();
        expect(Array.isArray(collections)).toBe(true);

        // Create a test collection and document
        const testCollection = db?.collection('integration_test');
        const insertResult = await testCollection?.insertOne({
          test: true,
          timestamp: new Date(),
          message: 'Integration test document',
        });

        expect(insertResult?.acknowledged).toBe(true);
        expect(insertResult?.insertedId).toBeDefined();

        // Read the document back
        const document = await testCollection?.findOne({ test: true });
        expect(document).toBeDefined();
        expect(document?.test).toBe(true);
        expect(document?.message).toBe('Integration test document');

        // Clean up test document
        await testCollection?.deleteOne({ _id: insertResult?.insertedId });
      });

      it('should handle multiple connection attempts gracefully', async () => {
        if (!isMongoDBConnected()) {
          await initializeMongoDB();
        }

        const connection1 = await initializeMongoDB();
        const connection2 = await initializeMongoDB();

        // Should return the same connection instance
        expect(connection1).toBe(connection2);
        expect(isMongoDBConnected()).toBe(true);
      });

      it('should disconnect gracefully', async () => {
        if (!isMongoDBConnected()) {
          await initializeMongoDB();
        }

        expect(isMongoDBConnected()).toBe(true);

        await disconnectFromMongoDB();

        expect(isMongoDBConnected()).toBe(false);
        expect(mongoose.connection.readyState).toBe(0); // Disconnected state
      });

      it('should handle reconnection after disconnect', async () => {
        // Ensure disconnected state
        if (isMongoDBConnected()) {
          await disconnectFromMongoDB();
        }

        expect(isMongoDBConnected()).toBe(false);

        // Reconnect
        const connection = await initializeMongoDB();

        expect(connection).toBeDefined();
        expect(isMongoDBConnected()).toBe(true);
      });
    }
  );

  describe('without MongoDB instance', () => {
    it('should show tests are skipped when MongoDB is not available', () => {
      if (!mongoAvailable) {
        expect(true).toBe(true); // Placeholder test to show skip reason
        console.log(
          'MongoDB integration tests skipped. Set TEST_MONGODB=true to run with real MongoDB.'
        );
      }
    });
  });
});
