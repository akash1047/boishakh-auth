# Pre-commit Configuration

This project uses lint-staged with Husky for automated code quality checks before commits.

## ✅ Setup Complete

The project has been configured with:

- **Husky** - Git hooks management
- **lint-staged** - Run linters on staged files only
- **Pre-commit hook** - Automatically runs on `git commit`

## What happens on commit

When you run `git commit`, the pre-commit hook will automatically:

1. **TypeScript/JavaScript files** (`*.{ts,tsx,js,jsx}`):

   - Run ESLint with auto-fix
   - Format with Prettier

2. **Other files** (`*.{json,md,yml,yaml}`):
   - Format with Prettier

## Available Commands

```bash
# Run lint-staged manually (same as pre-commit)
npm run lint-staged

# Complete code quality check (all files)
npm run code-quality

# Fix all auto-fixable issues (all files)
npm run lint:fix && npm run format
```

## How it works

### Lint-staged Configuration

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### Benefits

- **Fast** - Only processes staged files, not entire codebase
- **Automatic** - Runs on every commit without manual intervention
- **Consistent** - Ensures all committed code meets quality standards
- **Efficient** - Fixes issues automatically when possible

## Bypass (if needed)

To skip the pre-commit hook (not recommended):

```bash
git commit --no-verify -m "your message"
```

## Troubleshooting

### If pre-commit fails

1. **Fix the reported issues** - ESLint/Prettier will show what needs fixing
2. **Stage the fixes** - `git add .`
3. **Commit again** - `git commit -m "your message"`

### Manual quality check

```bash
# Check what lint-staged would do
npm run lint-staged

# Full project quality check
npm run code-quality
```
