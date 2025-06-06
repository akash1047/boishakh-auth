# GitHub Actions CI/CD Pipeline

This project uses GitHub Actions to implement a comprehensive testing strategy with different types of tests running at different stages of the development workflow.

## 🚀 Workflow Overview

### Testing Strategy

Our CI/CD pipeline implements a three-tier testing strategy:

1. **Unit Tests** - Fast, isolated tests that run on PRs to `develop`
2. **Integration Tests** - Component interaction tests that run on PRs to `main` and merges to `develop`
3. **E2E Tests** - Full application tests that run on merges to `main`

### Branch Strategy

```
main (production) ← PR ← develop (staging) ← feature branches
```

## 📋 Workflows

### 1. Unit Tests (`unit-tests.yml`)

**Triggers:**

- Pull requests against `develop` branch
- Changes to source code, unit tests, or build configuration

**What it does:**

- Runs on Node.js 18.x and 20.x
- Type checking with TypeScript
- Code linting with ESLint
- Unit tests only (`npm run test:unit:ci`)
- Uploads coverage reports to Codecov
- Comments PR with test results and coverage

**Duration:** ~2-3 minutes

### 2. Integration Tests (`integration-tests.yml`)

**Triggers:**

- Pull requests against `main` branch
- Pushes to `develop` branch
- Changes to source code, integration tests, or build configuration

**What it does:**

- Runs on Node.js 18.x and 20.x
- Full application build
- Type checking and linting
- Integration tests (`npm run test:integration:ci`)
- Can include database/service setup
- Uploads coverage reports
- Comments PR with results

**Duration:** ~5-8 minutes

### 3. E2E Tests (`e2e-tests.yml`)

**Triggers:**

- Pushes to `main` branch (after merge)
- Changes to source code, E2E tests, or build configuration

**What it does:**

- Runs on Node.js 20.x only
- Full application build and deployment
- Starts the application server
- Runs comprehensive E2E tests
- Health checks and monitoring
- Creates deployment notification issue
- Uploads test artifacts on failure

**Duration:** ~10-15 minutes

## 🔧 Configuration

### Environment Variables

Set these in your GitHub repository secrets:

```bash
# Optional: For coverage reporting
CODECOV_TOKEN=your_codecov_token

# For production E2E tests (if needed)
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### Node.js Versions

- **Unit/Integration Tests**: Node.js 18.x and 20.x (matrix strategy)
- **E2E Tests**: Node.js 20.x only (latest stable)

### Test Environment

All tests run with:

- `NODE_ENV=testing`
- `LOG_LEVEL=silent` (to reduce noise)

## 📊 Coverage Reporting

Coverage reports are automatically:

- Generated for each test type
- Uploaded to Codecov (if token provided)
- Displayed in PR comments
- Stored as artifacts

### Coverage Flags

- `unit-tests` - Unit test coverage
- `integration-tests` - Integration test coverage
- `e2e-tests` - E2E test coverage

## 🎯 Workflow Features

### Fast Feedback

- **Unit tests** run first (fastest feedback)
- **Path filters** only run tests when relevant files change
- **Matrix strategy** tests multiple Node.js versions in parallel

### Quality Gates

- **Type checking** ensures TypeScript correctness
- **Linting** enforces code quality standards
- **Test coverage** tracks code coverage metrics
- **Zero warnings policy** maintains high code quality

### Deployment Safety

- **Progressive testing** - more comprehensive tests closer to production
- **Health checks** ensure application starts correctly
- **Artifact collection** helps debug failures
- **Deployment notifications** track successful deployments

## 🚦 Usage Examples

### Feature Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-auth-endpoint

# 2. Develop and commit changes
git add .
git commit -m "feat: add new authentication endpoint"

# 3. Push and create PR to develop
git push origin feature/new-auth-endpoint
# → Creates PR to develop
# → Triggers unit tests

# 4. After review, merge to develop
# → No additional tests (unit tests already passed)

# 5. Create PR from develop to main
# → Triggers integration tests

# 6. After review, merge to main
# → Triggers E2E tests
# → Creates deployment notification
```

### Test Commands

Run the same commands locally:

```bash
# Unit tests
npm run test:unit:ci

# Integration tests
npm run test:integration:ci

# E2E tests
npm run test:e2e:ci

# All tests
npm run test:ci

# With coverage
npm run test:coverage
```

## 🔍 Monitoring and Debugging

### Test Failures

1. **Check the Actions tab** in your GitHub repository
2. **Review the logs** for each failed step
3. **Download artifacts** if available (E2E tests)
4. **Run tests locally** to reproduce issues

### Coverage Drops

1. **Check coverage reports** in PR comments
2. **Review Codecov dashboard** for detailed analysis
3. **Add tests** for uncovered code paths
4. **Update coverage thresholds** if needed

### Performance Issues

1. **Monitor workflow duration** in Actions dashboard
2. **Optimize test setup** and teardown
3. **Use caching** for dependencies and builds
4. **Parallelize tests** where possible

## 📈 Best Practices

### Writing Tests

- **Unit tests** should be fast and isolated
- **Integration tests** should test component interactions
- **E2E tests** should test critical user workflows
- **Use descriptive test names** and good test structure

### Maintaining Workflows

- **Keep workflows updated** with dependency changes
- **Monitor performance** and optimize slow steps
- **Review and update** Node.js versions regularly
- **Test workflow changes** in feature branches

### Security

- **Use specific action versions** (e.g., `@v4` not `@latest`)
- **Minimize secrets usage** and scope appropriately
- **Review third-party actions** before adding
- **Keep actions updated** for security patches

## 🎉 Success Metrics

With this setup, you can expect:

- ✅ **Fast feedback** - Unit tests complete in ~2-3 minutes
- ✅ **Comprehensive coverage** - All test types automated
- ✅ **Quality gates** - Code quality enforced automatically
- ✅ **Deployment confidence** - E2E tests validate production readiness
- ✅ **Developer productivity** - Clear workflow and fast iteration

## 🔧 Customization

### Adding Services

To add databases or other services to integration/E2E tests:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

### Custom Test Scripts

Add custom scripts to `package.json`:

```json
{
  "scripts": {
    "test:smoke": "jest --selectProjects smoke",
    "test:performance": "jest --selectProjects performance"
  }
}
```

### Notifications

Customize notifications by modifying the GitHub Script actions in each workflow file.

Your GitHub Actions CI/CD pipeline is now ready! 🚀
