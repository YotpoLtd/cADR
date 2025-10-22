# Contributing to cADR

Thank you for your interest in contributing to cADR! This document provides guidelines for contributing to the project.

## 🚀 Quick Start for Contributors

New to the project? Here's where to start:

1. **Read the [Development Setup Guide](./DEVELOPMENT.md)** - Set up your local environment
2. **Check the [Testing Guide](./TESTING.md)** - Learn how to run and write tests
3. **Review existing issues** - Find something to work on
4. **Join discussions** - Ask questions, share ideas

## 📐 Project Architecture

### High-Level Overview

cADR is a TypeScript CLI tool that:

1. **Integrates with Git** - Reads staged/uncommitted changes or commit diffs
2. **Analyzes with LLMs** - Uses OpenAI or Gemini to detect architectural significance
3. **Generates ADRs** - Creates MADR-formatted documentation automatically
4. **Fails gracefully** - Never blocks user workflows, even on errors

### Key Components

- `commands/` - CLI command implementations
- `providers/` - LLM provider implementations (OpenAI, Gemini)
- `adr.ts` - ADR generation logic
- `analysis.ts` - Architectural significance detection
- `config.ts` - Configuration management
- `git.ts` - Git operations wrapper
- `llm.ts` - LLM abstraction layer
- `logger.ts` - Structured logging
- `index.ts` - CLI entry point

### Architecture Principles

- **Fail-Open**: Errors log warnings but never block the user
- **Provider-Agnostic**: LLM providers are abstracted behind a common interface
- **Git-Native**: Works with standard Git commands and workflows
- **Structured Logging**: All operations are logged with context for debugging
- **Type-Safe**: Full TypeScript with strict mode enabled

## 🛠️ Development Setup

See the comprehensive [Development Guide](./DEVELOPMENT.md) for:

- Prerequisites and installation
- Project structure details
- Building and debugging
- IDE setup recommendations

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

### Commit Format

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `BREAKING CHANGE:` or `!` - Breaking changes (major version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

## Release Process

Releases are **automatically triggered** when changes are merged to the `master` branch:

1. **Conventional commits** are analyzed to determine version bump
2. **CHANGELOG.md** is automatically updated
3. **Git tags** are created
4. **GitHub release** is published with release notes
5. **npm package** is published

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes following the commit convention
4. Run tests
5. Commit your changes
6. Push to the branch
7. Open a Pull Request

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add tests for new functionality
- Update documentation as needed

## 🧪 Testing

Testing is a critical part of cADR. We use both unit and integration tests to ensure reliability.

See the comprehensive [Testing Guide](./TESTING.md) for details on running and writing tests.

## 🎯 Finding Something to Work On

### Good First Issues

Look for issues labeled `good first issue` - these are great entry points for new contributors.

### Areas That Need Help

- **LLM Providers**: Add support for new providers (Anthropic, etc.)
- **Documentation**: Improve guides, add examples, fix typos
- **Testing**: Increase test coverage, add integration tests
- **Features**: Check the issue tracker for feature requests

### Before Starting Work

1. **Check existing issues/PRs** - Someone might already be working on it
2. **Comment on the issue** - Let others know you're working on it
3. **Ask questions** - Clarify requirements before diving in

## 📚 Additional Resources

- **[Development Guide](./DEVELOPMENT.md)** - Detailed development setup and workflows
- **[Testing Guide](./TESTING.md)** - Comprehensive testing documentation
- **[Usage Guide](./docs/USAGE.md)** - Understanding how cADR works
- **[Specifications](./specs/)** - Feature specs and contracts

## ❓ Questions?

If you have any questions:

- 💬 [Start a discussion](https://github.com/YotpoLtd/cADR/discussions)
- 🐛 [Open an issue](https://github.com/YotpoLtd/cADR/issues)
- 📖 Read the [documentation](./docs/)
