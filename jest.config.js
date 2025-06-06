/** @type {import('jest').Config} */
module.exports = {
  // Use SWC for transforming TypeScript files
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true,
            dynamicImport: true,
          },
          target: 'es2022',
          keepClassNames: true,
          transform: {
            decoratorMetadata: true,
            legacyDecorator: true,
          },
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },

  testMatch: ['<rootDir>/tests/**/*.(test|spec).(ts|js)'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  collectCoverageFrom: ['src/**/*.(ts|js)', '!src/**/*.d.ts'],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  clearMocks: true,
  restoreMocks: true,
  verbose: true,

  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.(test|spec).(ts|js)'],
      transform: {
        '^.+\\.(t|j)sx?$': [
          '@swc/jest',
          {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: false,
                decorators: true,
                dynamicImport: true,
              },
              target: 'es2022',
              keepClassNames: true,
              transform: {
                decoratorMetadata: true,
                legacyDecorator: true,
              },
            },
            module: {
              type: 'commonjs',
            },
          },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.(test|spec).(ts|js)'],
      transform: {
        '^.+\\.(t|j)sx?$': [
          '@swc/jest',
          {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: false,
                decorators: true,
                dynamicImport: true,
              },
              target: 'es2022',
              keepClassNames: true,
              transform: {
                decoratorMetadata: true,
                legacyDecorator: true,
              },
            },
            module: {
              type: 'commonjs',
            },
          },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'e2e',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/e2e/**/*.(test|spec).(ts|js)'],
      transform: {
        '^.+\\.(t|j)sx?$': [
          '@swc/jest',
          {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: false,
                decorators: true,
                dynamicImport: true,
              },
              target: 'es2022',
              keepClassNames: true,
              transform: {
                decoratorMetadata: true,
                legacyDecorator: true,
              },
            },
            module: {
              type: 'commonjs',
            },
          },
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  ],
};
