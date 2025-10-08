# cADR Constitution

## Core Principles

### I. Library-First Architecture

Every feature MUST be implemented as a pure TypeScript library in `@cadr/core` before any UI or tooling wrapper is created.

**Requirements:**

- All business logic lives in `@cadr/core`
- Libraries must be self-contained and independently testable
- No direct dependencies on CLI frameworks, GitHub APIs, or UI libraries in core
- Clear, single-responsibility modules (e.g., `git.ts`, `llm.ts`, `prompts.ts`, `adr.ts`)
- Core exports clean, well-typed functions (e.g., `analyze(diff): Promise<AnalysisResult>`, `generate(diff): Promise<string>`)

**Rationale:** This enables code reuse across CLI, GitHub Agent, and future integrations (VS Code extension, CI/CD plugins) without duplication.

### II. Monorepo Structure

The project is organized as an npm workspaces monorepo with clear separation of concerns.

**Structure:**

```
packages/
  core/           # @cadr/core - Pure business logic
  cli/            # cadr-cli - Ink-based user interface
  agent-tools/    # cadr-agent-tools - GitHub Agent integration
```

**Requirements:**

- Each package has its own `package.json` with explicit dependencies
- Shared TypeScript configuration in root `tsconfig.json`
- Core cannot depend on cli or agent-tools
- CLI and agent-tools can only import from core

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory for all features. No implementation without tests.

**Workflow:**

1. Write failing tests that define expected behavior
2. Get user/stakeholder approval on test scenarios
3. Verify tests fail (RED)
4. Implement minimum code to pass tests (GREEN)
5. Refactor while keeping tests green (REFACTOR)

**Requirements:**

- Unit tests for all core modules with mocked external dependencies (git, LLM APIs)
- Integration tests for module interactions (LangChain client, prompt processing)
- End-to-end tests for complete user journeys (CLI flows, file creation)
- Minimum 80% code coverage required for CI to pass
- Tests must use proper mocking for external services (no real LLM API calls in tests)

### IV. Fail-Open Principle

The system MUST never block a developer's workflow due to cADR failures.

**Requirements:**

- All LLM API calls have configurable timeouts (default: 15 seconds)
- Network failures, timeouts, or API errors emit structured WARN logs
- Process exits with code 0 on errors (commit proceeds)
- User is informed of failures but workflow continues
- No exceptions bubble up to break git hooks or CI pipelines

**Error Handling Pattern:**

```typescript
try {
  const result = await llmClient.analyze(diff);
  return result;
} catch (error) {
  logger.warn('analysis.failure', { error: error.message });
  return null; // Allow workflow to continue
}
```

### V. Structured Observability

All logging MUST follow a structured JSON schema for debuggability and monitoring.

**Log Schema:**

```json
{
  "timestamp": "ISO-8601",
  "level": "info|warn|error",
  "message": "Human-readable description",
  "context": {
    "git_repo": "string",
    "duration_ms": "number",
    "llm_provider": "string",
    "llm_model": "string",
    "is_significant": "boolean"
  }
}
```

**Key Events:**

- `analysis.start`, `analysis.success`, `analysis.failure`
- `generation.start`, `generation.success`, `generation.failure`
- `adr.file_created`

**Requirements:**

- All logs to `stderr` (stdout reserved for data/results)
- Logger module in `@cadr/core` with type-safe context objects
- No `console.log()` - use structured logger exclusively

### VI. Prompt Version Control

LLM prompts are code and MUST be version-controlled with clear contracts.

**Requirements:**

- All prompts in `@cadr/core/src/prompts.ts`
- Each prompt versioned (e.g., `ANALYSIS_PROMPT_V1`, `GENERATION_PROMPT_V1`)
- Expected input/output schemas documented in JSDoc
- Breaking changes require new version number
- Deprecated prompts marked but retained for reference

**Current Versions:**

- **Analysis Prompt (v1):** Returns `{"is_significant": boolean, "reason": string}`
- **Generation Prompt (v1):** Returns markdown ADR with Context, Decision, Consequences

### VII. Configuration-First

All runtime behavior MUST be configurable without code changes.

**Configuration File (`cadr.yml`):**

```yaml
provider: "openai" | "anthropic" | "google"
analysis_model: "model-name"
generation_model: "model-name"
ignore_patterns:
  - "**.md"
  - "package-lock.json"
```

**Requirements:**

- Config file validated against schema on load
- Clear error messages for invalid configuration
- Sensible defaults for optional fields
- API keys via environment variables only (never in config)

## Technology Constraints

### Required Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript with strict mode
- **Package Manager:** npm (workspaces)
- **CLI Framework:** Ink (React for terminal UIs)
- **LLM Integration:** LangChain
- **Testing:** Jest with coverage reporting
- **Linting:** ESLint + Prettier

### Dependency Philosophy

- Minimize external dependencies
- Prefer well-maintained, widely-used libraries
- No dependencies with restrictive licenses
- Regular security audits via `npm audit`

### Git Integration

- Use `adr-tools` CLI if available on system PATH
- Fallback: Create numbered markdown files in `/docs/adr/`
- Never modify git history or commit without user approval

## Development Workflow

### Feature Development

1. **Specification:** Create feature spec using `/specify` command
2. **Branch:** Work in feature branch created by Specify
3. **TDD Cycle:** Write tests → Implement → Refactor
4. **Review:** PR with all tests passing and DoD checklist completed
5. **Merge:** Squash merge to main after approval

### Definition of Done (All Stories)

- [ ] Unit tests written and passing
- [ ] Integration tests where applicable
- [ ] End-to-end tests for user-facing features
- [ ] Code coverage ≥ 80%
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compilation succeeds with no errors
- [ ] Peer-reviewed PR with approval
- [ ] Documentation updated (README, JSDoc)

### CI/CD Gates

**On Every Push/PR:**

- Lint check must pass
- All tests must pass
- Coverage threshold must be met

**On Tag Push (Release):**

- All CI checks pass
- Build succeeds for all workspaces
- Publish to npm with public access
- GitHub release notes auto-generated

## Governance

This Constitution supersedes all other development practices for the cADR project.

**Amendment Process:**

1. Propose change via GitHub Issue with rationale
2. Team discussion and approval required
3. Update this document with version bump
4. Document in ADR if architecturally significant
5. Migration plan for any breaking changes

**Compliance:**

- All PRs must be reviewed for constitutional compliance
- Complexity must be justified and documented
- Trade-offs between principles must be explicit (e.g., performance vs. simplicity)
- Use feature specifications for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2025-10-05 | **Last Amended**: 2025-10-05
