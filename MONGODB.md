# MongoDB Utility

This module provides a comprehensive MongoDB connection utility for the Boishakh Auth service using Mongoose.

## Features

- **Automatic Connection Management**: Handles connection state and prevents duplicate connections
- **Retry Logic**: Configurable retry attempts with exponential backoff
- **Environment-Specific Configuration**: Different settings for development, testing, and production
- **Event Listeners**: Comprehensive logging of connection events
- **Health Checks**: Built-in health check functionality
- **Graceful Shutdown**: Proper cleanup on application termination
- **Authentication Support**: Configurable MongoDB authentication

## Environment Variables

Set the following environment variables to configure MongoDB connection:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=boishakh_auth

# Optional - Authentication
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password

# Optional - Testing
MONGODB_TEST_DATABASE=boishakh_auth_test

# Optional - For testing with real MongoDB
TEST_MONGODB=true
```

## Usage

### Basic Connection

```typescript
import { initializeMongoDB, disconnectFromMongoDB } from './lib/mongodb';

// Initialize connection with event listeners
const connection = await initializeMongoDB();

// Your application logic here...

// Gracefully disconnect
await disconnectFromMongoDB();
```

### Manual Connection with Custom Config

```typescript
import { connectToMongoDB, type MongoDBConfig } from './lib/mongodb';

const customConfig: MongoDBConfig = {
  uri: 'mongodb://localhost:27017/custom_db',
  options: {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  },
  retryAttempts: 3,
  retryDelayMs: 1000,
};

const connection = await connectToMongoDB(customConfig);
```

### Health Check

```typescript
import { healthCheck } from './lib/mongodb';

const health = await healthCheck();
console.log('MongoDB Status:', health.status); // 'healthy' | 'unhealthy'
console.log('Details:', health.details);
```

### Connection Status

```typescript
import { isMongoDBConnected, getConnectionInfo } from './lib/mongodb';

// Check if connected
if (isMongoDBConnected()) {
  console.log('MongoDB is connected');
}

// Get detailed connection information
const info = getConnectionInfo();
console.log('Connection Info:', info);
```

## Configuration

The utility uses environment-specific configurations:

### Development

- File logging enabled
- Debug level logging
- Local MongoDB instance
- 3 retry attempts

### Testing

- Minimal logging
- Separate test database
- 1 retry attempt
- Fast timeouts

### Production

- Google Cloud Logging
- Info level logging
- 5 retry attempts
- Longer timeouts

## API Reference

### Functions

#### `initializeMongoDB(config?: MongoDBConfig): Promise<Connection>`

Initializes MongoDB connection with event listeners and graceful shutdown handling.

#### `connectToMongoDB(config?: MongoDBConfig): Promise<Connection>`

Connects to MongoDB with retry logic. Returns existing connection if already connected.

#### `disconnectFromMongoDB(): Promise<void>`

Gracefully disconnects from MongoDB.

#### `isMongoDBConnected(): boolean`

Returns true if MongoDB is connected and ready.

#### `getConnectionInfo(): ConnectionInfo`

Returns detailed connection information including status, host, port, database name, and registered models.

#### `healthCheck(): Promise<HealthCheckResult>`

Performs a health check including database ping.

#### `getMongoDBConfig(): MongoDBConfig`

Returns environment-specific MongoDB configuration.

### Types

#### `MongoDBConfig`

```typescript
interface MongoDBConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
  retryAttempts?: number;
  retryDelayMs?: number;
}
```

#### `HealthCheckResult`

```typescript
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  details: Record<string, unknown>;
}
```

## Error Handling

The utility provides comprehensive error handling:

- Connection failures are logged with full context
- Retry logic with configurable attempts and delays
- Graceful degradation on repeated failures
- Proper error propagation to calling code

## Event Listeners

The utility automatically sets up event listeners for:

- `connected`: Logs successful connection
- `error`: Logs connection errors
- `disconnected`: Logs disconnection
- `reconnected`: Logs successful reconnection
- `SIGINT`: Graceful shutdown on process termination

## Testing

The utility includes comprehensive unit tests. To run tests:

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run with MongoDB available (requires TEST_MONGODB=true)
TEST_MONGODB=true npm run test:unit
```

## Example

See `src/examples/mongodb-usage.ts` for a complete example of how to use the MongoDB utility in your application.
