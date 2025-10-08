# Implementation Plan: Internal Plumbing - Git Integration and Structured Logging

**Branch**: `002-internal-plumbing` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-internal-plumbing/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded from /Users/rbarabash/Workspace/cADR/specs/002-internal-plumbing/spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ No NEEDS CLARIFICATION markers in spec
   → ✅ Project Type: Monorepo (TypeScript workspaces)
   → ✅ Structure Decision: Extend existing @cadr/core with new modules
3. Fill the Constitution Check section
   → ✅ Constitution loaded from existing project patterns
4. Evaluate Constitution Check section
   → ✅ No violations detected for this foundational feature
   → ✅ Progress Tracking: Initial Constitution Check PASSED
5. Execute Phase 0 → research.md
   → ✅ Technical decisions documented
6. Execute Phase 1 → contracts, quickstart.md
   → ✅ Artifacts generated
7. Re-evaluate Constitution Check
   → ✅ No new violations after design
   → ✅ Progress Tracking: Post-Design Constitution Check PASSED
8. Plan Phase 2 → Task generation approach described
9. ✅ READY for /tasks command
```

## Summary

This feature adds foundational plumbing to cADR by implementing Git integration and structured logging. The primary goal is to establish the core infrastructure that future stories will build upon, while maintaining the existing welcome message functionality.

**Technical Approach**: Extend the CLI package with built-in modules:
1. `GitModule` - Shell out to Git CLI for staged files
2. `LoggerModule` - Structured JSON logging with Pino
3. CLI integration - Preserve welcome message, add Git functionality

**Key Validation Points**: Git command execution, JSON log output, error handling, test coverage.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) / Node.js 20+  
**Primary Dependencies**: Pino for logging, child_process for Git integration  
**Storage**: N/A (no data persistence in this feature)  
**Testing**: Jest with ts-jest for TypeScript support, mocked dependencies  
**Target Platform**: Cross-platform (Windows, macOS, Linux) via Node.js 20+  
**Project Type**: Monorepo (npm workspaces) - extends existing structure  
**Performance Goals**: < 100ms for Git operations, < 1ms for logging  
**Constraints**: Must work with Git CLI, must output JSON to stderr  
**Scale/Scope**: 2 new modules, CLI integration, comprehensive testing

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Library-First Architecture
- [x] **PASS**: Feature extends CLI package with new modules
- [x] **PASS**: CLI package contains all functionality in self-contained modules
- [x] **PASS**: GitModule and LoggerModule are pure business logic

### II. Monorepo Structure
- [x] **PASS**: Using simplified CLI-only structure
- [x] **PASS**: CLI package is self-contained
- [x] **PASS**: No external dependencies between packages
- [x] **PASS**: New modules follow existing patterns

### III. Test-First Development (NON-NEGOTIABLE)
- [x] **PASS**: Plan includes comprehensive test files before implementation
- [x] **PASS**: Tests will verify Git integration, JSON logging, error handling
- [x] **PASS**: 80% coverage target maintained with mocked dependencies

### IV. Fail-Open Principle
- [x] **PASS**: Error scenarios provide helpful messages and graceful exit
- [x] **PASS**: No external API calls that could fail silently
- [x] **PASS**: Git errors are handled with clear user guidance

### V. Structured Observability
- [x] **PASS**: LoggerModule provides structured JSON logging to stderr
- [x] **PASS**: Log schema follows TECH_SPEC.md requirements
- [x] **PASS**: Context objects provide useful debugging information

### VI. Prompt Version Control
- [x] **N/A**: No LLM prompts in this feature

### VII. Configuration-First
- [x] **N/A**: No runtime configuration needed for Git integration
- [x] **NOTE**: Configuration system will be added in future stories

### Technology Constraints
- [x] **PASS**: Node.js 20+ specified
- [x] **PASS**: TypeScript with strict mode
- [x] **PASS**: Git CLI as prerequisite (documented)
- [x] **PASS**: Pino for structured logging

### CI/CD Requirements
- [x] **PASS**: Plan includes comprehensive testing strategy
- [x] **PASS**: All existing CI/CD workflows continue to work
- [x] **PASS**: New dependencies are properly managed

**Constitution Compliance**: ✅ **PASSED** (Initial Check)

## Project Structure

### Documentation (this feature)
```
specs/002-internal-plumbing/
├── spec.md              # Feature specification
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── git-module.md    # GitModule interface contract
│   └── logger-module.md # LoggerModule interface contract
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (simplified structure)

```
cADR/
├── packages/
│   └── cli/
│       ├── src/
│       │   ├── index.ts         # MODIFIED: Integrate Git + Logger
│       │   ├── git.ts           # NEW: GitModule implementation
│       │   └── logger.ts        # NEW: LoggerModule implementation
│       └── package.json         # Add pino dependency
│
├── tests/
│   ├── unit/
│   │   └── cli/
│   │       ├── git.test.ts      # NEW: GitModule unit tests
│   │       └── logger.test.ts   # NEW: LoggerModule unit tests
│   └── integration/
│       └── git-integration.test.ts # NEW: End-to-end integration tests
│
└── README.md                    # MODIFIED: Add Git prerequisite
```

