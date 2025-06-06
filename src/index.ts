import express, { Request, Response } from 'express';
import logger from './lib/logger';
import { httpLogger } from './lib/middleware';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(express.json());
app.use(httpLogger);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  logger.debug('Health check endpoint accessed');
  res.status(200).json({
    status: 'OK',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// Hello world route
app.get('/', (req: Request, res: Response) => {
  logger.debug('Hello world endpoint accessed');
  res.status(200).json({
    message: 'Hello World! 🎉',
    service: 'boishakh-auth',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📍 Health check available at: /health`);
  logger.info(`🌍 Hello world available at: /`);
});

export default app;
