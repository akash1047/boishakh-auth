# Boishakh Auth

A TypeScript Express authentication server built with SWC for fast compilation and development. This server provides authentication endpoints and health check functionality.

## Setup

This project uses TypeScript with SWC (Speedy Web Compiler) for fast builds and development.

## Code Quality

This project uses modern tools for maintaining high code quality:

### ESLint Configuration

- **ESLint v9** with flat configuration format
- **TypeScript ESLint** integration with strict rules
- **Prettier integration** to avoid conflicts
- **VS Code integration** for real-time feedback

### Code Quality Tools

- **Prettier** - Consistent code formatting
- **ESLint** - Code linting and best practices
- **TypeScript** - Static type checking
- **Jest** - Testing framework

### Available Commands

- `npm run format` - Format all files in the project
- `npm run format:check` - Check if files are properly formatted (CI-friendly)
- `npm run lint` - Lint all files with zero warnings policy
- `npm run lint:fix` - Auto-fix linting issues
- `npm run lint:cache` - Fast linting with cache
- `npm run type-check` - TypeScript type checking
- `npm run code-quality` - Complete code quality check

### Code Quality Rules

- Single quotes for strings
- Semicolons at end of statements
- 2 spaces for indentation
- 80 character line width
- Trailing commas where valid in ES5
- LF line endings

### Development Scripts

- `npm run build` - Compile TypeScript to JavaScript using SWC
- `npm run build:types` - Generate TypeScript declaration files
- `npm run build:full` - Full build (compile + generate types)
- `npm run dev` - Watch mode development (auto-recompile on changes)
- `npm run start` - Run the compiled JavaScript
- `npm run type-check` - Type check without emitting files
- `npm run clean` - Remove build artifacts

### Project Structure

```
├── src/           # TypeScript source files
│   └── index.ts   # Express server entry point
├── dist/          # Compiled JavaScript output
├── tests/         # Test files (unit, integration, e2e)
├── .swcrc         # SWC configuration
├── tsconfig.json  # TypeScript configuration
└── package.json   # Project configuration
```

### Configuration Files

#### TypeScript (tsconfig.json)

- Target: ES2022
- Module: CommonJS
- Strict mode enabled
- Declaration files and source maps generated
- Path alias support (@/_ -> src/_)

#### SWC (.swcrc)

- TypeScript parser with decorator support
- CommonJS module output
- Source maps enabled
- Fast compilation for development

### Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build:full
   ```

3. Run the compiled code:

   ```bash
   npm start
   ```

4. For development with auto-recompilation:

   ```bash
   npm run dev
   ```

### API Endpoints

The server provides the following endpoints:

- `GET /` - Hello world endpoint with service information
- `GET /health` - Health check endpoint with uptime and status

### Usage Example

Once the server is running, you can access:

```bash
# Hello world endpoint
curl http://localhost:3000/

# Health check endpoint
curl http://localhost:3000/health
```

### Example Response

**GET /** returns:

```json
{
  "message": "Hello World! 🎉",
  "service": "boishakh-auth",
  "version": "1.0.0",
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

**GET /health** returns:

```json
{
  "status": "OK",
  "message": "Service is healthy",
  "timestamp": "2025-06-06T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```
