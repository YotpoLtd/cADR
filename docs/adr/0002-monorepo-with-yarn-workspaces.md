# 2. Monorepo with Yarn Workspaces

Date: 2026-03-01

## Status

Accepted

## Context

cADR ships two artifacts: a standalone CLI (`packages/cli`) and a GitHub Action that
wraps it. Both share TypeScript configuration, development tooling, and release
automation. We needed a repository structure that allows shared infrastructure while
keeping each package independently publishable.

## Decision

We use a monorepo managed by Yarn Workspaces with a top-level `package.json` declaring
`"workspaces": ["packages/*"]`. Each package (currently `packages/cli`, with
`packages/github-action` planned) has its own `package.json`, build scripts, and
publish configuration.

## Consequences

### Positive
- A single repository keeps CLI and GitHub Action changes in sync.
- Shared devDependencies (TypeScript, ESLint, Jest, Prettier) are hoisted, reducing duplication.
- One CI pipeline builds, tests, and releases all packages together.
- Atomic pull requests can span both packages when an interface changes.

### Negative
- Contributors must understand the workspace layout before navigating the code.
- Package-specific CI caching requires extra configuration to avoid rebuilding everything.
- Yarn Workspaces hoisting can occasionally cause phantom dependency issues.
