import ApiError from '@/lib/errors/ApiError';
import { RequestHandler } from 'express';

export const validateUserEmailAndPassword: RequestHandler = (req, _, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return next(
        ApiError.validation('Email is required', {
          field: 'email',
          code: 'MISSING_FIELD',
        })
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(
        ApiError.validation('Please provide a valid email address', {
          field: 'email',
          value: email,
          code: 'INVALID_FORMAT',
        })
      );
    }

    if (!password) {
      return next(
        ApiError.validation('Password is required', {
          field: 'password',
          code: 'MISSING_FIELD',
        })
      );
    }

    if (password.length < 6) {
      return next(
        ApiError.validation('Password must be at least 6 characters long', {
          field: 'password',
          code: 'MIN_LENGTH',
          minLength: 6,
          actualLength: password.length,
        })
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
