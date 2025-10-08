module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'error', // Enforce structured logging (Constitution)
    '@typescript-eslint/no-explicit-any': 'error'
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js']
};