**Structure Decision**: Use simplified CLI-only structure with built-in modules. Maintain separation of concerns with dedicated modules for Git and logging functionality within the CLI package.

## Phase 0: Outline & Research

### Research Tasks

#### 1. Git Integration Strategy
**Decision**: Shell out to `git diff --cached --name-only` using `child_process.exec`  
**Rationale**: 
- Git CLI is universally available and well-tested
- No additional dependencies required
- Simple error handling with exit codes
- Standard approach for Git tooling

**Error Handling**:
- Exit code 128: Not a git repository
- Exit code 127: Git command not found  
- Exit code 1: Other Git errors (permissions, corruption)

#### 2. Structured Logging Library
**Decision**: Use `pino` for structured JSON logging  
**Rationale**:
- Fastest Node.js logger (5x faster than winston)
- Minimal dependencies
- Built-in JSON formatting
- Easy to configure for stderr output

**Configuration**:
```typescript
const pino = require('pino');
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino/file',
    options: { destination: 2 } // stderr
  }
});
```

#### 3. Module Architecture
**Decision**: Create separate modules for Git and Logging concerns  
**Rationale**:
- Single Responsibility Principle
- Easy to test in isolation
- Reusable across different entry points
- Clear separation of concerns

#### 4. Testing Strategy
**Decision**: Mock `child_process.exec` for GitModule tests  
**Rationale**:
- Isolate unit tests from system dependencies
- Control error scenarios precisely
- Fast test execution
- Reliable test results

**Output**: research.md (this section) - Complete ✅

## Phase 1: Design & Contracts

### Data Model
**Status**: N/A for this feature  
**Rationale**: No data entities, state management, or persistence. This is a stateless operation that reads Git state and outputs logs.

### API Contracts
**Status**: Module interfaces defined  
**Contracts Created**:
- `contracts/git-module.md` - GitModule interface and error handling
- `contracts/logger-module.md` - LoggerModule interface and JSON schema

### Integration Test Scenarios

Based on acceptance scenarios from spec, the following integration tests will be created:

**Test File**: `tests/integration/git-integration.test.ts`

#### Scenario 1: Normal operation with staged files
```typescript
describe('Git Integration', () => {
  test('logs staged files as JSON to stderr', async () => {
    // Mock git command to return staged files
    // Run CLI
    // Verify JSON output to stderr
    // Verify welcome message to stdout
  });
});
```

#### Scenario 2: No staged files
```typescript
test('handles empty staged files gracefully', async () => {
  // Mock git command to return empty result
  // Run CLI
  // Verify empty array in JSON log
});
```

#### Scenario 3: Error scenarios
```typescript
test('handles not in git repository error', async () => {
  // Mock git command to return exit code 128
  // Run CLI
  // Verify error message and exit code 1
});
```

### Quickstart Test

The quickstart provides end-to-end validation that the Git integration and logging work correctly.

**File**: `quickstart.md` - Created above

**Constitution Compliance**: ✅ **PASSED** (Post-Design Check)

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

### Task Generation Strategy

The /tasks command will load `tasks-template.md` and generate tasks based on this plan's artifacts.

**Task Categories**:
1. **Setup Tasks**: Add dependencies, update package.json
2. **Test Tasks [P]**: Create failing tests per TDD principle
3. **Implementation Tasks**: Write code to pass tests
4. **Integration Tasks**: Update CLI to use new modules
5. **Documentation Tasks**: Update README with Git prerequisite

**Ordering Strategy**:
1. Setup (add pino dependency) - foundation
2. Tests (write failing tests first) - TDD requirement
3. Implementation (make tests pass) - GitModule and LoggerModule
4. Integration (update CLI) - connect modules
5. Documentation (update README) - user guidance

**Parallel Execution Markers [P]**:
- Test file creation can be parallel (independent)
- GitModule and LoggerModule tests can be parallel
- Documentation updates can be parallel

**Estimated Output**: ~12-15 numbered tasks in tasks.md

### Expected Tasks Breakdown

1. **Setup Tasks (2)**:
   - Add pino dependency to @cadr/core
   - Update README with Git prerequisite

2. **Test Tasks (3) [P]**:
   - Write unit test for GitModule
   - Write unit test for LoggerModule
   - Write integration test for full flow

3. **Implementation Tasks (3)**:
   - Implement GitModule with error handling
   - Implement LoggerModule with Pino
   - Update core index.ts to export new modules

4. **Integration Tasks (1)**:
   - Update CLI to use Git + Logger modules

5. **Validation Tasks (1)**:
   - Run quickstart validation

**IMPORTANT**: This phase will be executed by the /tasks command, NOT by /plan

## Complexity Tracking

**Status**: ✅ No constitutional violations

This feature extends existing patterns with well-established technologies. All decisions follow constitutional principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |

## Progress Tracking

### Phase Status
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

### Gate Status
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (none existed)
- [x] Complexity deviations documented (none exist)

---

## Next Steps

1. **Run `/tasks` command** to generate tasks.md with detailed, ordered implementation tasks
2. **Execute tasks** following TDD workflow (tests first, then implementation)
3. **Validate with quickstart.md** to ensure end-to-end functionality
4. **Submit PR** with all Definition of Done criteria met

---

*Based on existing project patterns and Constitution principles*
