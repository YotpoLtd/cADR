# Implementation Plan: Interactive Prompt with Ink

**Branch**: `004-interactive-prompt-ink` | **Date**: 2025-01-09 | **Spec**: `/specs/004-interactive-prompt-ink/spec.md`
**Input**: Feature specification from `/specs/004-interactive-prompt-ink/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → ✅ Loaded: specs/004-interactive-prompt-ink/spec.md
2. Fill Technical Context
   → ✅ User confirmed: Ink + React, dark theme, keyboard navigation, TTY detection
3. Fill the Constitution Check section
   → ✅ Library-first architecture maintained, fail-open principle upheld
4. Evaluate Constitution Check section
   → ✅ All constitutional requirements satisfied
5. Execute Phase 0 → research.md
   → ✅ Research Ink best practices, TTY detection patterns, keyboard navigation standards
6. Execute Phase 1 → contracts, data-model.md, quickstart.md
   → ✅ Define prompt component contracts, state model, integration points
7. Re-evaluate Constitution Check section
   → ✅ No violations, design follows existing patterns
8. Plan Phase 2 → Describe task generation approach
   → ✅ TDD approach with unit and integration tests
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Add an interactive Ink-based UI prompt that appears after `cadr analyze` detects architecturally significant changes, allowing users to confirm whether they want to create an ADR. Must feature dark theme, intuitive keyboard navigation, and graceful non-TTY fallback for CI environments.

**Technical Approach**: Implement React/Ink components in `packages/cli/src/ui/` with TTY detection logic, keyboard event handling via `useInput` hook, and clean integration point in the existing `analysis.ts` workflow. Follow fail-open principle with text-based fallback for non-interactive environments.

## Technical Context

**Language/Version**: TypeScript 5.0+ with Node.js 20+, JSX/TSX support required  
**Primary Dependencies**: 
- `ink@^5.0.1` - React renderer for CLIs
- `react@^18.3.1` - React library (peer dependency)
- `ink-spinner@^5.0.0` (optional) - For future loading states
- **Existing**: openai, js-yaml, commander.js, pino logger  

**Storage**: No new storage requirements  
**Testing**: Jest with `ink-testing-library` for component testing, pseudo-TTY for integration tests  
**Target Platform**: Node.js CLI tool, cross-platform (macOS, Linux, Windows)  
**Project Type**: single (CLI tool with library architecture)  
**Performance Goals**: 
- Prompt render time: < 100ms from decision to display
- Keyboard input latency: < 50ms from keypress to visual update
- No blocking in CI (instant fallback to text output)

**Constraints**: 
- TTY detection via `process.stdout.isTTY`
- CI detection via `process.env.CI`
- Must not break existing non-interactive behavior
- Ink components only for TTY contexts
- Fail-open principle maintained

**Scale/Scope**: Individual developer tool, single-session interaction

**User-Confirmed Details**:
- Dark theme with cyan/green highlights for selections
- Best-practice keyboard navigation (arrows, Enter, y/n/Esc/q)
- All necessary Ink/React dependencies approved
- TTY-aware design (interactive when possible, text fallback otherwise)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Library-First Architecture ✅
- **Requirement**: All business logic in pure TypeScript, UI components separate
- **Compliance**: Prompt UI logic in `packages/cli/src/ui/AnalysisPrompt.tsx`, integration in `analysis.ts`
- **Validation**: Component is independent, testable with ink-testing-library

### II. Monorepo Structure ✅
- **Requirement**: Clear separation between core and CLI packages
- **Compliance**: UI components live in CLI package (user-facing), core analysis logic unchanged
- **Validation**: No new core dependencies, Ink only in CLI package

### III. Test-First Development ✅
- **Requirement**: TDD mandatory, no implementation without tests
- **Compliance**: Unit tests for prompt component logic, integration tests for TTY/non-TTY scenarios
- **Validation**: Test keyboard input handling, TTY detection, clean unmounting

### IV. Fail-Open Principle ✅
- **Requirement**: Never block developer workflow, always exit 0
- **Compliance**: Non-TTY fallback prints text summary, no blocking prompts in CI
- **Validation**: Graceful Ink render failures fall back to text output

### V. Structured Observability ✅
- **Requirement**: JSON structured logging with specific schema
- **Compliance**: Use existing pino logger for prompt lifecycle events
- **Validation**: Log prompt.shown, prompt.selected, prompt.fallback events to stderr

### VI. Prompt Version Control ✅
- **Requirement**: Versioned prompts
- **Compliance**: Ink prompt UI is versioned via component structure, existing ANALYSIS_PROMPT_V1 unchanged
- **Validation**: Clear separation between LLM prompts and UI prompts

### VII. Configuration-First ✅
- **Requirement**: All behavior configurable
- **Compliance**: Existing config sufficient; no new config needed for UI
- **Validation**: TTY detection is environment-based (not configurable by design)

**Status**: ✅ PASS - All constitutional requirements satisfied

## Project Structure

### Documentation (this feature)

```
specs/004-interactive-prompt-ink/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output  
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── AnalysisPrompt.contract.ts  # Prompt component interface
│   └── TTYDetection.contract.ts    # TTY detection interface
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
packages/
├── cli/                     # cadr-cli - CLI interface
│   ├── src/
│   │   ├── ui/              # NEW: Ink UI components
│   │   │   ├── AnalysisPrompt.tsx    # Main prompt component
│   │   │   └── AnalysisPrompt.test.tsx  # Component unit tests
│   │   ├── commands/
│   │   │   ├── init.ts      # Existing - unchanged
│   │   │   └── analyze.ts   # Modified - wire up prompt
│   │   ├── analysis.ts      # Modified - integrate Ink prompt when is_significant=true
│   │   ├── git.ts           # Existing - unchanged
│   │   ├── llm.ts           # Existing - unchanged
│   │   ├── logger.ts        # Modified - add prompt lifecycle events
│   │   ├── config.ts        # Existing - unchanged
│   │   └── index.ts         # Existing - unchanged
│   ├── tests/
│   │   └── e2e/
│   │       ├── prompt-tty.test.ts       # NEW: TTY integration test
│   │       └── prompt-non-tty.test.ts   # NEW: Non-TTY fallback test
│   ├── package.json         # Modified - add Ink + React dependencies
│   └── tsconfig.json        # Modified - enable JSX/TSX compilation
└── (core and agent-tools unchanged)

