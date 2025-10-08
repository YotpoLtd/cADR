# Research: Hello World - Deployable NPM Package

**Feature**: 001-hello-world-a  
**Date**: 2025-10-05  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a minimal, deployable NPM package that establishes the foundation for the cADR project. All technical decisions are documented with rationale and alternatives considered.

---

## 1. TypeScript Monorepo Setup

### Decision
Use **npm workspaces** (native to npm 7+) for monorepo management.

### Rationale
- Built into npm, no additional tooling or dependencies required
- Simple workspace protocol (`workspace:*`) for inter-package dependencies
- Sufficient for project scope (3-4 packages maximum)
- Aligns with Constitution's "minimize dependencies" principle

### Alternatives Considered
| Tool | Pros | Cons | Why Rejected |
|------|------|------|--------------|
| **Lerna** | Mature, well-documented | Adds external dependency, overkill for small projects | Unnecessary complexity |
| **Yarn Workspaces** | Similar to npm workspaces | Requires Yarn installation | Team standardized on npm |
| **Turborepo** | Fast builds, caching | Heavy tooling, enterprise-focused | Over-engineered for 2-3 packages |
| **Rush** | Microsoft-backed, scalable | Very enterprise-focused, steep learning curve | Not suitable for open-source CLI tool |

### Implementation
```json
// Root package.json
{
  "name": "cadr",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

---

## 2. CLI Executable Configuration

### Decision
Use npm's standard **`bin` field** with Node.js shebang wrapper.

### Rationale
- Standard npm approach for creating command-line executables
- Works cross-platform (npm automatically creates .cmd wrapper on Windows)
- Enables both `npx` and global install use cases
- No additional build tools required

### Implementation Pattern
```json
// packages/cli/package.json
{
  "name": "cadr-cli",
  "version": "0.0.1",
  "bin": {
    "cadr": "./bin/cadr.js"
  }
}
```

```javascript
// packages/cli/bin/cadr.js
#!/usr/bin/env node
require('../dist/index.js');
```

### Cross-Platform Considerations
- Shebang ignored on Windows (Node.js called directly)
- npm creates `cadr.cmd` automatically on Windows during install
- Exit codes properly propagated on all platforms

---

## 3. TypeScript Build Strategy

### Decision
Use **`tsc`** (TypeScript compiler) with project references for monorepo builds.

### Rationale
- No bundler needed for Node.js runtime target
- Project references ensure correct build order (core before cli)
- Faster incremental builds during development
- Simpler debugging (source maps map 1:1 with source files)
- Aligns with "simplicity" principle from Constitution

### Configuration
```json
// Root tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/cli" }
  ]
}
```

### Build Command
```bash
tsc --build
```

### Alternatives Considered
| Tool | Pros | Cons | Why Rejected |
|------|------|------|--------------|
| **esbuild** | Very fast, bundles | Adds complexity, TS support via plugin | Premature optimization |
| **Webpack** | Full-featured bundler | Heavy, complex config, overkill | Not needed for Node.js target |
| **Rollup** | Good for libraries | Extra dependency, minimal benefit | Native tsc sufficient |
| **ts-node** | Direct TS execution | Not for production distribution | Development-only tool |

---

## 4. Testing Strategy for NPM Publication

### Decision
Use **`npm pack`** + local installation for CI testing, with `--dry-run` for validation.

### Rationale
- `npm pack` creates actual .tgz tarball identical to published package
- Can test installation and execution without publishing to registry
- `npm publish --dry-run` validates package.json and included files
- Catches common issues (missing bin files, incorrect main entry, etc.)

### CI Test Approach
```bash
# In GitHub Actions workflow
npm run build                                  # Build all packages
npm pack --workspace=cadr-cli                  # Create tarball
npm install -g ./cadr-cli-0.0.1.tgz           # Install from tarball
cadr                                           # Execute to verify
```

### What This Validates
- ✅ Package structure is correct
- ✅ Executable permissions set properly
- ✅ Dependencies resolved correctly
- ✅ Entry points work as expected
- ✅ Package metadata is valid

### Alternative: Verdaccio
**Considered**: Local npm registry using Verdaccio  
**Rejected**: Too heavy for this simple validation. `npm pack` sufficient.

---

## 5. GitHub Actions Release Automation

### Decision
Use **tag-triggered workflow** with npm provenance for automated releases.

### Rationale
- Tag pattern (`v*`) is industry standard for semantic versioning
- Provenance provides supply chain security attestation (npm feature)
- Automated releases eliminate human error in publish process
- GitHub release notes auto-generation from commits

### Workflow Trigger
```yaml
on:
  push:
    tags:
      - 'v*.*.*'
