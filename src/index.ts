import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(express.json());

// Health check route
app.get('/health', (req: Request, res: Response) => {
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
  res.status(200).json({
    message: 'Hello World! 🎉',
    service: 'boishakh-auth',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌍 Hello world available at: http://localhost:${PORT}/`);
});

export default app;
