import logger from '@/lib/logger';
import mongoose from 'mongoose';

export default async function mongoConnect(uri?: string) {
  try {
    const mongoUri = uri ?? process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'MongoDB URI is required. Provide URI parameter or set MONGODB_URI environment variable.'
      );
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
}
