# ApiError Usage Guide

This guide demonstrates how to use the comprehensive `ApiError` class in your Express.js application with Winston logging support.

## Overview

The `ApiError` class extends the native JavaScript `Error` class and provides:

- **HTTP Status Code Integration**: Automatic mapping to HTTP response codes
- **Error Type Categorization**: Structured error types for better organization
- **Winston Logging Optimization**: Built-in logging objects for Winston
- **Express Middleware Support**: Seamless integration with Express error handling
- **Development vs Production**: Different error exposure levels based on environment
- **Request Context**: Automatic capture of request metadata

## Basic Usage

### Import the ApiError Class

```typescript
import { ApiError, HttpStatusCode, ErrorType } from '@/lib/errors';
```

### Throwing Errors in Route Handlers

```typescript
app.get(
  '/users/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.validation('Invalid user ID format', {
          field: 'id',
          value: id,
        });
      }

      const user = await User.findById(id);

      if (!user) {
        throw ApiError.notFound('User');
      }

      res.json({ user });
    } catch (error) {
      next(error); // Pass to error handling middleware
    }
  }
);
```

### Using Static Factory Methods

The `ApiError` class provides convenient static methods for common error types:

```typescript
// Validation errors (400)
throw ApiError.validation('Email is required', {
  field: 'email',
  constraint: 'required',
});

// Authentication errors (401)
throw ApiError.authentication('Invalid credentials');

// Authorization errors (403)
throw ApiError.authorization('Access denied to this resource');

// Not found errors (404)
throw ApiError.notFound('User');

// Conflict errors (409)
throw ApiError.conflict('Email already exists', {
  field: 'email',
  value: 'user@example.com',
});

// Rate limiting errors (429)
throw ApiError.rateLimitExceeded('Too many requests from this IP');

// Internal server errors (500)
throw ApiError.internal('Database connection failed');

// Database errors (500)
throw ApiError.database('Query execution failed', {
  query: 'SELECT * FROM users',
  table: 'users',
});

// External service errors (502)
throw ApiError.externalService(
  'payment-gateway',
  'Payment service unavailable'
);
```

### Custom Error Creation

```typescript
const customError = new ApiError(
  'Custom error message',
  HttpStatusCode.UNPROCESSABLE_ENTITY,
  ErrorType.VALIDATION,
  {
    field: 'password',
    constraint: 'minLength',
    minLength: 8,
  },
  {
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  }
);
```

## Error Response Format

### Development Environment Response

```json
{
  "error": {
    "message": "Invalid email format",
    "type": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2025-06-06T10:30:00.000Z",
    "errorId": "1a2b3c4d-5e6f",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "format"
    },
    "stack": "ApiError: Invalid email format\n    at..."
  }
}
```

### Production Environment Response

```json
{
  "error": {
    "message": "Invalid email format",
    "type": "VALIDATION_ERROR",
    "statusCode": 400,
    "timestamp": "2025-06-06T10:30:00.000Z",
    "errorId": "1a2b3c4d-5e6f"
  }
}
```

## Middleware Integration

The error handling middleware automatically:

1. **Converts** generic errors to `ApiError` instances
2. **Logs** errors with appropriate Winston log levels
3. **Handles** Mongoose validation errors
4. **Captures** request context automatically
5. **Sanitizes** error responses for production

### Automatic Error Type Detection

```typescript
// MongoDB duplicate key error (11000) → Conflict (409)
// Mongoose validation error → Validation (400)
// JWT errors → Authentication (401)
// Generic errors → Internal Server Error (500)
```

## Logging Integration

### Automatic Logging

Every error is automatically logged with structured metadata:

```typescript
// Error logs include:
{
  message: "User validation failed",
  errorId: "1a2b3c4d-5e6f",
  statusCode: 400,
  type: "VALIDATION_ERROR",
  stack: "...",
  metadata: {
    url: "/api/users",
    method: "POST",
    userAgent: "Mozilla/5.0...",
    ip: "192.168.1.1",
    userId: "user123",
    timestamp: "2025-06-06T10:30:00.000Z"
  }
}
```

### Manual Logging with ApiError

```typescript
import { logError } from '@/lib/log-helpers';

try {
  // Some operation
} catch (error) {
  const apiError = ApiError.fromError(error);
  logError('Operation failed', apiError, {
    operation: 'user-creation',
    duration: '250ms',
  });
  throw apiError;
}
```