tests/integration/           # Cross-package integration tests
├── happy-flows.test.ts      # Modified - add prompt interaction tests
└── llm-integration.test.ts  # Existing - potentially add non-TTY test case
```

**Structure Decision**: UI components live in CLI package only. Ink is a CLI-specific rendering library and should not leak into core. TypeScript config updated to support TSX compilation with React JSX transform.

## Phase 0: Outline & Research

### Research Tasks

1. **Ink Best Practices**
   - Decision: Use Ink 5.x with React 18 JSX transform
   - Rationale: Latest stable versions, automatic JSX runtime (no React imports needed)
   - Alternatives considered: Ink 4.x (outdated), ink-select-input (unnecessary complexity)
   - Key findings:
     - `useInput` hook for keyboard handling
     - `render()` and `unmount()` for lifecycle management
     - `Box` and `Text` components for layout
     - Flexbox-based layout system (similar to CSS)
     - Automatic color support detection

2. **Keyboard Navigation Standards**
   - Decision: Support both menu navigation (arrows) and direct shortcuts (y/n)
   - Rationale: Accessibility and efficiency - advanced users want shortcuts, newcomers want visual selection
   - Patterns:
     - Arrows (←/→) switch selection
     - Enter confirms selected option
     - Single-key shortcuts (y/n/q/Esc) for instant action
     - Default selection on "Skip" (safe default)
   - Reference: Gemini CLI, GitHub Copilot CLI, ink-select-input

3. **TTY Detection**
   - Decision: `process.stdout.isTTY && !process.env.CI`
   - Rationale: Covers most cases; CI environments usually set CI=true or lack TTY
   - Alternatives considered: 
     - `isatty()` syscall (unnecessary complexity)
     - Always render Ink (would hang in CI)
   - Fallback: Clean text output matching existing non-significant result format

4. **TSX Configuration**
   - Decision: Use `"jsx": "react-jsx"` and `"jsxImportSource": "react"`
   - Rationale: Modern React 18 JSX transform, no manual React imports needed
   - Required changes:
     - Update `packages/cli/tsconfig.json` with jsx options
     - Ensure Jest handles TSX files (ts-jest already configured)
     - No changes to build scripts needed (tsc handles TSX automatically)

5. **Testing Strategy**
   - Decision: Unit tests with `ink-testing-library`, integration tests with real CLI spawning
   - Rationale: ink-testing-library provides `render()` for testing components in isolation, integration tests verify end-to-end behavior
   - Patterns:
     - Component tests: keyboard events, state transitions, rendering
     - Integration tests: actual terminal spawning, TTY vs non-TTY detection
     - Mock-free where possible (test real Ink rendering)

**Output**: research.md with all technical decisions documented

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

### 1. Data Model (`data-model.md`)

**Entities**:

#### PromptState
```typescript
{
  selection: 'create' | 'skip',  // Current selection
  isActive: boolean,              // Prompt is mounted and waiting for input
  reason: string,                 // LLM analysis reason text
}
```

**State Transitions**:
- Initial: `{ selection: 'skip', isActive: true, reason: <from LLM> }`
- Arrow key: toggle `selection` between 'create' and 'skip'
- Enter/y/n/Esc/q: set `isActive = false`, emit decision

**Validation Rules**:
- `reason` must be a string (can be empty per ANALYSIS_PROMPT_V1)
- `selection` must be one of the two valid options
- `isActive` only false after user action

#### UserDecision
```typescript
{
  createAdr: boolean,  // true = create, false = skip
  timestamp: string,   // ISO timestamp of decision
}
```

### 2. API Contracts (`/contracts/`)

#### `AnalysisPrompt.contract.ts`

```typescript
/**
 * Contract: AnalysisPrompt Component
 * 
 * Purpose: Interactive Ink UI for confirming ADR creation
 * 
 * Interface:
 */
