# Contracts: Interactive Prompt with Ink

**Feature**: Story #4 - Interactive Prompt  
**Date**: 2025-01-09  
**Purpose**: Define interfaces and behavior contracts for the interactive prompt feature

---

## Overview

This directory contains TypeScript interface definitions and behavioral contracts for the interactive Ink prompt components. These contracts serve as:

1. **Design documentation** for the component interfaces
2. **Test specifications** defining expected behavior
3. **Integration contracts** between analysis.ts and UI components

---

## Contract Files

### 1. AnalysisPrompt.contract.ts

**Purpose**: Defines the React/Ink prompt component and its async wrapper.

**Key Interfaces**:
- `AnalysisPromptProps`: Props for the Prompt React component
- `promptForAdr()`: High-level async function for showing the prompt

**Behavior Specifications**:
- Rendering (dark theme, default selection, visual indicators)
- Keyboard handling (arrows, Enter, shortcuts)
- Unmounting (clean terminal restoration)
- Error handling (fail-open principle)
- Logging (structured events)
- Performance (render time, input latency)

**Contract Tests**: 12 test scenarios defined (see file for details)

---

### 2. TTYDetection.contract.ts

**Purpose**: Defines environment detection for determining whether to show interactive UI.

**Key Interfaces**:
- `TTYEnvironment`: Result of TTY detection (isTTY, isCI, shouldShowPrompt)
- `detectTTY()`: Function that performs the detection

**Behavior Specifications**:
- Truth table for TTY/CI combinations
- Decision logic (isTTY && !isCI)
- CI environment variable detection
- Rationale for design choices

**Contract Tests**: 9 test scenarios defined (see file for details)

---

## Usage in Implementation

### Import Contracts (Type-Only)

```typescript
// In implementation files
import type { AnalysisPromptProps, TTYEnvironment } from './contracts/AnalysisPrompt.contract';

// Implement interfaces
export function Prompt({ reason, onSubmit }: AnalysisPromptProps) {
  // ...
}

export function detectTTY(): TTYEnvironment {
  // ...
}
```

**Note**: Contracts are TypeScript interfaces and type-only exports. They don't need to be compiled or imported at runtime.

### Contract-Driven Development

1. **Read contract**: Understand interface and behavior specs
2. **Write tests**: Implement tests based on contract test specifications
3. **Implement**: Write code that satisfies the contract
4. **Validate**: Run tests to verify contract compliance

---

## Contract Testing

### Unit Tests

**Location**: `packages/cli/src/ui/AnalysisPrompt.test.tsx`

Tests verify that the Prompt component:
- Implements `AnalysisPromptProps` interface
- Satisfies all behavior specifications in the contract
- Handles all specified keyboard inputs correctly
- Unmounts cleanly

**Tool**: `ink-testing-library`

### Integration Tests

**Location**: `tests/integration/prompt-interaction.test.ts`

Tests verify that `detectTTY()`:
- Implements `TTYEnvironment` interface
- Correctly detects TTY/CI combinations
- Returns expected `shouldShowPrompt` values

Tests verify that the full flow:
- Shows Ink prompt when `shouldShowPrompt = true`
- Uses text fallback when `shouldShowPrompt = false`

---

## Why Contracts?

### Benefits

1. **Clear Specifications**: Unambiguous interface definitions
2. **Test-Driven**: Tests written before implementation
3. **Documentation**: Self-documenting code via TypeScript interfaces
4. **Collaboration**: Team members can work in parallel (contracts define boundaries)
5. **Validation**: Easy to verify implementation matches design

### Contract vs Implementation

**Contract**:
- **What** the component should do
- **How** it should behave
- **When** certain behaviors trigger
- Interfaces, specifications, test scenarios

**Implementation**:
- **How** it's actually coded
- Internal state management
- Optimization details
- Concrete TypeScript/React code

---

## Evolution

Contracts are **living documents**. As implementation reveals edge cases or UX improvements:

1. Update the contract file
2. Update corresponding tests
3. Update implementation
4. Document the change in this README

---

## References

- **Story #4 Spec**: `specs/004-interactive-prompt-ink/spec.md`
- **Data Model**: `specs/004-interactive-prompt-ink/data-model.md`
- **Research**: `specs/004-interactive-prompt-ink/research.md`
- **Ink Documentation**: [github.com/vadimdemedes/ink](https://github.com/vadimdemedes/ink)

---

_Contracts documentation: 2025-01-09_

