import { NextFunction, Request, Response } from 'express';
import logger from './logger';

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip ?? req.connection.remoteAddress,
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message, { metadata: logData });
    } else if (res.statusCode >= 400) {
      logger.warn(message, { metadata: logData });
    } else {
      logger.http(message, { metadata: logData });
    }
  });

  next();
};
