# Quickstart: Hello World - Deployable NPM Package

**Feature**: 001-hello-world-a  
**Purpose**: End-to-end validation that the package can be installed and executed  
**Target Users**: Developers testing the implementation

---

## Prerequisites

- Node.js 20+ installed
- npm 7+ (comes with Node.js 20+)
- Terminal/command line access

---

## Quick Validation (30 seconds)

This validates the package works as expected after implementation.

### Step 1: Build the Project

```bash
# From repository root
cd cADR
npm install
npm run build
```

**Expected Output**:
- All dependencies installed
- TypeScript compilation successful
- No errors

### Step 2: Test Local Execution

```bash
# Execute directly via Node.js
node packages/cli/bin/cadr.js
```

**Expected Output**:
```
🎉 Hello, cADR!

cADR (Continuous Architectural Decision Records) helps you automatically
capture and document architectural decisions as you code.

Version: 0.0.1
Learn more: https://github.com/[org]/cADR
```

**Exit Code**: 0 (success)

### Step 3: Test Package Installation

```bash
# Create tarball (simulates npm publish)
npm pack --workspace=cadr-cli

# Install globally from tarball
npm install -g ./cadr-cli-0.0.1.tgz

# Run installed command
cadr
```

**Expected Output**: Same welcome message as Step 2

**Validation**: ✅ Package installation works

### Step 4: Test npx Execution

```bash
# Uninstall global package first
npm uninstall -g cadr-cli

# Simulate npx execution (using local tarball)
npx cadr-cli-0.0.1.tgz
```

**Expected Output**: Same welcome message

**Validation**: ✅ npx execution works

---

## Acceptance Criteria Validation

Use this checklist to verify all requirements from the specification are met:

### FR-001: Package Installation
- [ ] Can install via `npm install -g cadr-cli@0.0.1`
- [ ] Can execute via `npx cadr@0.0.1`
- [ ] Package appears in `npm list -g` after global install

### FR-002: Executable Command
- [ ] Command `cadr` is available after installation
- [ ] Command can be invoked from any directory
- [ ] Command works without file extension (cross-platform)

### FR-003: Welcome Message Content
- [ ] Message displays product name ("cADR" or "Hello, cADR!")
- [ ] Message includes brief description of what tool does
- [ ] Message displays version number (0.0.1)

### FR-004: Performance
- [ ] Message displays within 2 seconds (measure with `time` command)
  ```bash
  time cadr  # Should show < 2s total time
  ```

### FR-005: CI/CD Pipeline
- [ ] GitHub Actions test workflow passes
- [ ] GitHub Actions release workflow exists
- [ ] Tag push triggers release (tested in PR, not executed)

### FR-006: Package Metadata
- [ ] Package name: `cadr-cli`
- [ ] Version: `0.0.1`
- [ ] Description mentions ADR automation
- [ ] Repository URL present
- [ ] Public access (not scoped)

Check with:
```bash
npm view cadr-cli  # After publication
```

### FR-007: Cross-Platform Support
- [ ] Works on macOS (primary development platform)
- [ ] Works on Linux (CI environment)
- [ ] Works on Windows (test via CI or local Windows machine)

### FR-008: Exit Code
- [ ] Exits with code 0 on success
  ```bash
  cadr
  echo $?  # Should output: 0
  ```

---

## Troubleshooting

### Issue: Command not found after global install

**Solution**:
```bash
# Verify npm global bin directory is in PATH
npm config get prefix
# Should be in your PATH, if not, add it:
export PATH="$(npm config get prefix)/bin:$PATH"
```

### Issue: Permission denied on Linux/macOS

**Solution**:
```bash
# Either use sudo (not recommended)
sudo npm install -g cadr-cli-0.0.1.tgz

# Or configure npm to use user directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Issue: Module not found errors

**Solution**:
```bash
# Rebuild from clean state
rm -rf node_modules packages/*/node_modules packages/*/dist
npm install
npm run build
```

### Issue: TypeScript compilation errors

**Solution**:
```bash
# Verify TypeScript version
npm list typescript

# Should be 5.x, if not:
npm install --save-dev typescript@^5.0.0
```

---

## Performance Baseline

Establish performance baseline for future comparison:

```bash
# Measure cold start time
time cadr

# Expected: < 500ms on modern hardware
# Acceptable: < 2000ms (per specification)
```

**Baseline Results** (to be filled after implementation):
- macOS (M1/M2): ___ ms
- Linux (GitHub Actions runner): ___ ms
- Windows (GitHub Actions runner): ___ ms

---

## Next Steps After Validation

Once all acceptance criteria pass:

1. ✅ Mark Story #1 as complete in Definition of Done
2. 📝 Create git tag: `git tag v0.0.1`
3. 🚀 Push tag to trigger release: `git push origin v0.0.1`
4. 👀 Monitor GitHub Actions for successful publication
5. 🎉 Verify package appears on npmjs.com
6. 📋 Move to Story #2: Internal Plumbing

---

## Manual Test Checklist (Before PR)

Run through this checklist before submitting pull request:

- [ ] All automated tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Coverage meets 80% threshold (`npm run test:coverage`)
- [ ] Local execution works (Step 2 above)
- [ ] Package installation works (Step 3 above)
- [ ] README.md updated with installation instructions
- [ ] CHANGELOG.md created with v0.0.1 notes
- [ ] All commits follow conventional commit format
- [ ] PR description references Story #1 and spec

---

**Status**: Ready for Implementation  
**Estimated Validation Time**: 5 minutes  
**Last Updated**: 2025-10-05

