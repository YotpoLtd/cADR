module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).tsx'],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    'packages/*/src/**/*.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        jsxImportSource: 'react'
      }
    }]
  },
  // coverageThreshold: {
  //   global: {
  //     branches: 20,
  //     functions: 20,
  //     lines: 20,
  //     statements: 20
  //   }
  // },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  verbose: false
};

