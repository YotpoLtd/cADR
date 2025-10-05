# Implementation Plan: Hello World - Deployable NPM Package

**Branch**: `001-hello-world-a` | **Date**: 2025-10-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-hello-world-a/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded from /Users/rbarabash/Workspace/cADR/specs/001-hello-world-a/spec.md
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ No NEEDS CLARIFICATION markers in spec
   → ✅ Project Type: Monorepo (TypeScript workspaces)
   → ✅ Structure Decision: Monorepo with packages/core, packages/cli structure
3. Fill the Constitution Check section
   → ✅ Constitution loaded from .specify/memory/constitution.md
4. Evaluate Constitution Check section
   → ✅ No violations detected for this minimal feature
   → ✅ Progress Tracking: Initial Constitution Check PASSED
5. Execute Phase 0 → research.md
   → ✅ Technical decisions documented
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent file
   → ✅ Artifacts generated
7. Re-evaluate Constitution Check
   → ✅ No new violations after design
   → ✅ Progress Tracking: Post-Design Constitution Check PASSED
8. Plan Phase 2 → Task generation approach described
9. ✅ READY for /tasks command
```

## Summary

This feature creates a minimal, deployable NPM package (`cadr-cli`) that displays a welcome message when executed. The primary goal is to validate the complete CI/CD pipeline, NPM publication process, and package installation workflow before building actual ADR functionality.

**Technical Approach**: Create a TypeScript monorepo using npm workspaces with two initial packages:
1. `@cadr/core` - Empty library package (placeholder for future business logic)
2. `cadr-cli` - Executable CLI that imports from core and displays welcome message

**Key Validation Points**: NPM publication automation, executable configuration, cross-platform compatibility, version management.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) / Node.js 20+  
**Primary Dependencies**: None for v0.0.1 (pure Node.js, no frameworks yet)  
**Storage**: N/A (no data persistence in this feature)  
**Testing**: Jest with ts-jest for TypeScript support  
**Target Platform**: Cross-platform (Windows, macOS, Linux) via Node.js 20+  
**Project Type**: Monorepo (npm workspaces) - determines source structure  
**Performance Goals**: < 2 seconds to display welcome message on standard hardware  
**Constraints**: Must work via npx without prior installation, exit cleanly with code 0  
**Scale/Scope**: Single executable, 2 packages, < 100 lines of code total

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Library-First Architecture
- [x] **PASS**: Feature creates `@cadr/core` package first (even though minimal)
- [x] **PASS**: CLI package (`cadr-cli`) imports from core, not vice versa
- [x] **PASS**: No framework dependencies in core for this iteration

### II. Monorepo Structure
- [x] **PASS**: Using npm workspaces with packages/ directory
- [x] **PASS**: Each package has own package.json
- [x] **PASS**: Shared tsconfig.json at root
- [x] **PASS**: Core package independent of cli package

### III. Test-First Development (NON-NEGOTIABLE)
- [x] **PASS**: Plan includes test files before implementation
- [x] **PASS**: Tests will verify exit code, message output, executable invocation
- [x] **PASS**: 80% coverage target maintained

### IV. Fail-Open Principle
- [x] **PASS**: No external API calls in this feature
- [x] **PASS**: Simple display logic cannot fail in blocking way

### V. Structured Observability
- [x] **DEFERRED**: No logging needed for simple welcome message
- [ ] **NOTE**: Will implement logger module in future stories

### VI. Prompt Version Control
- [x] **N/A**: No LLM prompts in this feature

### VII. Configuration-First
- [x] **N/A**: No runtime configuration needed for welcome message
- [ ] **NOTE**: Config system will be added in Story #2+

### Technology Constraints
- [x] **PASS**: Node.js 20+ specified
- [x] **PASS**: TypeScript with strict mode
- [x] **PASS**: npm workspaces for package management
- [x] **PASS**: Jest for testing

### CI/CD Requirements
- [x] **PASS**: Plan includes GitHub Actions workflow for testing
- [x] **PASS**: Plan includes release workflow for NPM publication
- [x] **PASS**: Linting and coverage gates included

**Constitution Compliance**: ✅ **PASSED** (Initial Check)

## Project Structure

### Documentation (this feature)
```
specs/001-hello-world-a/
├── spec.md              # Feature specification
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command) - N/A for this feature
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command) - Empty for this feature
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
cADR/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   └── index.ts         # Empty export for now
│   │   ├── package.json         # @cadr/core package config
│   │   └── tsconfig.json        # Package-specific TS config
│   │
│   └── cli/
│       ├── src/
│       │   ├── index.ts         # CLI entry point, displays message
│       │   └── version.ts       # Version constant
│       ├── bin/
│       │   └── cadr.js          # Shebang executable wrapper
│       ├── package.json         # cadr-cli package config (with bin entry)
│       └── tsconfig.json        # Package-specific TS config
│
├── .github/
│   └── workflows/
│       ├── test.yml             # CI workflow (lint, test, coverage)
│       └── release.yml          # CD workflow (publish on tag)
│
├── package.json                 # Root workspace config
├── tsconfig.json                # Shared TypeScript config
├── jest.config.js               # Root Jest configuration
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc                  # Prettier configuration
└── README.md                    # Project documentation

