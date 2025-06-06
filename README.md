# Boishakh Auth

A TypeScript authentication library built with SWC for fast compilation.

## Setup

This project uses TypeScript with SWC (Speedy Web Compiler) for fast builds and development.

## Code Formatting

This project uses [Prettier](https://prettier.io/) for consistent code formatting.

### Prettier Configuration

- **Configuration**: `.prettierrc` contains project-specific formatting rules
- **Ignore file**: `.prettierignore` excludes certain files from formatting
- **VS Code integration**: Automatic formatting on save is enabled

### Available Commands

- `npm run format` - Format all files in the project
- `npm run format:check` - Check if files are properly formatted (CI-friendly)
- `npm run lint` - Alias for format:check

### Formatting Rules

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
├── dist/          # Compiled JavaScript output
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

### Usage Example

```typescript
import { BoishakhAuth, AuthConfig } from './dist/index.js';

const config: AuthConfig = {
  secret: 'your-secret-key',
  expiresIn: '1h',
};

const auth = new BoishakhAuth(config);
const token = auth.generateToken({ userId: 123, role: 'user' });
console.log('Generated token:', token);
```