```

### Release Process
1. Developer creates git tag: `git tag v0.0.1`
2. Push tag: `git push origin v0.0.1`
3. GitHub Actions triggers release workflow
4. Workflow builds, tests, publishes to npm
5. Creates GitHub Release with notes

### npm Provenance
```yaml
- run: npm publish --workspace=cadr-cli --provenance --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Benefits of Provenance**:
- Links npm package to source code and build process
- Verifiable supply chain attestation
- Increases trust for open-source consumers

---

## 6. Version Management Strategy

### Decision
**Manual version bumps** for v0.0.1, automation consideration for future.

### Rationale
- First release, establish pattern before adding tooling
- Manual control ensures proper version semantics
- Automation can be added later without changing workflows

### Version Strategy
| Version | Milestone | Description |
|---------|-----------|-------------|
| **0.0.1** | Story #1 | Hello World - Pipeline validation |
| **0.1.0** | Story #2 | First functional feature (git interaction) |
| **0.2.0** | Story #3 | LLM integration for analysis |
| **1.0.0** | MVP Complete | Production-ready with all core stories |

### Future Automation Options
- **standard-version**: Conventional commits → version bump
- **semantic-release**: Fully automated releases
- **changeset**: Good for monorepos, manual change descriptions

**Recommendation**: Evaluate `changeset` after Story #3, as it works well with npm workspaces.

---

## 7. Test Framework Configuration

### Decision
Use **Jest** with **ts-jest** for TypeScript support.

### Rationale
- Industry standard for Node.js/TypeScript testing
- Excellent TypeScript support via ts-jest
- Built-in coverage reporting
- Familiar to most developers (reduces onboarding friction)
- Supports both unit and integration tests

### Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Alternatives Considered
| Tool | Pros | Cons | Why Rejected |
|------|------|------|--------------|
| **Vitest** | Very fast, modern | Newer, less ecosystem support | Jest more battle-tested |
| **Mocha + Chai** | Flexible, modular | Requires more setup | Jest more batteries-included |
| **AVA** | Fast, concurrent | Less TypeScript support | Jest better for TypeScript |

---

## 8. Linting and Code Quality

### Decision
**ESLint** + **Prettier** for code quality and formatting.

### Rationale
- ESLint catches code quality issues and bugs
- Prettier ensures consistent formatting (non-negotiable)
- TypeScript ESLint plugin provides type-aware linting
- Can enforce constitutional principles (e.g., no console.log)

### Configuration Highlights
```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'error',  // Enforce structured logging (Constitution)
    '@typescript-eslint/no-explicit-any': 'error'
  }
};
```

### CI Integration
- Lint check runs before tests
- Formatting verified automatically
- Blocks PR merge if violations exist

---

## Summary of Research Findings

| Area | Decision | Rationale |
|------|----------|-----------|
| **Monorepo** | npm workspaces | Native, simple, sufficient |
| **CLI Binary** | npm `bin` field + shebang | Standard, cross-platform |
| **Build** | TypeScript compiler (tsc) | Simple, no bundler needed |
| **Testing NPM** | npm pack + local install | Validates actual package |
| **Releases** | Tag-triggered GitHub Actions | Automated, provenance |
| **Versioning** | Manual for v0.0.1 | Establish pattern first |
| **Test Framework** | Jest + ts-jest | Industry standard |
| **Linting** | ESLint + Prettier | Quality + consistency |

All decisions align with Constitutional principles:
- ✅ Simplicity (no unnecessary tooling)
- ✅ Minimal dependencies
- ✅ Standard practices
- ✅ Test-first development support
- ✅ CI/CD automation

---

## Open Questions: NONE

All technical unknowns have been resolved. Ready for Phase 1 (Design & Contracts).

---

**Status**: ✅ Complete  
**Next Phase**: Design & Contracts (Phase 1)