tests/
├── integration/
│   └── cli-execution.test.ts    # Test npx/direct execution
└── unit/
    └── cli/
        └── index.test.ts        # Test message output
```

**Structure Decision**: Monorepo structure chosen to establish foundation for future packages (agent-tools) and enforce library-first architecture from the start. Even though this feature is minimal, we establish the proper separation that future stories will build upon.

## Phase 0: Outline & Research

### Research Tasks

Since this is a foundational "Hello World" feature with well-established technologies, research focuses on best practices and tooling decisions.

#### 1. TypeScript Monorepo Setup
**Decision**: Use npm workspaces (built into npm 7+)  
**Rationale**: 
- Native to npm, no additional tooling needed
- Simple workspace protocol for inter-package dependencies
- Aligns with Constitution requirement for minimal dependencies

**Alternatives Considered**:
- Lerna: Overkill for this project size, adds unnecessary dependency
- Yarn workspaces: Team standardized on npm
- Rush: Too enterprise-focused for open-source CLI tool

**Best Practices**:
- Root package.json with `"workspaces": ["packages/*"]`
- Each package has independent versioning in package.json
- Use `workspace:*` protocol for internal dependencies

#### 2. CLI Executable Configuration
**Decision**: Use `bin` field in package.json with Node.js shebang wrapper  
**Rationale**:
- Standard npm approach for creating executables
- Works cross-platform (npm creates .cmd wrapper on Windows)
- Enables both `npx` and global install scenarios

**Implementation Pattern**:
```json
// packages/cli/package.json
{
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

#### 3. TypeScript Build Strategy
**Decision**: Use `tsc` with project references for monorepo  
**Rationale**:
- No bundler needed for Node.js target
- Project references ensure correct build order
- Faster incremental builds in development

**Configuration**:
- Root tsconfig.json with `references` to packages
- Each package emits to own `dist/` directory
- Build script: `tsc --build`

**Alternatives Considered**:
- esbuild: Unnecessary complexity for this stage
- Webpack: Too heavy for simple CLI
- ts-node: Not suitable for production distribution

#### 4. Testing Strategy for NPM Publication
**Decision**: Use npm pack + local install in CI, dry-run for validation  
**Rationale**:
- `npm pack` creates actual .tgz that would be published
- Can test installation from tarball without publishing
- `npm publish --dry-run` validates package.json and content

**CI Test Approach**:
```bash
# In CI pipeline
npm run build
npm pack --workspace=cadr-cli
npm install -g ./cadr-cli-0.0.1.tgz
cadr  # Should display welcome message
```

#### 5. GitHub Actions Release Automation
**Decision**: Use tag-triggered workflow with npm provenance  
**Rationale**:
- Provenance provides supply chain security
- Tag pattern (`v*`) is standard for semantic versioning
- Automated releases reduce human error

**Workflow Trigger**:
```yaml
on:
  push:
    tags:
      - 'v*.*.*'
```

#### 6. Version Management
**Decision**: Manual version bumps in package.json for v0.0.1  
**Rationale**:
- First release, no need for automation yet
- Establish versioning pattern before adding tooling
- Future consideration: standard-version or semantic-release

**Version Strategy**:
- 0.0.1: This feature (Hello World)
- 0.1.0: First feature with actual functionality
- 1.0.0: Production-ready with all MVP stories

### Research Output Summary

All technical decisions are established with no ambiguities. The technology stack is well-known and documented. No external research or web searches required for this foundational feature.

**Output**: research.md (this section) - Complete ✅

## Phase 1: Design & Contracts

### Data Model
**Status**: N/A for this feature  
**Rationale**: No data entities, state management, or persistence in a welcome message display. Data model documentation will begin in Story #2 when git interaction is introduced.

**File**: `data-model.md` - Not created (not applicable)

### API Contracts
**Status**: N/A for this feature  
**Rationale**: No API endpoints, no HTTP/RPC interfaces, no external contracts. This is a standalone CLI executable.

**Future Consideration**: Story #3 will introduce LLM API contracts (analysis and generation).

**Directory**: `contracts/` - Created but empty

### Contract Tests
**Status**: N/A (no contracts)  
**Tests Created Instead**: Integration tests for CLI behavior (see Quickstart section)

### Integration Test Scenarios

Based on acceptance scenarios from spec, the following integration tests will be created:

**Test File**: `tests/integration/cli-execution.test.ts`

#### Scenario 1: Execute via npx simulation
```typescript
describe('CLI Execution', () => {
  test('displays welcome message when executed', async () => {
    const { stdout, exitCode } = await execCommand('node packages/cli/bin/cadr.js');
    expect(stdout).toContain('Hello, cADR!');
    expect(stdout).toContain('0.0.1');
    expect(exitCode).toBe(0);
  });
});
```

#### Scenario 2: Message format validation
```typescript
test('welcome message includes required elements', async () => {
  const { stdout } = await execCommand('node packages/cli/bin/cadr.js');
  expect(stdout).toMatch(/cADR/i);
  expect(stdout).toContain('0.0.1');
  expect(stdout).toMatch(/architectural decision record/i);
});
```

#### Scenario 3: Performance constraint
```typescript
test('displays message within 2 seconds', async () => {
  const start = Date.now();
  await execCommand('node packages/cli/bin/cadr.js');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(2000);
});
```

#### Scenario 4: Exit code validation
```typescript
test('exits with code 0 on success', async () => {
  const { exitCode } = await execCommand('node packages/cli/bin/cadr.js');
  expect(exitCode).toBe(0);
});
```

### Quickstart Test

The quickstart provides end-to-end validation that a developer can install and use the package.

**File**: `quickstart.md` - Created below

### Agent Context Update

Will run update-agent-context.sh to create/update the CLAUDE.md or appropriate agent file with:
- Current phase: Story #1 implementation
- Tech stack: TypeScript, npm workspaces, Jest
- Recent changes: Initial monorepo setup
- Key files: packages/cli/src/index.ts, package.json

**Status**: Will execute after plan completion

**Constitution Compliance**: ✅ **PASSED** (Post-Design Check)

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

### Task Generation Strategy

The /tasks command will load `tasks-template.md` and generate tasks based on this plan's artifacts.

**Task Categories**:
1. **Setup Tasks**: Initialize monorepo structure, configure tooling
2. **Test Tasks [P]**: Create failing tests per TDD principle
3. **Implementation Tasks**: Write code to pass tests
4. **CI/CD Tasks [P]**: Configure GitHub Actions workflows
5. **Documentation Tasks**: Update README with installation instructions

**Ordering Strategy**:
1. Setup (monorepo, tsconfig, jest config) - foundation
2. Tests (write failing tests first) - TDD requirement
3. Implementation (make tests pass) - minimal code
4. CI/CD (workflows for test and release) - automation
5. Documentation (README, package.json metadata) - discoverability

**Parallel Execution Markers [P]**:
- Test file creation can be parallel (independent)
- CI workflow files can be parallel (independent)
- Package.json files can be created in parallel

**Estimated Output**: ~15-18 numbered tasks in tasks.md

### Expected Tasks Breakdown

1. **Setup Tasks (5)**:
   - Initialize root package.json with workspaces
   - Create shared tsconfig.json
   - Configure Jest with ts-jest
   - Configure ESLint and Prettier
   - Create initial README.md

2. **Test Tasks (4) [P]**:
   - Write unit test for CLI message output
   - Write integration test for executable invocation
   - Write test for version display
   - Write test for exit code validation

3. **Implementation Tasks (5)**:
   - Create @cadr/core package structure
   - Create cadr-cli package structure
   - Implement CLI entry point (src/index.ts)
   - Implement executable wrapper (bin/cadr.js)
   - Build and verify local execution

4. **CI/CD Tasks (2) [P]**:
   - Create test.yml workflow
   - Create release.yml workflow

5. **Documentation Tasks (2)**:
   - Update README with installation instructions
   - Update package.json with metadata (description, repository, keywords)

**IMPORTANT**: This phase will be executed by the /tasks command, NOT by /plan

## Complexity Tracking

**Status**: ✅ No constitutional violations

This feature is intentionally minimal and fully compliant with all constitutional principles. No complexity justifications needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |

## Progress Tracking

### Phase Status
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete
- [x] Phase 5: Validation passed

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

*Based on Constitution v1.0.0 - See `cADR/.specify/memory/constitution.md`*

