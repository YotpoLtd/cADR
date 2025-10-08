# cADR - Continuous Architectural Decision Records

[![Test](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml/badge.svg)](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-37%25-orange)](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/cadr-cli.svg)](https://www.npmjs.com/package/cadr-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
# Using GitHub Packages
npx @yotpoltd/cadr-cli@latest --registry=https://npm.pkg.github.com
```

### Global installation

```bash
# Using GitHub Packages (recommended)
npm install -g @yotpoltd/cadr-cli --registry=https://npm.pkg.github.com

# Or configure npm to use GitHub Packages for @yotpoltd scope
echo "@yotpoltd:registry=https://npm.pkg.github.com" >> ~/.npmrc
npm install -g @yotpoltd/cadr-cli
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

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, commit conventions, and release process.

### GitHub Packages

This project uses GitHub Packages for distribution. See [docs/GITHUB_PACKAGES.md](./docs/GITHUB_PACKAGES.md) for detailed configuration instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
