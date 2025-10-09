# Quickstart: Interactive Prompt with Ink

**Feature**: Story #4 - Interactive Prompt  
**Date**: 2025-01-09  
**Purpose**: Validate that the interactive Ink prompt works end-to-end

---

## Prerequisites

- Node.js 20+ installed
- Working cADR installation
- Git repository with changes
- OpenAI API key configured (`OPENAI_API_KEY`)

---

## Quick Validation (5 minutes)

### 1. Setup Test Repository

```bash
# Create test directory
mkdir -p /tmp/cadr-prompt-test
cd /tmp/cadr-prompt-test

# Initialize Git
git init
git config user.email "test@example.com"
git config user.name "Test User"

# Create initial commit
echo "# Test Project" > README.md
git add README.md
git commit -m "Initial commit"

# Create cadr config
cat > cadr.yaml << EOF
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
EOF
```

### 2. Create Significant Change

```bash
# Create a file that will be detected as architecturally significant
cat > database.ts << 'EOF'
import { Pool } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class DatabaseConnection {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool(config);
  }

  async connect(): Promise<void> {
    await this.pool.connect();
  }

  async query(sql: string): Promise<any> {
    return this.pool.query(sql);
  }
}
EOF

# Stage the file (or leave unstaged for default mode)
# git add database.ts
```

### 3. Run Analysis (Interactive Mode)

```bash
# Ensure you're in a real terminal (not CI)
export OPENAI_API_KEY="your-api-key-here"

# Run analysis
cadr analyze

# Expected Output:
# 🔍 Analyzing uncommitted changes for architectural significance...
# 🤖 Sending to openai gpt-4...
# 
# ┌─────────────────────────────────────────────────────────┐
# │ Architecturally Significant Change Detected             │
# │                                                          │
# │ Reason: Introduces new database connection module...    │
# │                                                          │
# │   ▶ Skip         Create ADR                             │
# │                                                          │
# │ Use ←/→, Enter (y/n also works)                         │
# └─────────────────────────────────────────────────────────┘
```

### 4. Interact with Prompt

**Test Navigation**:
```
1. Press Right Arrow (→)
   → Selection should move to "Create ADR"
   
2. Press Left Arrow (←)
   → Selection should move back to "Skip"
   
3. Press Right Arrow (→) again
   → Selection on "Create ADR"
   
4. Press Enter
   → Prompt should close
   → Message: "📝 Creating ADR draft..."
```

**Test Shortcuts**:
```bash
# Run again
cadr analyze

# Immediately press 'y' (no need to navigate)
# Expected: Prompt closes, "Creating ADR draft..." appears

# Run again
cadr analyze

# Immediately press 'n' (skip)
# Expected: Prompt closes, "Skipped ADR creation." appears
```

### 5. Test CI/Non-TTY Fallback

```bash
# Simulate CI environment
CI=true cadr analyze

# Expected Output (text only, no Ink prompt):
# 🔍 Analyzing uncommitted changes for architectural significance...
# 🤖 Sending to openai gpt-4...
# 
# ✅ Analysis Complete
# 
# 📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT
# 💭 Reasoning: Introduces new database connection module...
# 
# 💡 Tip: Run in an interactive terminal to create an ADR from this screen.
```

### 6. Test Non-Significant Change

```bash
# Create a trivial change
echo "// Comment" >> README.md

# Run analysis
cadr analyze

# Expected: No prompt (change not significant)
# Output:
# 📊 Result: ℹ️  NOT ARCHITECTURALLY SIGNIFICANT
# 💭 Reasoning: Minor documentation update
# ✅ No ADR needed for these changes.
```

---

## Validation Checklist

### Interactive Mode ✅

- [ ] Prompt appears with title "Architecturally Significant Change Detected"
- [ ] Reason text is displayed clearly
- [ ] Default selection is on "Skip"
- [ ] Visual indicator (▶ or highlight) shows selection
- [ ] Left/Right arrows toggle selection
- [ ] Enter key confirms selected option
- [ ] 'y' key instantly creates ADR (bypasses selection)
- [ ] 'n' key instantly skips (bypasses selection)
- [ ] Esc key instantly skips
- [ ] 'q' key instantly skips
- [ ] Prompt unmounts cleanly after decision
- [ ] Terminal returns to normal state

### Non-Interactive Mode ✅

- [ ] CI=true triggers text fallback (no prompt)
- [ ] Piped output triggers text fallback
- [ ] Text summary includes all necessary info
- [ ] Helpful tip about interactive mode is shown
- [ ] Exit code is 0 (fail-open principle)

