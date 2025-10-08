# Implementation Plan: LLM-Powered Analysis

**Branch**: `003-llm-powered-analysis` | **Date**: 2025-10-08 | **Spec**: `/specs/003-llm-powered-analysis/spec.md`
**Input**: Feature specification from `/specs/003-llm-powered-analysis/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Enable intelligent analysis of staged Git changes using LLM to determine architectural significance, with fail-open error handling and interactive configuration setup.

**Technical Approach**: Implement LLM integration in `@cadr/core` with OpenAI SDK, YAML configuration management, and CLI interface with `--analyze` flag. Follow library-first architecture with comprehensive test coverage.

## Technical Context

**Language/Version**: TypeScript 5.0+ with Node.js 20+  
**Primary Dependencies**: OpenAI SDK, js-yaml, commander.js, pino logger  
**Storage**: YAML configuration files, no persistent storage required  
**Testing**: Jest with mocking for OpenAI API calls  
**Target Platform**: Node.js CLI tool, cross-platform  
**Project Type**: single (CLI tool with library architecture)  
**Performance Goals**: <15s timeout for LLM analysis, <2s for config operations  
**Constraints**: Fail-open principle (always exit 0), no retries on API failures  
**Scale/Scope**: Individual developer tool, single repository analysis

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Library-First Architecture ✅
- **Requirement**: All business logic in `@cadr/core` as pure TypeScript library
- **Compliance**: LLM analysis logic will be implemented in `@cadr/core/src/llm.ts` and `@cadr/core/src/analysis.ts`
- **Validation**: Core modules will be independently testable with no CLI dependencies

### II. Monorepo Structure ✅
- **Requirement**: Clear separation between core, cli, and agent-tools packages
- **Compliance**: LLM integration in core, CLI interface in cli package
- **Validation**: Core cannot depend on cli, CLI imports from core only

### III. Test-First Development ✅
- **Requirement**: TDD mandatory, no implementation without tests
- **Compliance**: All LLM modules will have comprehensive unit tests with mocked OpenAI API
- **Validation**: Minimum 80% code coverage, proper mocking for external services

### IV. Fail-Open Principle ✅
- **Requirement**: Never block developer workflow, always exit 0
- **Compliance**: All LLM API calls wrapped in try-catch with WARN logs
- **Validation**: Timeout handling (15s default), graceful error messages

### V. Structured Observability ✅
- **Requirement**: JSON structured logging with specific schema
- **Compliance**: Use pino logger with analysis.start/success/failure events
- **Validation**: All logs to stderr, no console.log usage

### VI. Prompt Version Control ✅
- **Requirement**: Versioned prompts in `@cadr/core/src/prompts.ts`
- **Compliance**: ANALYSIS_PROMPT_V1 with documented input/output schemas
- **Validation**: Clear contracts for LLM request/response format

### VII. Configuration-First ✅
- **Requirement**: All behavior configurable via `cadr.yaml`
- **Compliance**: Interactive `cadr init` command, environment variable handling
- **Validation**: Config validation on load, clear error messages

**Status**: ✅ PASS - All constitutional requirements satisfied

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
packages/
├── core/                    # @cadr/core - Pure business logic
│   ├── src/
│   │   ├── llm.ts          # OpenAI client and analysis logic
│   │   ├── analysis.ts     # Analysis orchestration
│   │   ├── prompts.ts      # Versioned LLM prompts
│   │   ├── config.ts       # YAML configuration handling
│   │   ├── git.ts          # Git operations (existing)
│   │   └── logger.ts       # Structured logging (existing)
│   ├── tests/
│   │   ├── unit/           # Unit tests with mocked dependencies
│   │   └── integration/    # Module interaction tests
│   └── package.json
├── cli/                     # cadr-cli - CLI interface
│   ├── src/
│   │   ├── commands/
│   │   │   ├── init.ts     # cadr init command
│   │   │   └── analyze.ts  # cadr --analyze command
│   │   └── index.ts        # CLI entry point
│   ├── tests/
│   │   └── e2e/            # End-to-end CLI tests
│   └── package.json
└── agent-tools/            # cadr-agent-tools (future)
    └── package.json

tests/
├── unit/                    # Cross-package unit tests
├── integration/            # Cross-package integration tests
└── e2e/                   # Full workflow tests
```

**Structure Decision**: Monorepo with library-first architecture. LLM analysis logic implemented in `@cadr/core` as pure TypeScript library, CLI interface in `cadr-cli` package. Clear separation ensures core can be reused across CLI, GitHub Agent, and future integrations.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
