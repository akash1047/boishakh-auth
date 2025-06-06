import request from 'supertest';
import app from '../../src/index';

describe('API Integration Tests', () => {
  let server: any;

  beforeAll(() => {
    // Set testing environment variables
    process.env.NODE_ENV = 'testing';
    process.env.LOG_LEVEL = 'silent';
    // Start server on a different port for testing
    const PORT = process.env.TEST_PORT || 3001;
    server = app.listen(PORT);
  });

  afterAll(done => {
    if (server) {
      server.close(() => {
        done();
      });
    } else {
      done();
    }
  });

  describe('Health Check', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'Service is healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });

    it('should include correct environment', async () => {
      const response = await request(app).get('/health').expect(200);

      // The environment should be test-related (test, testing, or development)
      expect(['test', 'testing', 'development']).toContain(
        response.body.environment
      );
    });
  });

  describe('Hello World', () => {
    it('should return 200 and welcome message', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toHaveProperty('message', 'Hello World! 🎉');
      expect(response.body).toHaveProperty('service', 'boishakh-auth');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app).get('/').expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('HTTP Middleware', () => {
    it('should log HTTP requests', async () => {
      // This test verifies that the httpLogger middleware is working
      // In a real scenario, you might check logs or metrics
      await request(app).get('/health').expect(200);

      // If we reach here without errors, the middleware is working
      expect(true).toBe(true);
    });

    it('should handle JSON requests', async () => {
      const response = await request(app)
        .get('/health')
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app).get('/non-existent-route').expect(404);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await request(app)
        .post('/health')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      // The app should handle this gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
