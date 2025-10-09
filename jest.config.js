module.exports = {
  // Multi-project configuration for monorepo
  projects: [
    {
      displayName: 'CLI Tests',
      testEnvironment: 'node',
      roots: ['<rootDir>/packages/cli/src'],
      testMatch: ['<rootDir>/packages/cli/src/**/?(*.)+(spec|test).ts', '<rootDir>/packages/cli/src/**/?(*.)+(spec|test).tsx'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: './packages/cli/tsconfig.json'
        }]
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      collectCoverageFrom: [
        'packages/cli/src/**/*.ts',
        'packages/cli/src/**/*.tsx',
        '!packages/cli/src/**/*.d.ts'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      clearMocks: true
    },
    {
      displayName: 'Integration Tests',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests'],
      testMatch: ['<rootDir>/tests/**/?(*.)+(spec|test).ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: './tsconfig.json'
        }]
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
      collectCoverageFrom: [
        'packages/*/src/**/*.ts',
        '!packages/*/src/**/*.d.ts'
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      clearMocks: true
    }
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  verbose: false
};

