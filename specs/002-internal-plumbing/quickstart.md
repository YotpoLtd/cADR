# Quickstart: Internal Plumbing - Git Integration and Structured Logging

**Feature**: 002-internal-plumbing  
**Date**: 2025-01-27

## Prerequisites

- Node.js 20+
- Git 2.x+ installed and available in PATH
- cADR project built and ready

## Setup

1. **Ensure you're in a Git repository**:
   ```bash
   git status
   # Should show repository status, not "not a git repository"
   ```

2. **Stage some files for testing**:
   ```bash
   # Create a test file
   echo "console.log('test');" > test-file.js
   
   # Stage the file
   git add test-file.js
   
   # Verify it's staged
   git diff --cached --name-only
   # Should show: test-file.js
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

## Testing the Feature

### Test 1: Normal Operation with Staged Files

```bash
# Run cadr with staged files
node packages/cli/bin/cadr.js
```

**Expected Output**:
- **stdout**: Welcome message (from Story #1)
- **stderr**: JSON log with staged files

**Expected stderr JSON**:
```json
{"timestamp":"2025-01-27T10:30:00.000Z","level":"info","message":"Retrieved staged files","context":{"staged_files":["test-file.js"],"count":1}}
```

### Test 2: No Staged Files

```bash
# Unstage all files
git reset

# Run cadr
node packages/cli/bin/cadr.js
```

**Expected Output**:
- **stdout**: Welcome message
- **stderr**: JSON log with empty staged files array

**Expected stderr JSON**:
```json
{"timestamp":"2025-01-27T10:30:00.000Z","level":"info","message":"Retrieved staged files","context":{"staged_files":[],"count":0}}
```

### Test 3: Not in Git Repository

```bash
# Create a temporary directory outside Git
mkdir /tmp/test-cadr
cd /tmp/test-cadr

# Run cadr (should fail gracefully)
node /path/to/cADR/packages/cli/bin/cadr.js
```

**Expected Output**:
- **stdout**: Error message about not being in Git repository
- **Exit code**: 1

### Test 4: Git Not Installed (Simulation)

```bash
# Temporarily rename git command
sudo mv /usr/bin/git /usr/bin/git.backup

# Run cadr (should fail gracefully)
node packages/cli/bin/cadr.js

# Restore git command
sudo mv /usr/bin/git.backup /usr/bin/git
```

**Expected Output**:
- **stdout**: Error message about Git not being installed
- **Exit code**: 1

## Validation Checklist

- [ ] Welcome message displays correctly
- [ ] Staged files are logged as JSON to stderr
- [ ] JSON format is valid and parseable
- [ ] Timestamp is present and in ISO 8601 format
- [ ] Context object contains staged_files array
- [ ] Empty staged files array is handled correctly
- [ ] Error messages are helpful and actionable
- [ ] Exit codes are correct (0 for success, 1 for errors)
- [ ] No crashes or unhandled exceptions

## Troubleshooting

### "Not in a Git repository" Error
- Ensure you're in a directory with a `.git` folder
- Run `git status` to verify Git repository status

### "Git is not installed" Error
- Verify Git is installed: `git --version`
- Ensure Git is in your PATH: `which git`

### JSON Parse Errors
- Check that stderr contains valid JSON
- Verify Pino is configured correctly for stderr output
- Check for any console.log statements interfering with JSON output

### No Output to stderr
- Verify Pino transport configuration
- Check that logger is being called correctly
- Ensure stderr is not being redirected

## Success Criteria

✅ **Feature works correctly when**:
- Staged files are detected and logged
- No staged files are handled gracefully
- Error scenarios show helpful messages
- JSON output is valid and structured
- CLI maintains welcome message functionality

This quickstart validates that the internal plumbing is working correctly and ready for the next user story.
