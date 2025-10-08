import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

export interface GitModule {
  getStagedFiles(): Promise<string[]>;
}

/**
 * Retrieves the list of staged files in the current Git repository
 * @returns Promise<string[]> Array of staged file paths
 * @throws GitError When Git is not available or repository is invalid
 */
export async function getStagedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('git diff --cached --name-only');
    
    // Split by newlines and filter out empty strings
    const stagedFiles = stdout
      .split('\n')
      .map(file => file.trim())
      .filter(file => file.length > 0);
    
    return stagedFiles;
  } catch (error: unknown) {
    // Handle different Git error scenarios
    const errorWithCode = error as { code?: number };
    
    if (errorWithCode.code === 128) {
      throw new GitError(
        'Not in a Git repository. Please run \'cadr\' from within a Git repository.',
        'NOT_GIT_REPO',
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    if (errorWithCode.code === 127) {
      throw new GitError(
        'Git is not installed. Please install Git and try again.',
        'GIT_NOT_FOUND',
        error instanceof Error ? error : new Error(String(error))
      );
    }
    
    // Handle other Git errors (permissions, corruption, etc.)
    throw new GitError(
      'Unable to read Git repository. Please check repository permissions.',
      'GIT_ERROR',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
