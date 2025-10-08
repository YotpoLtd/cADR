# Contributing to cADR

Thank you for your interest in contributing to cADR! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 20+
- Yarn 1.22+ (package manager)
- Git 2.x+ (for Git integration features)

### Setup

```bash
# Clone the repository
git clone https://github.com/YotpoLtd/cADR.git
cd cADR

# Install dependencies
yarn install

# Build packages
yarn build

# Run tests
yarn test
```

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

### Examples

```bash
feat: add support for TypeScript files
fix: resolve git integration issue
docs: update installation instructions
BREAKING CHANGE: remove deprecated API endpoint
```

## Release Process

Releases are **automatically triggered** when changes are merged to the `master` branch:

1. **Conventional commits** are analyzed to determine version bump
2. **CHANGELOG.md** is automatically updated
3. **Git tags** are created (e.g., `v1.0.0`)
4. **GitHub release** is published with release notes
5. **npm package** is published

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the commit convention
4. Run tests (`yarn test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Add tests for new functionality
- Update documentation as needed

## Testing

Run the test suite:

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run linting
yarn lint

# Format code
yarn format
```

## Questions?

If you have any questions, please open an issue or start a discussion in the repository.
