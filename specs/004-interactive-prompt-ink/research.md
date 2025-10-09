# Research: Interactive Prompt with Ink

**Feature**: Story #4 - Interactive Prompt  
**Date**: 2025-01-09  
**Status**: Complete

## Overview

This document consolidates research findings for implementing an interactive Ink-based prompt in the cADR CLI. The prompt appears after `cadr analyze` detects architecturally significant changes and allows users to confirm ADR creation.

---

## 1. Ink Best Practices

### Decision
Use **Ink 5.x** with **React 18** and modern JSX transform.

### Rationale
- **Ink 5.x** is the latest stable version with full React 18 support
- **Automatic JSX runtime** (`react-jsx`) eliminates need for manual React imports in every file
- Active maintenance and wide adoption (used by Gemini CLI, GitHub Copilot CLI, Cloudflare Wrangler)
- Comprehensive hook ecosystem (`useInput`, `useApp`, `useFocus`)

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Ink 4.x | More stable | Outdated, lacks React 18 features | ❌ Rejected |
| ink-select-input | Pre-built menu component | Adds dependency, less customizable | ❌ Rejected - build custom |
| blessed/neo-blessed | Lower-level control | Complex API, no React | ❌ Rejected - Ink abstracts well |
| Prompts.js | Simple API | No React, limited styling | ❌ Rejected - want modern UX |

### Key Findings

**Component Structure**:
```tsx
import { Box, Text, useInput } from 'ink';

function MyComponent() {
  useInput((input, key) => {
    // Handle keyboard events
  });
  
  return (
    <Box flexDirection="column">
      <Text color="cyan">Highlighted text</Text>
    </Box>
  );
}
```

**Lifecycle Management**:
- `render(<Component />)` mounts the component
- Returns `{ unmount }` for cleanup
- Promise wrapper pattern for async operations

**Layout System**:
- Flexbox-based (same as CSS)
- `<Box>` = container with flex properties
- `<Text>` = text with styling (color, bold, etc.)
- Supports margin, padding, borders

**Color Support**:
- Automatic terminal color detection
- Named colors ('cyan', 'green', 'gray')
- Hex colors ('#00FF00')
- RGB colors ('rgb(0, 255, 0)')
- Dim option for subtle text

**Best Practices**:
- Keep components small and focused
- Use `useInput` hook for keyboard handling
- Unmount cleanly to restore terminal state
- Test with `ink-testing-library`