export interface AnalysisPromptProps {
  reason: string;                          // LLM analysis reason
  onSubmit: (createAdr: boolean) => void;  // Callback when user decides
}

/**
 * Usage:
 * 
 * import { promptForAdr } from './ui/AnalysisPrompt';
 * 
 * const shouldCreate = await promptForAdr(result.reason);
 * if (shouldCreate) {
 *   // Create ADR (Story #5)
 * }
 */
export function promptForAdr(reason: string): Promise<boolean>;

/**
 * Behavior:
 * - Renders Ink UI with dark theme
 * - Default selection: "Skip"
 * - Keyboard: arrows, Enter, y/n/Esc/q
 * - Returns: Promise<boolean> resolving to user decision
 * - On unmount: cleans up terminal state
 * 
 * Error Handling:
 * - If Ink render fails: log warning, return false (skip)
 * - If user force-quits (Ctrl+C): handled by Ink's exitOnCtrlC
 */
```

#### `TTYDetection.contract.ts`

```typescript
/**
 * Contract: TTY Detection
 * 
 * Purpose: Determine if interactive UI should be shown
 */
export interface TTYEnvironment {
  isTTY: boolean;        // process.stdout.isTTY
  isCI: boolean;         // process.env.CI === 'true'
  shouldShowPrompt: boolean;  // isTTY && !isCI
}

export function detectTTY(): TTYEnvironment;

/**
 * Usage in analysis.ts:
 * 
 * const env = detectTTY();
 * if (env.shouldShowPrompt) {
 *   // Show Ink prompt
 * } else {
 *   // Print text fallback
 * }
 */
```

### 3. Component Design

**Component Structure**:

```tsx
// packages/cli/src/ui/AnalysisPrompt.tsx

import React, { useState } from 'react';
import { Box, Text, useInput, render } from 'ink';

interface PromptProps {
  reason: string;
  onSubmit: (createAdr: boolean) => void;
}

function Prompt({ reason, onSubmit }: PromptProps) {
  const [selected, setSelected] = useState<'create' | 'skip'>('skip');

  useInput((input, key) => {
    // Keyboard handling logic
  });

  return (
    <Box flexDirection="column">
      {/* Title */}
      {/* Reason text */}
      {/* Action options */}
      {/* Keyboard hints */}
    </Box>
  );
}

