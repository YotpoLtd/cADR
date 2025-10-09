# Tasks: Interactive Prompt with Ink

**Feature**: Story #4 - Interactive Prompt  
**Branch**: `004-interactive-prompt-ink`  
**Date**: 2025-01-09  
**Status**: Ready for execution

---

## Overview

This task list implements the interactive Ink prompt feature following Test-Driven Development (TDD) principles. Tasks are ordered by dependencies, with parallelizable tasks marked with `[P]`.

**Estimated Completion**: 15-20 tasks, ~4-6 hours for experienced developer

**Key Principles**:
- Tests before implementation (TDD)
- Fail-open principle maintained
- No regressions to existing functionality
- Dark theme with polished UX

---

## Task Execution Guide

### Sequential Execution
```bash
# Run tasks in order (T001 → T002 → T003 → ...)
# Do NOT skip tasks or change order
```

### Parallel Execution
Tasks marked `[P]` can run simultaneously:
```bash
# Example: T002, T003, T004 can all run in parallel
# Start 3 terminals/agents and run each task concurrently
```

---

## Phase 0: Setup (Tasks 1-3)

### T001: Add Dependencies
**File**: `packages/cli/package.json`  
**Type**: Setup  
**Parallel**: No

**Description**: Add Ink, React, and related dependencies to the CLI package.

**Actions**:
1. Add to dependencies:
   ```json
   {
     "dependencies": {
       "ink": "^5.0.1",
       "react": "^18.3.1",
       "ink-spinner": "^5.0.0"
     }
   }
   ```
2. Run `npm install` or `yarn install` in `packages/cli/`
3. Verify installation: `ls node_modules/ink`

**Acceptance Criteria**:
- ✅ `package.json` includes new dependencies with correct versions
- ✅ `node_modules/` contains ink, react, ink-spinner
- ✅ No version conflicts or warnings

**Estimated Time**: 5 minutes

---

### T002: Configure TypeScript for JSX [P]
**File**: `packages/cli/tsconfig.json`  
**Type**: Setup  
**Parallel**: Yes (independent of T003, T004)

**Description**: Enable JSX/TSX support with modern React transform.

