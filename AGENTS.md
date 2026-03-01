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

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines including:

- Development setup
- Pull request process
- Code style guidelines
- Commit conventions

## Cursor Cloud specific instructions

This is a pure Node.js/TypeScript CLI tool with no Docker, databases, or background services. The update script runs `yarn install` to refresh dependencies on VM startup.

### Running the project

- Standard commands are in the "Standard Commands" section above (`yarn build`, `yarn lint`, `yarn test`, `yarn test:coverage`).
- `yarn build` must succeed before running integration tests, as they invoke the compiled CLI at `packages/cli/dist/index.js`.
- The CLI can be tested directly via `node packages/cli/dist/index.js <command>`.

### Caveats

- `cadr init` and `cadr analyze` are interactive (prompt for user input). When testing these commands in automation, either pipe input or create config files manually instead.
- Integration tests create temporary Git repositories in `/tmp` and clean up after themselves.
- Unit tests mock all LLM calls and Git operations — no API keys are needed.
- The `OPENAI_API_KEY` or `GEMINI_API_KEY` environment variables are only needed for live end-to-end testing of the `analyze` command against a real LLM provider.