export function promptForAdr(reason: string): Promise<boolean> {
  // Promise wrapper for render/unmount
}
```

**Integration Point** (packages/cli/src/analysis.ts):

```typescript
// After LLM returns is_significant = true

if (result.is_significant) {
  const env = detectTTY();
  
  if (env.shouldShowPrompt) {
    const { promptForAdr } = await import('./ui/AnalysisPrompt');
    const shouldCreate = await promptForAdr(result.reason);
    
    if (shouldCreate) {
      console.log('📝 Creating ADR draft...');
      // Story #5 will implement generation
    } else {
      console.log('✅ Skipped ADR creation.\n');
    }
  } else {
    // Non-TTY fallback (existing behavior)
    console.log('📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT');
    console.log(`💭 Reasoning: ${result.reason}\n`);
    console.log('💡 Tip: Run in an interactive terminal to create an ADR from this screen.\n');
  }
}
```

### 4. Test Scenarios from User Stories

**From spec.md acceptance scenarios**:

#### Test: Interactive TTY - Significant Change
1. Set up test repo with uncommitted changes
2. Run `cadr analyze` in pseudo-TTY
3. Assert: Ink prompt renders
4. Simulate arrow key press
5. Simulate Enter key
6. Assert: Appropriate action taken

#### Test: CI/Non-TTY - Significant Change
1. Set `CI=true` or unset TTY
2. Run `cadr analyze`
3. Assert: No Ink prompt
4. Assert: Text summary printed
5. Assert: Exit code 0

#### Test: Component Keyboard Handling
1. Render `<Prompt>` with ink-testing-library
2. Simulate left/right arrow keys
3. Assert: Selection toggles
4. Simulate 'y' key
5. Assert: onSubmit called with true
6. Simulate 'n' key
7. Assert: onSubmit called with false

### 5. Quickstart (`quickstart.md`)

(Will be created in Phase 1 - describes end-to-end testing workflow)

**Output**: data-model.md, contracts/, quickstart.md with failing tests

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load Phase 1 design docs (contracts, data model, quickstart)
- Generate tasks in TDD order:
  1. Setup tasks (dependencies, tsconfig)
  2. Contract test tasks (TTY detection, component interface)
  3. Component implementation tasks (React/Ink UI)
  4. Integration tasks (wire into analysis.ts)
  5. Test tasks (unit, integration, e2e)
  6. Documentation tasks (README update)

**Task Categories**:

1. **Setup** [P]:
   - Add Ink + React dependencies to package.json
   - Update tsconfig.json for JSX support
   - Verify Jest handles TSX files

2. **Component Development**:
   - Create AnalysisPrompt.tsx stub
   - Write component unit tests (keyboard handling)
   - Implement Prompt component
   - Write promptForAdr() wrapper
   - Test render/unmount lifecycle

3. **Integration**:
   - Create TTY detection utility
   - Add prompt to analysis.ts (is_significant branch)
   - Add logger events for prompt lifecycle
   - Test TTY and non-TTY scenarios

4. **Validation**:
   - Run all existing tests (no regressions)
   - Add integration tests (happy-flows.test.ts)
   - Manual testing (various terminal emulators)
   - Update README with prompt documentation

**Ordering Strategy**:
- Dependencies first (unblock parallel work)
- TTY detection before prompt component (needed by both tests and integration)
- Component tests before integration (TDD)
- Mark [P] for parallelizable tasks

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, manual UX testing)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

No violations - this feature follows existing patterns and constitutional principles.

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (NOT executed)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All clarifications resolved (user confirmed during spec creation)
- [x] No complexity deviations

**Key Decisions Made**:

- ✅ Ink 5.x + React 18 with JSX transform
- ✅ TTY detection: `process.stdout.isTTY && !process.env.CI`
- ✅ Keyboard: arrows + Enter + direct shortcuts (y/n/Esc/q)
- ✅ Default selection: "Skip" (safe default)
- ✅ Testing: ink-testing-library for components, real CLI spawning for integration
- ✅ Dark theme with cyan highlights
- ✅ No new configuration required

---

_Based on existing cADR architecture and User Story #4 from docs/USER_STORIES.md_
