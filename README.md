# cADR - Continuous Architectural Decision Records

Automatically capture and document architectural decisions as you code.

## Features

- 🤖 AI-powered detection of significant code changes
- 📝 Automated ADR generation
- ⚡ Integrates with git workflow (pre-commit hook)
- 🔄 GitHub PR review integration
- 📦 Zero-config for quick start

## Installation

### Via npx (no install required)

```bash
npx cadr@latest
```

### Global installation

```bash
npm install -g cadr-cli
```

## Current Status

**Version 0.0.1** - Hello World release

This initial release validates the CI/CD pipeline and package distribution. 
Full ADR functionality coming in upcoming releases!

## Roadmap

- [x] v0.0.1: Package distribution and CI/CD
- [ ] v0.1.0: Git integration and file analysis
- [ ] v0.2.0: LLM-powered change detection
- [ ] v0.3.0: ADR generation
- [ ] v1.0.0: Full MVP with CLI and GitHub Agent

## Development

### Prerequisites

- Node.js 20+
- npm 7+

### Setup

```bash
# Clone the repository
git clone https://github.com/rbarabash/cADR.git
cd cADR/cADR

# Install dependencies
npm install

# Build packages
npm run build

# Run tests
npm test
```

### Project Structure

```
cADR/
├── packages/
│   ├── core/          # @cadr/core - Business logic library
│   └── cli/           # cadr-cli - CLI executable
├── tests/
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
└── specs/             # Feature specifications
```

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT

