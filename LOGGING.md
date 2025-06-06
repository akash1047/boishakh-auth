# Logging Configuration

This project uses Winston for logging with environment-specific configurations optimized for different deployment scenarios.

## Environment-Specific Configurations

### Development Environment

- **Log Level**: `debug` (all logs)
- **Output**: Colorized console + local files
- **Files**:
  - `logs/combined.log` - All logs in JSON format
  - `logs/error.log` - Error logs only
- **Features**:
  - Rich console formatting with colors
  - Detailed timestamps
  - Stack traces for errors

### Testing Environment

- **Log Level**: `debug` (configurable)
- **Output**: Minimal console output
- **Features**:
  - Compact format suitable for test runners
  - Can be silenced with `LOG_LEVEL=silent`
  - No file outputs to avoid test pollution
  - Prefixed with `[TEST]` for clarity

### Production Environment

- **Log Level**: `info` (warnings and above)
- **Output**: Google Cloud Logging + console
- **Features**:
  - Structured JSON logging for GCP Log Explorer
  - Automatic error/exception handling
  - Service context metadata
  - Performance optimized

## Google Cloud Logging Setup

For production environments, logs are sent to Google Cloud Logging with the following structure:

```json
{
  "timestamp": "2025-06-06T07:30:00.000Z",
  "severity": "INFO",
  "message": "Server started successfully",
  "service": "boishakh-auth",
  "version": "1.0.0",
  "environment": "production",
  "metadata": {
    "port": 3000,
    "nodeVersion": "18.0.0"
  }
}
```

### Required Environment Variables for Production:

```bash
# GCP Project Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Or when running on GCP (uses metadata service)
# GOOGLE_APPLICATION_CREDENTIALS is not needed
```

## Log Levels

1. **error** (0) - Application errors, exceptions
2. **warn** (1) - Warning conditions
3. **info** (2) - General information
4. **http** (3) - HTTP request/response logs
5. **debug** (4) - Detailed debug information

## Usage Examples

### Basic Logging

```typescript
import logger from './lib/logger';

logger.info('User logged in successfully');
logger.error('Database connection failed');
logger.debug('Processing user data', { userId: 123 });
```

### Structured Logging with Helpers

```typescript
import { logError, logInfo, logUserAction } from './lib/log-helpers';

// Error logging with context
logError('Database query failed', error, { query: 'SELECT * FROM users' });

// User action tracking
logUserAction('login', userId, {
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});

// Performance monitoring
logPerformance('database-query', 250, { table: 'users', rowCount: 100 });
```

### HTTP Request Logging

The `httpLogger` middleware automatically logs all HTTP requests with:

- Request method and URL
- Response status code
- Response time
- User agent and IP address
- Automatic log level based on status code

## GCP Log Explorer Queries

When using Google Cloud Logging, you can query logs using:

```
# Filter by service
resource.type="global" AND jsonPayload.service="boishakh-auth"

# Filter by severity
severity>=ERROR

# Filter by specific operations
jsonPayload.metadata.operation="database-query"

# Filter by user actions
jsonPayload.metadata.action="login"
```

## File Structure

```
src/lib/
├── logger.ts          # Main logger configuration
├── config.ts          # Environment-specific settings
├── middleware.ts      # HTTP logging middleware
└── log-helpers.ts     # Structured logging helpers
```

## Best Practices

1. **Use appropriate log levels** - Don't log debug information in production
2. **Include context** - Add relevant metadata to logs
3. **Avoid logging sensitive data** - Never log passwords, tokens, or PII
4. **Use structured logging** - Include metadata for better searchability
5. **Monitor performance** - Log slow operations and errors
6. **Centralize error handling** - Use consistent error logging patterns
