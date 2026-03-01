# Contributing with AI Agents

This document provides guidance for AI agents (like Claude) contributing to cADR.

## Core Philosophy: Research-Plan-Implement (RPI)

We follow a simple three-phase pattern:

1. **Research**: Understand the codebase and requirements (read-only exploration)
2. **Plan**: Design the solution and get approval
3. **Implement**: Execute with tests and verification

## Standard Development Workflow

### 1. Research Phase

- Explore the codebase to understand existing patterns
- Identify relevant files and modules
- Understand the change requirements and context
- Document findings before proceeding

### 2. Planning Phase

- Design the implementation approach
- Identify files to modify
- Consider edge cases and testing strategy
- Get plan approval before implementing

### 3. Implementation Phase

- Make code changes following existing patterns
- Follow the Robust Loop: Build → Lint → Test → Coverage
- Update documentation as needed
- Verify changes work end-to-end

## Standard Commands

Use these commands for development:

- `yarn build` - Compile TypeScript to JavaScript
- `yarn lint` - Run ESLint for code quality
- `yarn test` - Run Jest test suite
- `yarn test:coverage` - Check test coverage

## Testing Requirements

- All new features must include tests
- Maintain or improve test coverage
- Both unit tests and integration tests are required
- Tests should cover edge cases and error scenarios

## Code Quality Standards

- Follow TypeScript strict mode
- Use existing code patterns and conventions
- Write clear, descriptive commit messages
- Update relevant documentation as code changes

## Error Handling Policy

cADR follows a fail-open error strategy. Errors must never block the user's Git workflow.

### Rules

- Always throw `Error` objects, never literals (enforced by ESLint `no-throw-literal`)
- Never swallow errors silently — log via `logger.ts` with appropriate level
- Catch at command boundaries (in `commands/`), warn and continue
- Never call `process.exit()` directly — let Commander handle exit codes
- Use descriptive error messages that include context (what operation failed, what input caused it)

### Pattern

```typescript
try {
  const result = await riskyOperation(input);
} catch (error) {
  logger.warn(`Operation failed for ${context}: ${error}`);
  return fallbackValue;
}
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines including:

- Development setup
- Pull request process
- Code style guidelines
- Commit conventions
