# Research: Internal Plumbing - Git Integration and Structured Logging

**Feature**: 002-internal-plumbing  
**Date**: 2025-01-27  
**Status**: Complete

## Research Tasks

### 1. Git Integration Strategy

**Decision**: Shell out to `git` CLI directly using Node.js `child_process.exec`  
**Rationale**: 
- Git CLI is universally available and well-tested
- No additional dependencies required
- Simple error handling with exit codes
- Standard approach for Git tooling

**Command**: `git diff --cached --name-only`
- `--cached`: Only show staged changes
- `--name-only`: Only return file paths, not diff content
- Returns one file path per line, empty if no staged files

**Error Handling Strategy**:
- Exit code 128: Not a git repository
- Exit code 127: Git command not found
- Exit code 1: Other Git errors (permissions, corruption)

**Alternatives Considered**:
- `simple-git` npm package: Adds dependency, but provides better error handling
- `isomorphic-git`: Pure JS implementation, but complex for simple use case
- `nodegit`: Native bindings, overkill for this use case

### 2. Structured Logging Library

**Decision**: Use `pino` for structured JSON logging  
**Rationale**:
- Fastest Node.js logger (benchmarks show 5x faster than winston)
- Minimal dependencies
- Built-in JSON formatting
- Production-ready with excellent performance
- Easy to configure for stderr output

**Configuration**:
```javascript
const pino = require('pino');
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino/file',
    options: { destination: 2 } // stderr
  }
});
```

**Log Schema Compliance**:
- `timestamp`: Automatic ISO 8601 format
- `level`: Standard levels (info, warn, error)
- `message`: User-provided message
- `context`: Optional structured data

**Alternatives Considered**:
- `winston`: More features but slower, larger bundle
- `bunyan`: Good but less active development
- Custom implementation: Not worth the maintenance burden

### 3. Error Message Design

**Decision**: Provide helpful, actionable error messages  
**Rationale**: 
- Users need to understand what went wrong
- Clear next steps for resolution
- Professional user experience

**Error Messages**:
- "Not in a Git repository. Please run 'cadr' from within a Git repository."
- "Git is not installed. Please install Git and try again."
- "Unable to read Git repository. Please check repository permissions."

**Error Handling Pattern**:
- Catch all Git command errors
- Parse exit codes to determine error type
- Display helpful message to stdout
- Exit with appropriate code (0 for success, 1 for errors)

### 4. Module Architecture

**Decision**: Create separate modules for Git and Logging concerns  
**Rationale**:
- Single Responsibility Principle
- Easy to test in isolation
- Reusable across different entry points
- Clear separation of concerns

**GitModule Interface**:
```typescript
export interface GitModule {
  getStagedFiles(): Promise<string[]>;
}
```

**LoggerModule Interface**:
```typescript
export interface LoggerModule {
  info(message: string, context?: object): void;
  warn(message: string, context?: object): void;
  error(message: string, context?: object): void;
}
```

### 5. Testing Strategy

**Decision**: Mock `child_process.exec` for GitModule tests  
**Rationale**:
- Isolate unit tests from system dependencies
- Control error scenarios precisely
- Fast test execution
- Reliable test results

**Mocking Approach**:
```typescript
jest.mock('child_process');
const { exec } = require('child_process');

// Mock successful git command
exec.mockImplementation((command, callback) => {
  callback(null, 'file1.ts\nfile2.ts\n', '');
});
```

**Logger Testing**:
- Capture stderr output
- Parse JSON logs
- Verify structure and content
- Test different log levels

### 6. CLI Integration Pattern

**Decision**: Preserve welcome message, add Git functionality  
**Rationale**:
- Maintains Story #1 functionality
- Clear progression of features
- User can see both welcome and Git output
- Non-breaking change

**CLI Flow**:
1. Display welcome message (existing)
2. Get staged files from GitModule
3. Log staged files using LoggerModule
4. Handle errors gracefully

### 7. Performance Considerations

**Git Command Performance**:
- `git diff --cached --name-only` is very fast
- Only reads index, not working directory
- Minimal data transfer
- Should complete in <100ms for typical repos

**Logging Performance**:
- Pino is optimized for speed
- JSON serialization is minimal overhead
- stderr output is non-blocking
- Should not impact CLI responsiveness

### 8. Cross-Platform Compatibility

**Git Command**:
- `git diff --cached --name-only` works on all platforms
- Git handles path separators correctly
- No platform-specific code needed

**Node.js child_process**:
- `exec()` works consistently across platforms
- Error handling is platform-agnostic
- No additional platform detection needed

## Research Output Summary

All technical decisions are established with clear rationale. The approach is:
- Simple and reliable (Git CLI + Pino)
- Well-tested patterns (child_process.exec)
- Performance-optimized (Pino logging)
- Easy to test (mockable dependencies)
- Cross-platform compatible

**Dependencies to Add**:
- `pino@^8.x` to `cadr-cli` package

**No External Research Required**: All technologies are well-documented and established.