### UI Quality ✅

- [ ] Dark theme with cyan/green highlights
- [ ] Text is readable and well-spaced
- [ ] Layout doesn't break on narrow terminals (test with 80 cols)
- [ ] Long reasons wrap/truncate gracefully
- [ ] Keyboard instructions are clear

### Integration ✅

- [ ] Existing `cadr init` command still works
- [ ] Non-significant analysis results unchanged
- [ ] All existing tests still pass
- [ ] No regressions in CI workflows

---

## Performance Validation

### Render Time

```bash
# Measure time from decision to prompt display
time cadr analyze

# Target: Prompt appears in < 100ms after "Sending to openai..." message
```

### Input Responsiveness

```bash
# Test rapid key presses
cadr analyze
# Quickly press: → → → → Enter

# Expected: No lag, selection updates smoothly
# Target: < 50ms latency per keypress
```

---

## Troubleshooting

### Prompt Doesn't Appear

**Possible Causes**:
1. CI environment detected (check `echo $CI`)
2. No TTY available (piped output)
3. Change not detected as significant by LLM

**Debug Steps**:
```bash
# Check TTY
node -e "console.log('isTTY:', process.stdout.isTTY)"
# Should output: isTTY: true

# Check CI env
echo $CI
# Should output: (empty) or false

# Run with verbose logging
cadr analyze --verbose
# Should show TTY detection logs
```

### Prompt Appears in CI

**Issue**: `shouldShowPrompt` logic not working

**Fix**: Verify TTY detection:
```typescript
const isTTY = process.stdout.isTTY ?? false;
const isCI = process.env.CI === 'true' || process.env.CI === '1';
const shouldShowPrompt = isTTY && !isCI;
```

### Keyboard Not Responding

**Issue**: `useInput` hook not registering keys

**Debug**:
```bash
# Check if terminal is in raw mode
stty -a
# Should show "raw" or similar

# Try a different terminal emulator
# (iTerm2, macOS Terminal, Windows Terminal, etc.)
```

### Visual Glitches

**Issue**: Ink rendering artifacts

**Solutions**:
1. Clear terminal: `clear` or Ctrl+L
2. Resize terminal window
3. Update terminal emulator to latest version
4. Check terminal color support: `echo $TERM`

---

## Expected Test Results

### Unit Tests

```bash
npm test -- AnalysisPrompt.test

# Expected: All tests pass
# ✓ renders with default selection on "Skip"
# ✓ toggles selection with arrow keys
# ✓ calls onSubmit(true) when 'y' pressed
# ✓ calls onSubmit(false) when 'n' pressed
# ✓ handles empty reason string
# ... (12 tests total)
```

### Integration Tests

```bash
npm test -- tests/integration/prompt-interaction.test

# Expected: All tests pass
# ✓ shows Ink prompt in TTY environment
# ✓ shows text fallback in CI environment
# ✓ integrates with analysis workflow
# ... (5 tests total)
```

### E2E Tests

```bash
npm test -- tests/integration/happy-flows.test

# Expected: Existing tests still pass + new prompt tests
# ✓ User confirms ADR creation via prompt
# ✓ User skips ADR creation via prompt
# ✓ Non-TTY environment uses text fallback
# ... (all tests pass)
```

---

## Success Criteria

Story #4 is complete when:

✅ **Interactive Experience**
- Ink prompt appears in TTY environments
- All keyboard controls work as specified
- Default selection is "Skip"

✅ **Visual Quality**
- Dark theme with cyan highlights
- Clean, professional appearance
- Matches modern CLI conventions (Gemini CLI quality)

✅ **Non-TTY Fallback**
- CI environments use text output
- Piped output doesn't hang
- Helpful messages guide user

✅ **No Regressions**
- All existing commands work
- All existing tests pass
- No breaking changes

✅ **Testing Coverage**
- Unit tests for component logic
- Integration tests for TTY/non-TTY
- E2E tests for user flows

✅ **Documentation**
- README updated with prompt info
- This quickstart validates feature

---

## Next Steps (Story #5)

After validating Story #4:

1. Placeholder message "Creating ADR draft..." will be replaced with actual generation
2. Story #5 will implement:
   - Second LLM call with generation prompt
   - Integration with adr-tools or custom template
   - File creation in docs/architecture/decisions/
   - Success message with file path

---

## Cleanup

```bash
# Remove test directory
rm -rf /tmp/cadr-prompt-test
```

---

_Quickstart complete: 2025-01-09_

