import UsersModule from '@/app/users';
import { ApiError } from '@/lib/errors';
import logger from '@/lib/logger';
import { errorHandler, httpLogger, notFoundHandler } from '@/lib/middleware';
import express, {
  Application as ExpressApplication,
  Request,
  Response,
} from 'express';

export interface Config {
  port: number;
}

export default class Application {
  constructor(public app: ExpressApplication = express()) {}

  run(config: Config) {
    // Middleware
    this.app.use(express.json());
    this.app.use(httpLogger);

    const usersModule = new UsersModule();

    // Health check route
    this.app.get('/health', (req: Request, res: Response) => {
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
    this.app.get('/', (req: Request, res: Response) => {
      logger.debug('Hello world endpoint accessed');
      res.status(200).json({
        message: 'Hello World! 🎉',
        service: 'boishakh-auth',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    this.app.use('/users', usersModule.getRouter());

    // Example error route to demonstrate ApiError usage
    this.app.get('/error/demo', (req: Request, res: Response, next) => {
      const errorType = req.query.type as string;

      try {
        switch (errorType) {
          case 'validation':
            throw ApiError.validation('Invalid email format', {
              field: 'email',
              value: req.query.email,
            });
          case 'auth':
            throw ApiError.authentication();
          case 'forbidden':
            throw ApiError.authorization();
          case 'notfound':
            throw ApiError.notFound('User');
          case 'conflict':
            throw ApiError.conflict('Email already exists');
          case 'internal':
            throw ApiError.internal('Database connection failed');
          default:
            throw new Error('Unexpected error occurred');
        }
      } catch (error) {
        next(error);
      }
    });

    // 404 handler (must be after all routes)
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);

    const { port } = config;
    this.app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  }
}
