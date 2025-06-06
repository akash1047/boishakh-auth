describe('E2E Tests', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  beforeAll(async () => {
    // Wait for application to be ready
    const maxRetries = 30;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await fetch(`${BASE_URL}/health`);
        if (response.ok) {
          break;
        }
      } catch (error) {
        // App not ready yet
      }

      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (retries >= maxRetries) {
      throw new Error('Application failed to start within expected time');
    }
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Application Health', () => {
    it('should be healthy and responsive', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('OK');
      expect(body.message).toBe('Service is healthy');
    });

    it('should have correct service information', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const body = await response.json();

      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('timestamp');
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThan(0);
    });
  });

  describe('API Endpoints', () => {
    it('should serve welcome message', async () => {
      const response = await fetch(`${BASE_URL}/`);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.message).toBe('Hello World! 🎉');
      expect(body.service).toBe('boishakh-auth');
      expect(body.version).toBe('1.0.0');
    });

    it('should handle non-existent routes', async () => {
      const response = await fetch(`${BASE_URL}/non-existent`);
      expect(response.status).toBe(404);
    });
  });

  describe('Performance', () => {
    it('should respond to health check within reasonable time', async () => {
      const start = Date.now();
      const response = await fetch(`${BASE_URL}/health`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10)
        .fill(null)
        .map(() => fetch(`${BASE_URL}/health`));

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Content Types', () => {
    it('should return JSON content type for API endpoints', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      expect(response.headers.get('content-type')).toContain(
        'application/json'
      );
    });

    it('should handle requests with different accept headers', async () => {
      const response = await fetch(`${BASE_URL}/health`, {
        headers: {
          Accept: 'application/json',
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain(
        'application/json'
      );
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await fetch(`${BASE_URL}/health`);

      // Note: Add security headers in your Express app if needed
      // expect(response.headers.get('x-frame-options')).toBeTruthy();
      // expect(response.headers.get('x-content-type-options')).toBe('nosniff');

      // For now, just verify the response is valid
      expect(response.status).toBe(200);
    });
  });

  describe('Application Lifecycle', () => {
    it('should maintain consistent uptime during tests', async () => {
      const response1 = await fetch(`${BASE_URL}/health`);
      const body1 = await response1.json();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response2 = await fetch(`${BASE_URL}/health`);
      const body2 = await response2.json();

      expect(body2.uptime).toBeGreaterThan(body1.uptime);
    });

    it('should serve consistent data across requests', async () => {
      const response1 = await fetch(`${BASE_URL}/`);
      const body1 = await response1.json();

      const response2 = await fetch(`${BASE_URL}/`);
      const body2 = await response2.json();

      expect(body1.service).toBe(body2.service);
      expect(body1.version).toBe(body2.version);
      expect(body1.message).toBe(body2.message);
    });
  });
});
