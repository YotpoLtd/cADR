# Implementation Plan: ADR Generation

**Branch**: `004-adr-generation` | **Date**: 2025-10-21 | **Spec**: `/specs/004-adr-generation/spec.md`
**Input**: Feature specification from `/specs/004-adr-generation/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → ✅ Spec loaded: Automated ADR generation with MADR format
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type: CLI tool (existing)
   → Set Structure Decision: Extend existing monorepo structure
3. Fill the Constitution Check section
   → Evaluate constitutional compliance
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → Research MADR template format, file management patterns
6. Execute Phase 1 → contracts, data-model.md, quickstart.md
7. Re-evaluate Constitution Check section
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Enable automatic generation of MADR-formatted ADR files when architecturally significant changes are detected, with user confirmation prompts and fail-open error handling.

**Technical Approach**: Extend existing LLM module with generation function, create new ADR file management module, add user prompt functionality, and integrate into analysis workflow. Use same configuration and model as analysis phase.

## Technical Context

**Language/Version**: TypeScript 5.0+ with Node.js 20+ (existing)  
**Primary Dependencies**: Existing (OpenAI SDK, js-yaml, readline), New (none - using built-in Node.js fs/path)  
**Storage**: File system (docs/adr/ directory for ADR markdown files)  
**Testing**: Jest with mocked LLM responses and file system operations  
**Target Platform**: Node.js CLI tool, cross-platform  
**Project Type**: single (CLI tool with library architecture - existing)  
**Performance Goals**: <20s for generation including LLM call, <1s for file operations  
**Constraints**: MADR template format, fail-open principle, user confirmation required  
**Scale/Scope**: Individual developer tool, generates one ADR per invocation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Library-First Architecture ✅
- **Requirement**: All business logic in `@cadr/core` as pure TypeScript library
- **Compliance**: ADR generation logic in `packages/cli/src/adr.ts`, LLM generation in `llm.ts`, prompts in `prompts.ts`
- **Validation**: Modules are independently testable, no CLI-specific dependencies in core logic

### II. Monorepo Structure ✅
- **Requirement**: Clear separation between core, cli, and agent-tools packages
- **Compliance**: All new modules in cli/src, follows existing structure
- **Validation**: Core business logic remains in cli package (architectural decision for MVP)

### III. Test-First Development ✅
- **Requirement**: TDD mandatory, no implementation without tests
- **Compliance**: All new modules (adr.ts, generation in llm.ts, prompts) will have unit tests first
- **Validation**: Minimum 80% code coverage, comprehensive mocking for file system and LLM

### IV. Fail-Open Principle ✅
- **Requirement**: Never block developer workflow, always exit 0
- **Compliance**: All LLM generation calls wrapped in try-catch, file errors handled gracefully
- **Validation**: Error scenarios display helpful messages and exit cleanly

### V. Structured Observability ✅
- **Requirement**: JSON structured logging with specific schema
- **Compliance**: Use existing logger for generation.start/success/failure events
- **Validation**: All logs to stderr with consistent schema

### VI. Prompt Version Control ✅
- **Requirement**: Versioned prompts in `prompts.ts`
- **Compliance**: GENERATION_PROMPT_V1 with documented MADR template structure
- **Validation**: Clear contract for LLM input/output format

### VII. Configuration-First ✅
- **Requirement**: All behavior configurable via `cadr.yaml`
- **Compliance**: Uses existing analysis_model from config, no new config needed
- **Validation**: Same configuration used for both analysis and generation

**Status**: ✅ PASS - All constitutional requirements satisfied

## Project Structure

### Documentation (this feature)

```
specs/004-adr-generation/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
packages/cli/src/
├── adr.ts               # NEW: ADR file management
│   ├── titleToSlug()
│   ├── getNextADRNumber()
│   ├── ensureADRDirectory()
│   ├── generateADRFilename()
│   └── saveADR()
├── adr.test.ts          # NEW: Unit tests for ADR module
├── llm.ts               # EXTEND: Add generation functions
│   ├── generateADRContent()      # NEW
│   ├── GenerationRequest         # NEW interface
│   ├── GenerationResult          # NEW interface
│   └── GenerationResponse        # NEW interface
├── llm.test.ts          # EXTEND: Add generation tests
├── prompts.ts           # EXTEND: Add generation prompt
│   ├── GENERATION_PROMPT_V1      # NEW constant
│   ├── formatGenerationPrompt()  # NEW function
│   └── promptForGeneration()     # NEW function
├── prompts.test.ts      # EXTEND: Add generation prompt tests
├── analysis.ts          # EXTEND: Integrate generation flow
└── analysis.test.ts     # EXTEND: Test generation integration
```

**Structure Decision**: Extends existing CLI package structure. ADR file management is a new module (adr.ts), generation extends existing LLM module, user prompts extend prompts module. Minimal changes to existing architecture while adding substantial new capability.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - MADR template format specification
   - Best practices for CLI user prompts (ENTER/yes pattern)
   - File system slug generation algorithms
   - Sequential numbering strategies for markdown files

2. **Generate and dispatch research agents**:

   ```
   Task: "Research MADR template format and required sections"
   Task: "Find best practices for CLI confirmation prompts"
   Task: "Research filename slug generation patterns"
   Task: "Find patterns for sequential file numbering"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with MADR format spec and implementation patterns

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - GenerationPrompt (template structure)
   - GenerationRequest (input data)
   - GenerationResult (LLM output)
   - ADRFile (file metadata)
   - Validation rules from requirements

2. **Generate API contracts** from functional requirements:
   - generateADRContent() contract
   - saveADR() contract
   - promptForGeneration() contract
   - Output TypeScript interfaces to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per new module (adr, generation)
   - Assert input/output schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - User confirms → ADR generated
   - User declines → graceful exit
   - Generation fails → helpful error
   - File exists → increment number
   - Quickstart test = full flow validation

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load task template
- Generate tasks from Phase 1 design docs
- Each contract → contract test task [P]
- Each module → implementation task
- Integration → analysis.ts update task
- User experience → prompts and display tasks

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: 
  1. Prompts (generation prompt template)
  2. ADR file management
  3. LLM generation function
  4. User confirmation prompt
  5. Analysis integration
- Mark [P] for parallel execution (different files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, verify MADR format)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

No violations - all constitutional requirements satisfied with existing architecture.

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---

_Plan created following Specify methodology - Ready for Phase 0 (Research)_