## Error Types and Status Codes

| Error Type         | Status Code | Use Case                   |
| ------------------ | ----------- | -------------------------- |
| `VALIDATION`       | 400         | Invalid input data         |
| `AUTHENTICATION`   | 401         | Login required             |
| `AUTHORIZATION`    | 403         | Insufficient permissions   |
| `NOT_FOUND`        | 404         | Resource doesn't exist     |
| `CONFLICT`         | 409         | Resource already exists    |
| `RATE_LIMIT`       | 429         | Too many requests          |
| `INTERNAL`         | 500         | Server errors              |
| `DATABASE`         | 500         | Database errors            |
| `EXTERNAL_SERVICE` | 502         | Third-party service errors |
| `NETWORK`          | 500         | Network-related errors     |

## Best Practices

### 1. Use Appropriate Error Types

```typescript
// ✅ Good - Use specific error types
throw ApiError.validation('Email format invalid');
throw ApiError.notFound('User');

// ❌ Avoid - Generic errors
throw new Error('Something went wrong');
```

### 2. Include Relevant Details

```typescript
// ✅ Good - Provide helpful details
throw ApiError.validation('Password too weak', {
  field: 'password',
  minLength: 8,
  requirements: ['uppercase', 'lowercase', 'numbers'],
});

// ❌ Avoid - Vague error messages
throw ApiError.validation('Invalid input');
```

### 3. Add Request Context

```typescript
// ✅ Good - Include user context
throw ApiError.authorization('Insufficient permissions', {
  userId: req.user.id,
  requiredRole: 'admin',
  userRole: req.user.role,
});
```

### 4. Handle Async Operations

```typescript
app.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({ user });
  } catch (error) {
    // Let middleware handle the error
    next(error);
  }
});
```

### 5. Use Error Boundaries in Services

```typescript
class UserService {
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Validate input
      if (!userData.email) {
        throw ApiError.validation('Email is required', {
          field: 'email',
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw ApiError.conflict('User with this email already exists', {
          field: 'email',
          value: userData.email,
        });
      }

      // Create user
      return await User.create(userData);
    } catch (error) {
      // Convert mongoose errors
      if (error.name === 'ValidationError') {
        throw ApiError.fromMongooseValidation(error);
      }

      // Re-throw ApiErrors
      if (error instanceof ApiError) {
        throw error;
      }

      // Convert unknown errors
      throw ApiError.internal('Failed to create user', {
        operation: 'user-creation',
      });
    }
  }
}
```

## Testing Error Scenarios

Use the demo endpoint to test different error types:

```bash
# Test validation error
curl "http://localhost:3000/error/demo?type=validation&email=invalid"

# Test authentication error
curl "http://localhost:3000/error/demo?type=auth"

# Test not found error
curl "http://localhost:3000/error/demo?type=notfound"

# Test internal error
curl "http://localhost:3000/error/demo?type=internal"
```

## Error Monitoring

### Error ID Tracking

Each error gets a unique ID for tracking:

```typescript
const error = ApiError.validation('Invalid data');
console.log(error.errorId); // "1733472600123-abc123"
```

### Log Correlation

Use error IDs to correlate logs across services:

```typescript
logger.error(`Payment failed for user ${userId}`, {
  metadata: {
    errorId: error.errorId,
    userId,
    paymentId,
  },
});
```

## Security Considerations

1. **Sensitive Data**: Never include passwords, tokens, or PII in error details
2. **Production Sanitization**: Internal errors are automatically sanitized in production
3. **Error IDs**: Use error IDs for support without exposing sensitive information
4. **Stack Traces**: Only included in development environment

## Integration with Other Tools

### Sentry Integration

```typescript
import * as Sentry from '@sentry/node';

// In error middleware
if (apiError.statusCode >= 500) {
  Sentry.captureException(apiError, {
    tags: {
      errorType: apiError.type,
      errorId: apiError.errorId,
    },
    extra: apiError.toLogObject(),
  });
}
```

### Metrics Collection

```typescript
// Track error metrics
metrics.increment('api.errors.total', {
  type: apiError.type,
  statusCode: apiError.statusCode.toString(),
});
```

This comprehensive error handling system provides robust error management for your Express application with excellent logging support and developer experience.
