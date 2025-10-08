# GitModule Contract

**Module**: `@cadr/core/src/git.ts`  
**Purpose**: Provide Git repository interaction capabilities  
**Version**: 1.0.0

## Interface

```typescript
export interface GitModule {
  /**
   * Retrieves the list of staged files in the current Git repository
   * @returns Promise<string[]> Array of staged file paths
   * @throws GitError When Git is not available or repository is invalid
   */
  getStagedFiles(): Promise<string[]>;
}

export class GitError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_GIT_REPO' | 'GIT_NOT_FOUND' | 'GIT_ERROR',
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'GitError';
  }
}
```

## Implementation Requirements

### getStagedFiles() Method

**Command**: `git diff --cached --name-only`

**Success Case**:
- Returns array of staged file paths
- Empty array if no staged files
- File paths are relative to repository root

**Error Cases**:
- `NOT_GIT_REPO`: Not in a Git repository (exit code 128)
- `GIT_NOT_FOUND`: Git command not found (exit code 127)
- `GIT_ERROR`: Other Git errors (permissions, corruption, etc.)

**Error Messages**:
- `NOT_GIT_REPO`: "Not in a Git repository. Please run 'cadr' from within a Git repository."
- `GIT_NOT_FOUND`: "Git is not installed. Please install Git and try again."
- `GIT_ERROR`: "Unable to read Git repository. Please check repository permissions."

## Usage Example

```typescript
import { getStagedFiles } from '@cadr/core';

try {
  const stagedFiles = await getStagedFiles();
  console.log('Staged files:', stagedFiles);
} catch (error) {
  if (error instanceof GitError) {
    console.error(`Git error (${error.code}): ${error.message}`);
    process.exit(1);
  }
  throw error;
}
```

## Testing Requirements

**Unit Tests Must Cover**:
- Successful retrieval of staged files
- Empty result when no staged files
- `NOT_GIT_REPO` error scenario
- `GIT_NOT_FOUND` error scenario  
- `GIT_ERROR` error scenario
- Command format validation

**Mock Strategy**:
- Mock `child_process.exec` function
- Simulate different exit codes and outputs
- Verify command arguments are correct
