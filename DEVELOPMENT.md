# Development Guide

Guide for developers setting up a local cADR development environment.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** ([Download](https://nodejs.org/))
- **Yarn 1.22+** ([Install](https://classic.yarnpkg.com/en/docs/install))
- **Git 2.x+** ([Download](https://git-scm.com/))
- **OpenAI or Gemini API Key** (for testing LLM features)

## Initial Setup

### 1. Clone the Repository

Clone from the repository and navigate to the directory.

### 2. Install Dependencies

Use yarn to install all dependencies for the monorepo.

### 3. Build the Project

Compile TypeScript to JavaScript in the dist directories.

### 4. Set Up API Keys (for testing)

Export API keys as environment variables. Add to your shell profile for persistence.

## Project Structure

### Main Package: `packages/cli/`

The primary CLI package contains:

**Source Code (`src/`):**

- `commands/` - CLI command implementations
- `providers/` - LLM provider implementations (OpenAI, Gemini)
- `adr.ts` - ADR generation logic
- `analysis.ts` - Change analysis logic
- `config.ts` - Configuration management
- `git.ts` - Git operations wrapper
- `llm.ts` - LLM abstraction layer
- `logger.ts` - Structured logging
- `index.ts` - CLI entry point

**Other Directories:**

- `dist/` - Compiled JavaScript output
- Unit tests are co-located with source files (`.test.ts`)

### Supporting Directories

- `tests/integration/` - Integration tests
- `docs/` - User and developer documentation
- `specs/` - Feature specifications and contracts
- `scripts/` - Build and utility scripts
- `coverage/` - Test coverage reports

## Development Workflow

### Watch Mode (Recommended)

Set up automatic rebuilds on file changes for faster development.

### Testing Your Changes

#### Link the Package Locally

Link the local build to test changes without publishing.

#### Test in a Sample Project

Create a test directory with a git repository to validate changes.

#### Unlink When Done

Unlink the global package when testing is complete.

### Running Tests

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

## Key Components

### CLI Entry Point

Handles command-line parsing and orchestrates commands through argument parsing, configuration loading, command routing, and error handling.

### Configuration

Manages configuration files including loading, validation, schema definition, interactive initialization, and default values.

### Git Integration

Git operations wrapper for getting staged files, file diffs, uncommitted changes, and comparing commits.

### LLM Abstraction

Provider-agnostic LLM interface providing a unified API across providers, prompt management, response parsing, and error handling.

### Providers

Provider-specific implementations for OpenAI and Gemini, each implementing the LLMProvider interface.

### Analysis

Core analysis logic to determine if changes are architecturally significant, extract reasoning from LLM responses, and format analysis results.

### ADR Generation

ADR creation logic for generating ADR content via LLM, determining sequential numbering, creating files in proper format, and MADR template formatting.

### Logger

Structured logging with configurable log levels, pretty printing for development, JSON output for production, and context-aware logging.

## Building

### Development Build

Compile TypeScript with source maps for debugging.

### Production Build

Generate production-ready JavaScript in dist directories.

### Clean Build

Remove dist directories before rebuilding.

## Debugging

### VS Code

Configure launch.json for debugging with Node and source maps.

### Node Debugger

Use Node's built-in inspect functionality to debug.

### Debug Logging

Set log level environment variable to see debug output.

## Code Style

### TypeScript Guidelines

- Use strict TypeScript
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` when mutation needed
- Avoid `any`, use `unknown` if needed
- Explicit return types on exported functions

### Formatting

Use Prettier if configured.

### Linting

Run linter to check code style.

## Adding New Features

### 1. Check Existing Specs

Review specs directory for feature specifications and contracts.

### 2. Create Branch

Create a feature branch for your changes.

### 3. Implement with Tests

Write tests first (TDD) or alongside implementation.

### 4. Update Documentation

Update relevant docs including README, CHANGELOG, inline comments, and type definitions.

### 5. Test Thoroughly

Run all tests and check coverage.

### 6. Commit with Convention

Use conventional commit format. See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit conventions.

## Adding LLM Providers

To add a new LLM provider:

1. **Create provider file** in providers directory
2. **Implement interface**: Export class implementing `LLMProvider`
3. **Add to factory**: Update provider creation
4. **Update config schema**: Add provider to configuration enum
5. **Add tests**: Create unit tests
6. **Update docs**: Document the new provider option

### Provider Interface

The LLMProvider interface defines methods for analyzing changes and generating ADRs.

## Troubleshooting

### Build Errors

Clean and rebuild to resolve build issues.

### Test Failures

Run specific tests with verbose output or update snapshots as needed.

### TypeScript Errors

Check types without building using TypeScript compiler.

### Module Resolution Issues

Ensure configuration paths are correct and reinstall dependencies.

## IDE Setup

### VS Code Extensions (Recommended)

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Jest** - Test runner integration
- **TypeScript** - Built-in, ensure it's up to date

### WebStorm / IntelliJ

- TypeScript support built-in
- Enable ESLint in settings
- Configure Jest as test framework

## Performance Tips

### Faster Builds

Use incremental builds for faster rebuilds.

### Faster Tests

Run only affected tests using jest's changed files option.

## Getting Help

- 📖 [Testing Guide](./TESTING.md)
- 🤝 [Contributing Guide](./CONTRIBUTING.md)
- 🐛 [Report Issues](https://github.com/YotpoLtd/cADR/issues)
- 💬 [Discussions](https://github.com/YotpoLtd/cADR/discussions)

## Next Steps

- Review [TESTING.md](./TESTING.md) for testing guidelines
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution workflow
- Check `/specs/` for feature specifications
- Review `/docs/` for design documents