### References
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) - Reference implementation
- [GitHub Copilot CLI](https://githubnext.com/projects/copilot-cli) - UX patterns

---

## 2. Keyboard Navigation Standards

### Decision
Support both **menu-style navigation** (arrows + Enter) and **direct shortcuts** (y/n/Esc/q).

### Rationale
- **Accessibility**: Visual selection helps newcomers understand options
- **Efficiency**: Direct shortcuts for power users
- **Consistency**: Matches conventions from npm, Git, and modern CLIs
- **Safety**: Default to "Skip" (non-destructive action)

### Keyboard Map

| Key | Action | Notes |
|-----|--------|-------|
| ← / → | Switch selection | Toggle between "Create ADR" and "Skip" |
| Enter | Confirm selection | Execute currently selected option |
| y | Create ADR | Instant action (bypass selection) |
| n | Skip | Instant action (bypass selection) |
| Esc | Skip | Alternative cancel key |
| q | Skip | Common CLI convention for quit |

### Visual Feedback
- **Selected option**: Cyan color + arrow indicator (`▶`)
- **Unselected option**: Gray color, no indicator
- **Instruction text**: Gray, bottom of prompt

### Patterns from Similar Tools

**npm**:
- Uses arrow keys + Enter
- Clear visual selection indicator
- Escape to cancel

**Git interactive rebase**:
- Single-key shortcuts (p, r, e, s)
- Enter to confirm
- Visual highlighting

**ink-select-input** (reference, not using):
- Arrow keys navigate
- Enter confirms
- Clear indicator shows selection

### Implementation Notes

Using Ink's `useInput` hook:
```tsx
useInput((input, key) => {
  const i = (input || '').toLowerCase();
  
  // Direct shortcuts
  if (i === 'y') onSubmit(true);
  else if (i === 'n' || key.escape || i === 'q') onSubmit(false);
  
  // Menu navigation
  else if (key.leftArrow || key.rightArrow) toggleSelection();
  else if (key.return) onSubmit(selected === 'create');
});
```

---

## 3. TTY Detection

### Decision
Use `process.stdout.isTTY && !process.env.CI` to determine if interactive prompt should be shown.

### Rationale
- **process.stdout.isTTY**: Node.js built-in, reliable for detecting terminal
- **process.env.CI**: Standard convention across CI platforms (GitHub Actions, GitLab CI, CircleCI)
- **Fail-safe**: False positives result in text output (acceptable), false negatives would hang CI (unacceptable)

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `process.stdout.isTTY` only | Simple | Might show prompt in CI | ❌ Too risky |
| `isatty()` syscall | More precise | Requires native module, overkill | ❌ Unnecessary complexity |
| Custom TTY probing | Full control | Complex, fragile | ❌ Reinventing wheel |
| Always render Ink | Simplest | Hangs in CI/piped output | ❌ Unacceptable |

### CI Environment Detection

Common CI environment variables:
- `CI=true` (most CI systems)
- `GITHUB_ACTIONS=true` (GitHub)
- `GITLAB_CI=true` (GitLab)
- `CIRCLECI=true` (CircleCI)
- `JENKINS_HOME` (Jenkins)

**Decision**: Check `process.env.CI` only - it's set by all major CI platforms.

### Fallback Behavior

When TTY not available:
```typescript
// Non-interactive text output (matches existing style)
console.log('📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT');
console.log(`💭 Reasoning: ${result.reason}\n`);
console.log('💡 Tip: Run in an interactive terminal to create an ADR from this screen.\n');
```

### Implementation

```typescript
// packages/cli/src/utils/tty.ts (new file)

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

### Testing Strategy
- **Unit tests**: Mock `process.stdout.isTTY` and `process.env.CI`
- **Integration tests**: 
  - Set `CI=1` and verify text output
  - Use pseudo-TTY (if available) to test interactive mode
  - Fallback: spawn actual CLI in different environments

---

## 4. TSX Configuration

### Decision
Enable JSX with modern React transform: `"jsx": "react-jsx"` and `"jsxImportSource": "react"`.

### Rationale
- **No manual React imports**: Automatic `import { jsx }` injection by TypeScript
- **Smaller bundle size**: No unused React imports
- **Modern standard**: React 18 recommended approach
- **Better tree-shaking**: Unused JSX features excluded

### Configuration Changes

**packages/cli/tsconfig.json**:
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

**Root tsconfig.json** (if needed):
- Already has strict mode and ES2022 target
- No changes required

### Build Process
- **TypeScript compiler**: Handles TSX → JS transpilation automatically
- **Existing postbuild script**: Adds shebang, chmod +x (unchanged)
- **Jest**: ts-jest already configured, handles TSX files

### Verification
```bash
# Compile should work without errors
npm run build

# Check output includes JSX runtime imports
cat dist/ui/AnalysisPrompt.js | grep 'jsx'
```

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `"jsx": "react"` (classic) | Compatible with older React | Requires manual React imports | ❌ Outdated |
| `"jsx": "preserve"` | Babel can handle | Adds build complexity | ❌ Unnecessary |
| Babel instead of tsc | More flexible | Extra dependency, slower | ❌ TypeScript handles TSX well |

---

## 5. Testing Strategy

### Decision
Use **ink-testing-library** for component tests and **real CLI spawning** for integration tests.

### Rationale
- **ink-testing-library**: Renders components without terminal, enables unit testing
- **Real CLI spawning**: Verifies actual terminal behavior (TTY detection, colors, etc.)
- **Mock-free where possible**: Test real Ink rendering, not mocks

### Testing Layers

#### 1. Component Unit Tests
**Tool**: `ink-testing-library`  
**Location**: `packages/cli/src/ui/AnalysisPrompt.test.tsx`

```typescript
import { render } from 'ink-testing-library';
import { Prompt } from './AnalysisPrompt';

test('renders with default selection on Skip', () => {
  const { lastFrame } = render(<Prompt reason="Test" onSubmit={jest.fn()} />);
  expect(lastFrame()).toContain('▶ Skip');
});

test('toggles selection with arrow keys', () => {
  const { lastFrame, stdin } = render(<Prompt reason="Test" onSubmit={jest.fn()} />);
  stdin.write('\u001B[C'); // Right arrow
  expect(lastFrame()).toContain('▶ Create ADR');
});
```

**Scenarios**:
- ✅ Default selection is "Skip"
- ✅ Arrow keys toggle selection
- ✅ Enter key calls onSubmit with selected value
- ✅ 'y' key calls onSubmit(true)
- ✅ 'n' key calls onSubmit(false)
- ✅ Esc/q keys call onSubmit(false)
- ✅ Reason text is displayed
- ✅ Component unmounts cleanly

#### 2. Integration Tests
**Tool**: Jest + `child_process.spawn`  
**Location**: `tests/integration/prompt-interaction.test.ts`

```typescript
test('shows Ink prompt in TTY environment', async () => {
  const { stdout } = await execAsync('node dist/index.js analyze', {
    env: { ...process.env, /* pseudo-TTY if possible */ }
  });
  expect(stdout).toContain('Architecturally Significant Change Detected');
});

test('shows text fallback in CI environment', async () => {
  const { stdout } = await execAsync('node dist/index.js analyze', {
    env: { ...process.env, CI: 'true' }
  });
  expect(stdout).toContain('ARCHITECTURALLY SIGNIFICANT');
  expect(stdout).not.toContain('▶'); // No Ink UI
});
```

**Scenarios**:
- ✅ TTY environment: Ink prompt renders
- ✅ CI environment: Text fallback used
- ✅ Non-significant changes: No prompt shown
- ✅ Prompt integrates with existing analysis flow
- ✅ Exit codes correct (0 in all cases)

#### 3. End-to-End Tests
**Tool**: Existing `tests/integration/happy-flows.test.ts` (updated)

```typescript
test('User confirms ADR creation via prompt', async () => {
  // Setup: create significant changes
  // Run: cadr analyze
  // Simulate: user pressing 'y'
  // Assert: "Creating ADR draft..." message
});
```

### Testing Pseudo-TTY

**Challenge**: Node.js tests don't run in a real TTY by default.

**Options**:
1. **Manual testing**: Run CLI in real terminal (required for UX validation)
2. **node-pty**: Spawn process with pseudo-TTY (complex, platform-specific)
3. **Environment variable override**: Add `--force-tty` flag for testing (simple)

**Decision**: 
- Primary: Test TTY detection logic separately (mock `process.stdout.isTTY`)
- Secondary: Manual testing in real terminals (macOS Terminal, iTerm2, Windows Terminal)
- Optional: Add `--force-tty` flag for advanced integration testing

### Test Coverage Goals
- **Component tests**: 100% (small, focused component)
- **Integration tests**: Cover TTY, non-TTY, and all keyboard inputs
- **Overall**: Maintain existing 80%+ coverage

### References
- [ink-testing-library](https://github.com/vadimdemedes/ink-testing-library)
- [Jest documentation](https://jestjs.io/docs/getting-started)

---

## Summary

All research questions resolved:

| Topic | Decision | Confidence |
|-------|----------|------------|
| Ink version | 5.x with React 18 | ✅ High |
| Keyboard nav | Arrows + Enter + shortcuts | ✅ High |
| TTY detection | `isTTY && !CI` | ✅ High |
| TSX config | `react-jsx` transform | ✅ High |
| Testing | ink-testing-library + real CLI | ✅ High |

**Ready for Phase 1**: Design & Contracts ✅

---

## Open Questions

None - all clarifications resolved with user during spec creation.

---

## Risk Assessment

| Risk | Mitigation | Severity |
|------|------------|----------|
| Ink doesn't render in some terminals | Fallback to text output | Low |
| TSX compilation breaks build | Verified with test build | Low |
| Pseudo-TTY testing complex | Manual testing + TTY detection unit tests | Low |
| User confused by keyboard controls | Clear on-screen instructions | Low |

**Overall Risk**: ✅ Low - well-trodden path, proven libraries, clear fallbacks

---

_Research complete: 2025-01-09_

