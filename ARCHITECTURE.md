# Architecture

This document describes the high-level architecture of cADR.
See also CONTRIBUTING.md for development workflow.

## High-Level Structure

cADR is a TypeScript monorepo CLI tool that analyzes git diffs with LLMs
and generates Architecture Decision Records (ADRs) in MADR format.

```
packages/
  cli/             -- The core CLI tool (published as @cadr/cli)
  github-action/   -- GitHub Action wrapper (planned; depends on cli as a package)
```

## Data Flow

```
Git diff  -->  Analysis (LLM)  -->  ADR generation  -->  File output

1. git/           reads staged/uncommitted changes or commit diffs
2. analysis/      sends diff to LLM, detects architectural significance
3. adr/           formats significant changes into MADR documents
4. commands/      orchestrates the pipeline, writes files to disk
```

## Module Map (packages/cli/src/)

| Module | Description |
|---|---|
| `commands/analyze.ts` | Main `analyze` command -- orchestrates the full pipeline |
| `commands/init.ts` | Initializes cADR configuration in a project |
| `commands/status.ts` | Shows current cADR status and configuration |
| `analysis/` | Architectural significance detection via strategies |
| `analysis/strategies/git-strategy.ts` | Strategy that analyzes git diffs for significance |
| `adr/adr.ts` | ADR document generation and file writing |
| `git/git.operations.ts` | Git operations wrapper (diff, log, staged files) |
| `git/git.errors.ts` | Git-specific error types |
| `llm/llm.ts` | LLM abstraction layer -- single entry point for all model calls |
| `llm/prompts.ts` | Prompt templates for analysis and generation |
| `llm/response-parser.ts` | Parses and validates LLM responses |
| `providers/` | LLM provider implementations (OpenAI, Gemini) |
| `providers/registry.ts` | Provider discovery and registration |
| `providers/types.ts` | Shared provider interface definitions |
| `presenters/console-presenter.ts` | Console output formatting |
| `config.ts` | Configuration loading and validation |
| `logger.ts` | Structured logging utility |
| `index.ts` | CLI entry point and command registration |

## Module Boundaries

These constraints are expressed as absences -- things that must NOT happen:

- **providers/ must not depend on commands/.** Providers are leaf dependencies;
  they implement an interface and know nothing about CLI orchestration.
- **git/ must not depend on any LLM module.** Git operations are pure
  infrastructure with no knowledge of analysis or providers.
- **logger.ts has zero internal dependencies.** It depends only on external
  packages and Node.js built-ins. Every other module may depend on it.
- **github-action depends on cli as a package dependency, never imports
  source files directly.** The action consumes the published CLI interface.
- **llm/ must not depend on providers/ at the type level.** Providers
  implement the interface defined in llm/; the dependency arrow points inward.

## Key Architectural Invariants

- **Fail-open.** Errors log warnings but never block user workflows.
  The CLI must always exit cleanly even when LLM calls fail or git
  operations encounter unexpected state.
- **Provider-agnostic.** All LLM access flows through the `llm/` abstraction.
  Adding a new provider means implementing the interface in `providers/`
  and registering it -- no changes to analysis or command code.
- **Type-safe.** Full TypeScript strict mode across the entire codebase.
  No `any` in public interfaces.
