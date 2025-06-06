# ESLint Configuration

This project uses ESLint v9 with the modern flat configuration format and TypeScript support.

## Configuration Overview

### Files

- `eslint.config.js` - Main ESLint configuration using flat config format
- `.vscode/settings.json` - VS Code integration settings

### Dependencies

- **eslint** - Core ESLint package
- **typescript-eslint** - TypeScript ESLint integration
- **@eslint/js** - Official JavaScript ESLint configurations
- **eslint-config-prettier** - Disables ESLint rules that conflict with Prettier

### Configuration Structure

The ESLint configuration is organized into several sections:

#### 1. Base Configurations

- JavaScript recommended rules
- TypeScript recommended, strict, and stylistic rules
- Prettier compatibility

#### 2. Source Files (`src/**/*.{ts,tsx}`)

**TypeScript Rules:**

- Unused variables with underscore prefix exceptions
- Nullish coalescing preferred over logical OR
- Optional chaining enforcement
- Async/await best practices
- Type assertion optimizations

**General Rules:**

- Console allowed (Node.js environment)
- Prefer const over let/var
- Template literals over string concatenation
- Arrow functions and destructuring

#### 3. Test Files

- Relaxed rules for test files
- Allows `any` type and non-null assertions
- Flexible variable usage

#### 4. Configuration Files

- Allows require() statements
- Excludes from TypeScript project checking
- Relaxed Node.js specific rules

## Available Scripts

```bash
# Lint all files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Check linting (CI-friendly)
npm run lint:check
```

## VS Code Integration

The configuration includes VS Code settings for:

- Auto-fix on save
- ESLint flat config support
- Organize imports on save
- TypeScript and JavaScript file validation

## Rules Highlights

### TypeScript Specific

- **@typescript-eslint/prefer-nullish-coalescing**: Use `??` instead of `||` for safer null checks
- **@typescript-eslint/prefer-optional-chain**: Use `?.` for safe property access
- **@typescript-eslint/no-floating-promises**: Ensure promises are handled
- **@typescript-eslint/require-await**: Functions marked async must use await

### Code Style

- **prefer-const**: Use const for variables that don't change
- **prefer-template**: Use template literals over string concatenation
- **object-shorthand**: Use ES6 shorthand properties
- **arrow-body-style**: Concise arrow function syntax

### Best Practices

- **no-duplicate-imports**: Prevent duplicate import statements
- **prefer-destructuring**: Use destructuring where appropriate
- **no-useless-rename**: Avoid unnecessary variable renaming

## Ignored Files

The following files and directories are ignored:

- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `*.tsbuildinfo`
- `.eslintcache`
- Log files

## Usage Examples

### Running ESLint

```bash
# Check all files
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific files
npx eslint src/index.ts

# Check with specific format
npx eslint src/ --format=table
```

### Integration with CI/CD

```bash
# In CI pipeline
npm run lint:check
```

This ensures zero warnings policy and fails the build if any linting issues exist.

## Customization

To add or modify rules, edit `eslint.config.js`:

```javascript
// Add custom rule
{
  files: ['src/**/*.ts'],
  rules: {
    'your-custom-rule': 'error'
  }
}
```

## Troubleshooting

### Common Issues

1. **Parser errors with config files**: Config files are excluded from TypeScript project checking
2. **Module import errors**: Ensure TypeScript path mapping is configured correctly
3. **Prettier conflicts**: Rules that conflict with Prettier are automatically disabled

### Performance

For large projects, consider:

- Using `.eslintcache` for faster subsequent runs
- Limiting TypeScript project scope in `parserOptions.project`
- Using file-specific configurations for better performance