**Actions**:
1. Update `packages/cli/tsconfig.json`:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src",
       "jsx": "react-jsx",
       "jsxImportSource": "react"
     },
     "include": ["src/**/*"],
     "references": []
   }
   ```
2. Test compilation: `npm run build` (should succeed with no errors)

**Acceptance Criteria**:
- ✅ TSX files compile without errors
- ✅ No manual React imports required in TSX files
- ✅ Build output includes jsx runtime imports

**Estimated Time**: 5 minutes

---

### T003: Verify Jest Handles TSX [P]
**File**: `jest.config.js`, `jest.setup.js`  
**Type**: Setup  
**Parallel**: Yes (independent of T002, T004)

**Description**: Ensure Jest can run tests for TSX files.

**Actions**:
1. Verify `jest.config.js` has `preset: 'ts-jest'` (should already exist)
2. Create a test TSX file:
   ```tsx
   // packages/cli/src/__test-tsx-support__.test.tsx
   import React from 'react';
   test('TSX support', () => {
     const el = <div>test</div>;
     expect(el).toBeDefined();
   });
   ```
3. Run test: `npm test -- __test-tsx-support__`
4. Delete test file after verification

**Acceptance Criteria**:
- ✅ Test passes without errors
- ✅ No configuration changes needed (ts-jest handles TSX)

**Estimated Time**: 5 minutes

---

### T004: Install ink-testing-library [P]
**File**: `packages/cli/package.json`  
**Type**: Setup  
**Parallel**: Yes (independent of T002, T003)

**Description**: Add ink-testing-library as dev dependency for component testing.

**Actions**:
1. Add to devDependencies:
   ```json
   {
     "devDependencies": {
       "ink-testing-library": "^4.0.0",
       "@types/react": "^18.3.0"
     }
   }
   ```
2. Run `npm install` in `packages/cli/`

**Acceptance Criteria**:
- ✅ `ink-testing-library` installed in node_modules
- ✅ No peer dependency warnings

**Estimated Time**: 3 minutes

---

## Phase 1: TTY Detection (Tasks 5-7)

### T005: Create TTY Detection Module
**File**: `packages/cli/src/utils/tty.ts` (new)  
**Type**: Core Implementation  
**Parallel**: No  
**Dependencies**: T001-T004 complete

**Description**: Implement TTY detection utility per contract.

**Actions**:
1. Create `packages/cli/src/utils/` directory
2. Create `tty.ts`:
   ```typescript
   export interface TTYEnvironment {
     isTTY: boolean;
     isCI: boolean;
     shouldShowPrompt: boolean;
   }

   export function detectTTY(): TTYEnvironment {
     const isTTY = process.stdout.isTTY ?? false;
     const isCI = process.env.CI === 'true' || process.env.CI === '1';
     const shouldShowPrompt = isTTY && !isCI;
     
     return { isTTY, isCI, shouldShowPrompt };
   }
   ```

**Reference**: `specs/004-interactive-prompt-ink/contracts/TTYDetection.contract.ts`

**Acceptance Criteria**:
- ✅ File exports `TTYEnvironment` interface
- ✅ File exports `detectTTY()` function
- ✅ Function follows contract specification
- ✅ No compilation errors

**Estimated Time**: 10 minutes

---

### T006: Write TTY Detection Tests
**File**: `packages/cli/src/utils/tty.test.ts` (new)  
**Type**: Unit Test  
**Parallel**: No  
**Dependencies**: T005 complete

**Description**: Implement contract tests for TTY detection.

**Actions**:
1. Create `tty.test.ts` with 9 tests from contract:
   - isTTY true when process.stdout.isTTY is true
   - isTTY false when process.stdout.isTTY is false/undefined
   - isCI true when process.env.CI is 'true'
   - isCI true when process.env.CI is '1'
   - isCI false when process.env.CI is undefined
   - shouldShowPrompt true when isTTY=true and isCI=false
   - shouldShowPrompt false when isTTY=false
   - shouldShowPrompt false when isCI=true
   - handles undefined process.stdout.isTTY

2. Mock `process.stdout.isTTY` and `process.env.CI` in tests

**Reference**: `specs/004-interactive-prompt-ink/contracts/TTYDetection.contract.ts` (lines 138-145)

**Acceptance Criteria**:
- ✅ All 9 tests pass
- ✅ Code coverage: 100% for tty.ts
- ✅ Tests use proper mocking for process properties

**Estimated Time**: 20 minutes

---

### T007: Verify TTY Tests Pass
**File**: N/A (verification task)  
**Type**: Validation  
**Parallel**: No  
**Dependencies**: T006 complete

**Actions**:
1. Run: `npm test -- tty.test.ts`
2. Verify all tests pass
3. Check coverage: `npm test -- tty.test.ts --coverage`

**Acceptance Criteria**:
- ✅ All TTY tests pass
- ✅ Coverage: 100% for tty.ts
- ✅ No warnings or errors

**Estimated Time**: 2 minutes

---

## Phase 2: Prompt Component (Tasks 8-11)

### T008: Create Prompt Component Stub
**File**: `packages/cli/src/ui/AnalysisPrompt.tsx` (new)  
**Type**: Core Implementation  
**Parallel**: No  
**Dependencies**: T001-T004 complete

**Description**: Create React/Ink prompt component structure.

**Actions**:
1. Create `packages/cli/src/ui/` directory
2. Create `AnalysisPrompt.tsx` with component stub:
   ```tsx
   import React, { useState } from 'react';
   import { Box, Text, useInput, render } from 'ink';

   export interface AnalysisPromptProps {
     reason: string;
     onSubmit: (createAdr: boolean) => void;
   }

   function Prompt({ reason, onSubmit }: AnalysisPromptProps) {
     const [selected, setSelected] = useState<'create' | 'skip'>('skip');

     useInput((input, key) => {
       // TODO: Implement keyboard handling (T009)
     });

     return (
       <Box flexDirection="column">
         {/* TODO: Implement UI (T009) */}
       </Box>
     );
   }

   export function promptForAdr(reason: string): Promise<boolean> {
     return new Promise((resolve) => {
       const { unmount } = render(
         <Prompt reason={reason} onSubmit={(decision) => {
           resolve(decision);
           unmount();
         }} />
       );
     });
   }
   ```

**Reference**: `specs/004-interactive-prompt-ink/contracts/AnalysisPrompt.contract.ts`

**Acceptance Criteria**:
- ✅ File compiles without errors
- ✅ Exports `AnalysisPromptProps` and `promptForAdr()`
- ✅ Component structure matches contract

**Estimated Time**: 15 minutes

---

### T009: Implement Prompt UI and Keyboard Handling
**File**: `packages/cli/src/ui/AnalysisPrompt.tsx`  
**Type**: Core Implementation  
**Parallel**: No  
**Dependencies**: T008 complete

**Description**: Complete prompt component with dark theme and full keyboard support.

**Actions**:
1. Implement keyboard handling in `useInput`:
   ```tsx
   useInput((input, key) => {
     const i = (input || '').toLowerCase();
     
     // Direct shortcuts
     if (i === 'y') onSubmit(true);
     else if (i === 'n' || key.escape || i === 'q') onSubmit(false);
     
     // Menu navigation
     else if (key.leftArrow || key.rightArrow) {
       setSelected(s => (s === 'create' ? 'skip' : 'create'));
     }
     else if (key.return) {
       onSubmit(selected === 'create');
     }
   });
   ```

2. Implement UI rendering:
   ```tsx
   return (
     <Box flexDirection="column">
       <Box marginBottom={1}>
         <Text color="whiteBright">Architecturally Significant Change Detected</Text>
       </Box>
       <Box marginBottom={1}>
         <Text color="gray">Reason: {reason || '—'}</Text>
       </Box>
       <Box>
         <Text color={selected === 'skip' ? 'cyan' : 'gray'}>
           {selected === 'skip' ? '▶ ' : '  '}Skip
         </Text>
         <Text>   </Text>
         <Text color={selected === 'create' ? 'cyan' : 'gray'}>
           {selected === 'create' ? '▶ ' : '  '}Create ADR
         </Text>
       </Box>
       <Box marginTop={1}>
         <Text color="gray">Use ←/→, Enter (y/n also works)</Text>
       </Box>
     </Box>
   );
   ```

**Reference**: 
- `specs/004-interactive-prompt-ink/research.md` (Ink best practices)
- `specs/004-interactive-prompt-ink/spec.md` (UX requirements)

**Acceptance Criteria**:
- ✅ Dark theme with cyan highlights
- ✅ Default selection: "Skip"
- ✅ Visual indicator (▶) shows selection
- ✅ All keyboard shortcuts work
- ✅ Compiles without errors

**Estimated Time**: 30 minutes

---

### T010: Write Prompt Component Tests
**File**: `packages/cli/src/ui/AnalysisPrompt.test.tsx` (new)  
**Type**: Unit Test  
**Parallel**: No  
**Dependencies**: T009 complete

**Description**: Implement contract tests for prompt component.

**Actions**:
1. Create test file with 12 tests from contract:
   - Renders with default selection on "Skip"
   - Displays reason text
   - Toggles selection with left/right arrow
   - Calls onSubmit(true) when 'y' pressed
   - Calls onSubmit(false) when 'n' pressed
   - Calls onSubmit(false) when Esc pressed
   - Calls onSubmit(false) when 'q' pressed
   - Calls onSubmit(true) when "Create ADR" selected and Enter pressed
   - Calls onSubmit(false) when "Skip" selected and Enter pressed
   - Unmounts cleanly after decision
   - Handles empty reason string
   - Handles long reason strings

2. Use ink-testing-library:
   ```tsx
   import { render } from 'ink-testing-library';
   import { Prompt } from './AnalysisPrompt';

   test('renders with default selection on Skip', () => {
     const onSubmit = jest.fn();
     const { lastFrame } = render(<Prompt reason="Test" onSubmit={onSubmit} />);
     expect(lastFrame()).toContain('▶ Skip');
   });
   ```

**Reference**: `specs/004-interactive-prompt-ink/contracts/AnalysisPrompt.contract.ts` (lines 107-123)

**Acceptance Criteria**:
- ✅ All 12 tests pass
- ✅ Code coverage: 100% for AnalysisPrompt.tsx
- ✅ Tests verify keyboard input handling
- ✅ Tests verify visual rendering

**Estimated Time**: 45 minutes

---

### T011: Verify Prompt Tests Pass
**File**: N/A (verification task)  
**Type**: Validation  
**Parallel**: No  
**Dependencies**: T010 complete

**Actions**:
1. Run: `npm test -- AnalysisPrompt.test.tsx`
2. Verify all tests pass
3. Check coverage: `npm test -- AnalysisPrompt.test.tsx --coverage`

**Acceptance Criteria**:
- ✅ All prompt component tests pass
- ✅ Coverage: 100% for AnalysisPrompt.tsx
- ✅ No warnings or errors

**Estimated Time**: 2 minutes

---

## Phase 3: Integration (Tasks 12-14)

### T012: Integrate Prompt into Analysis Flow
**File**: `packages/cli/src/analysis.ts`  
**Type**: Integration  
**Parallel**: No  
**Dependencies**: T005, T009 complete

**Description**: Wire the Ink prompt into the existing analysis workflow.

**Actions**:
1. Import TTY detection at top of file:
   ```typescript
   import { detectTTY } from './utils/tty';
   ```

2. Modify the `result.is_significant` branch (around line 160):
   ```typescript
   if (result.is_significant) {
     const env = detectTTY();
     
     if (env.shouldShowPrompt) {
       // Dynamic import to avoid loading Ink in non-TTY
       const { promptForAdr } = await import('./ui/AnalysisPrompt');
       const shouldCreate = await promptForAdr(result.reason);
       
       if (shouldCreate) {
         console.log('📝 Creating ADR draft...');
         // Story #5 will implement generation
       } else {
         console.log('✅ Skipped ADR creation.\n');
       }
     } else {
       // Non-TTY fallback (existing behavior enhanced)
       console.log('📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT');
       console.log(`💭 Reasoning: ${result.reason}\n`);
       console.log('💡 Tip: Run in an interactive terminal to create an ADR from this screen.\n');
     }
   } else {
     // Existing non-significant result handling (unchanged)
     // ...
   }
   ```

**Reference**: `specs/004-interactive-prompt-ink/plan.md` (Integration Point)

**Acceptance Criteria**:
- ✅ TTY detection integrated
- ✅ Ink prompt shown when shouldShowPrompt=true
- ✅ Text fallback used when shouldShowPrompt=false
- ✅ No compilation errors
- ✅ Existing behavior for non-significant changes unchanged

**Estimated Time**: 20 minutes

---

### T013: Add Logger Events for Prompt
**File**: `packages/cli/src/logger.ts` or `packages/cli/src/analysis.ts`  
**Type**: Integration  
**Parallel**: No  
**Dependencies**: T012 complete

**Description**: Add structured logging for prompt lifecycle events.

**Actions**:
1. In `analysis.ts`, add logs around prompt interaction:
   ```typescript
   if (env.shouldShowPrompt) {
     logger.info('Interactive prompt displayed', {
       reason: result.reason,
       isTTY: env.isTTY,
       isCI: env.isCI
     });
     
     const { promptForAdr } = await import('./ui/AnalysisPrompt');
     const shouldCreate = await promptForAdr(result.reason);
     
     logger.info('User decision recorded', {
       createAdr: shouldCreate,
       timestamp: new Date().toISOString()
     });
     
     // ... rest of handling
   } else {
     logger.info('Text fallback used (no TTY)', {
       reason: result.reason,
       isTTY: env.isTTY,
       isCI: env.isCI
     });
   }
   ```

**Reference**: `specs/004-interactive-prompt-ink/data-model.md` (Logging Events section)

**Acceptance Criteria**:
- ✅ Logs "prompt.displayed" when shown
- ✅ Logs "user.decision" with timestamp
- ✅ Logs "text.fallback" when TTY unavailable
- ✅ All logs are structured JSON to stderr

**Estimated Time**: 15 minutes

---

### T014: Build and Manual Smoke Test
**File**: N/A (verification task)  
**Type**: Validation  
**Parallel**: No  
**Dependencies**: T012, T013 complete

**Actions**:
1. Build CLI: `npm run build`
2. Verify no compilation errors
3. Create test repo with significant change (per quickstart.md)
4. Run `cadr analyze` interactively
5. Verify prompt appears and keyboard works
6. Test with `CI=true cadr analyze` - verify text fallback

**Reference**: `specs/004-interactive-prompt-ink/quickstart.md` (sections 1-5)

**Acceptance Criteria**:
- ✅ Build succeeds with no errors
- ✅ Prompt renders in TTY
- ✅ Keyboard controls work
- ✅ Text fallback works with CI=true
- ✅ No visual glitches or crashes

**Estimated Time**: 15 minutes

---

## Phase 4: Integration Tests (Tasks 15-17)

### T015: Write TTY Integration Test [P]
**File**: `tests/integration/prompt-tty.test.ts` (new)  
**Type**: Integration Test  
**Parallel**: Yes (independent of T016)  
**Dependencies**: T014 complete

**Description**: Test Ink prompt appears in TTY environment.

**Actions**:
1. Create test file:
   ```typescript
   import { exec } from 'child_process';
   import { promisify } from 'util';

   const execAsync = promisify(exec);
   const cliPath = '../../packages/cli/dist/index.js';

   test('shows Ink prompt in TTY environment', async () => {
     // Setup: create test repo with significant change
     // Run: node <cliPath> analyze
     // Assert: output contains "Architecturally Significant Change Detected"
     // Assert: output contains "▶" (Ink UI indicator)
   });
   ```

2. Follow pattern from existing integration tests

**Reference**: `specs/004-interactive-prompt-ink/data-model.md` (Integration Flow)

**Acceptance Criteria**:
- ✅ Test creates isolated git repo
- ✅ Test creates significant change
- ✅ Test runs `cadr analyze`
- ✅ Test verifies Ink prompt indicators present
- ✅ Test cleans up after itself

**Estimated Time**: 30 minutes

---

### T016: Write Non-TTY Integration Test [P]
**File**: `tests/integration/prompt-non-tty.test.ts` (new)  
**Type**: Integration Test  
**Parallel**: Yes (independent of T015)  
**Dependencies**: T014 complete

**Description**: Test text fallback appears in CI environment.

**Actions**:
1. Create test file:
   ```typescript
   test('shows text fallback in CI environment', async () => {
     const { stdout } = await execAsync('node <cliPath> analyze', {
       env: { ...process.env, CI: 'true', OPENAI_API_KEY: 'test' }
     });
     
     expect(stdout).toContain('ARCHITECTURALLY SIGNIFICANT');
     expect(stdout).toContain('Tip: Run in an interactive terminal');
     expect(stdout).not.toContain('▶'); // No Ink UI
   });
   ```

**Acceptance Criteria**:
- ✅ Test sets CI=true environment variable
- ✅ Test verifies text output (not Ink)
- ✅ Test verifies helpful tip is shown
- ✅ Test verifies exit code is 0

**Estimated Time**: 20 minutes

---

### T017: Update Happy Flows Tests
**File**: `tests/integration/happy-flows.test.ts`  
**Type**: Integration Test  
**Parallel**: No  
**Dependencies**: T015, T016 complete

**Description**: Add prompt interaction scenarios to existing happy flows.

**Actions**:
1. Add test: "User confirms ADR creation via prompt"
   - Setup significant change
   - Run analyze
   - Simulate 'y' keypress
   - Assert "Creating ADR draft..." message

2. Add test: "User skips ADR creation via prompt"
   - Setup significant change
   - Run analyze
   - Simulate 'n' keypress
   - Assert "Skipped ADR creation" message

3. Add test: "Non-TTY shows text fallback"
   - Set CI=true
   - Run analyze
   - Assert text output (no Ink)

**Reference**: `specs/004-interactive-prompt-ink/quickstart.md` (Test Scenarios)

**Acceptance Criteria**:
- ✅ 3 new tests added
- ✅ All new tests pass
- ✅ Existing tests still pass (no regressions)

**Estimated Time**: 40 minutes

---

## Phase 5: Polish (Tasks 18-20)

### T018: Run Full Test Suite
**File**: N/A (verification task)  
**Type**: Validation  
**Parallel**: No  
**Dependencies**: T017 complete

**Actions**:
1. Run: `npm test`
2. Verify all tests pass (unit + integration)
3. Check coverage: `npm test -- --coverage`
4. Verify coverage is maintained (>80%)

**Acceptance Criteria**:
- ✅ All tests pass (0 failures)
- ✅ No new linting errors
- ✅ Code coverage maintained or improved
- ✅ No warnings in test output

**Estimated Time**: 5 minutes

---

### T019: Update README Documentation [P]
**File**: `README.md`  
**Type**: Documentation  
**Parallel**: Yes (independent of T020)  
**Dependencies**: T018 complete

**Description**: Document the new interactive prompt feature.

**Actions**:
1. Add section under "Usage" or "Features":
   ```markdown
   ### Interactive Prompt

   When `cadr analyze` detects an architecturally significant change,
   you'll be presented with an interactive prompt:

   - **Navigate**: Use arrow keys (←/→) to select an option
   - **Confirm**: Press Enter to confirm your selection
   - **Shortcuts**: Press 'y' to create ADR, 'n' to skip

   **Note**: In CI environments, the prompt is replaced with a text
   summary to avoid blocking automated workflows.
   ```

2. Optional: Add screenshot or terminal recording

**Acceptance Criteria**:
- ✅ New section clearly explains prompt behavior
- ✅ Keyboard controls documented
- ✅ CI behavior explained
- ✅ No markdown linting errors

**Estimated Time**: 15 minutes

---

### T020: Final Manual Testing Checklist [P]
**File**: N/A (verification task)  
**Type**: Validation  
**Parallel**: Yes (independent of T019)  
**Dependencies**: T018 complete

**Description**: Perform final manual validation per quickstart.md.

**Actions**:
1. Follow `specs/004-interactive-prompt-ink/quickstart.md` step-by-step
2. Test in multiple terminal emulators:
   - macOS Terminal
   - iTerm2
   - Windows Terminal (if available)
3. Test edge cases:
   - Very long reason strings
   - Narrow terminal width (80 cols)
   - Rapid key presses
4. Verify logging output (stderr)

**Reference**: `specs/004-interactive-prompt-ink/quickstart.md` (Validation Checklist)

**Acceptance Criteria**:
- ✅ All quickstart validation items pass
- ✅ Prompt works in all tested terminals
- ✅ Edge cases handled gracefully
- ✅ No visual glitches or crashes

**Estimated Time**: 30 minutes

---

## Completion Checklist

Before marking this feature complete, verify:

- [ ] All 20 tasks completed
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing complete (quickstart.md)
- [ ] Documentation updated (README.md)
- [ ] No regressions to existing functionality
- [ ] Story #4 acceptance criteria met (see spec.md)

---

## Summary

**Total Tasks**: 20  
**Parallelizable**: 6 tasks (T002-T004, T015-T016, T019-T020)  
**Sequential**: 14 tasks  
**Estimated Time**: 4-6 hours for experienced developer

**Key Milestones**:
- After T007: TTY detection complete and tested
- After T011: Prompt component complete and tested
- After T014: Integration complete, feature functional
- After T017: All integration tests passing
- After T020: Feature complete, ready for PR

**Dependencies Graph**:
```
T001 (deps) ─┬─→ T002 [P] ──→ T008 ──→ T009 ──→ T010 ──→ T011 ┐
             ├─→ T003 [P] ──────────────────────────────────────┤
             ├─→ T004 [P] ──────────────────────────────────────┤
             └─→ T005 ──→ T006 ──→ T007 ────────────────────────┘
                                                                 ↓
                                                   T012 ──→ T013 ──→ T014
                                                                 ↓
                                         ┌──────────────────────┴──────────────────┐
                                         ↓                                          ↓
                                    T015 [P] ──→ T017 ──→ T018 ──→ T019 [P]        T016 [P]
                                                                   └──→ T020 [P]
```

---

_Tasks ready for execution: 2025-01-09_

