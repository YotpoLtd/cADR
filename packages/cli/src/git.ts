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

/**
 * Options for specifying what diff to analyze
 */
export interface DiffOptions {
  mode: 'staged' | 'all' | 'branch-diff';
  base?: string;  // For branch-diff: base git reference (e.g., 'origin/main')
  head?: string;  // For branch-diff: head git reference (e.g., 'HEAD')
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

/**
 * Retrieves the full diff content for staged files
 * Uses minimal context to reduce token usage
 * @returns Promise<string> Full diff content of staged changes
 * @throws GitError When Git is not available or repository is invalid
 */
export async function getStagedDiff(): Promise<string> {
  try {
    // Use --unified=1 for minimal context (1 line before/after instead of 3)
    // This significantly reduces token usage while maintaining readability
    const { stdout } = await execAsync('git diff --cached --unified=1');
    return stdout;
  } catch (error: unknown) {
    // Handle different Git error scenarios (same as getStagedFiles)
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

/**
 * Retrieves the list of all uncommitted files (staged + unstaged) in the current Git repository
 * @returns Promise<string[]> Array of uncommitted file paths
 * @throws GitError When Git is not available or repository is invalid
 */
export async function getUncommittedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('git diff HEAD --name-only');
    
    // Split by newlines and filter out empty strings
    const uncommittedFiles = stdout
      .split('\n')
      .map(file => file.trim())
      .filter(file => file.length > 0);
    
    return uncommittedFiles;
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

/**
 * Retrieves the full diff content for all uncommitted files (staged + unstaged)
 * Uses minimal context to reduce token usage
 * @returns Promise<string> Full diff content of uncommitted changes
 * @throws GitError When Git is not available or repository is invalid
 */
export async function getUncommittedDiff(): Promise<string> {
  try {
    // Use --unified=1 for minimal context (1 line before/after instead of 3)
    // This significantly reduces token usage while maintaining readability
    const { stdout } = await execAsync('git diff HEAD --unified=1');
    return stdout;
  } catch (error: unknown) {
    // Handle different Git error scenarios (same as getUncommittedFiles)
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

/**
 * Generic function to get changed files based on diff options
 * @param options - Diff options specifying which changes to analyze
 * @returns Promise<string[]> Array of changed file paths
 * @throws GitError When Git is not available or repository is invalid
 */
export async function getChangedFiles(options: DiffOptions = { mode: 'all' }): Promise<string[]> {
  switch (options.mode) {
    case 'staged':
      return getStagedFiles();
    case 'all':
      return getUncommittedFiles();
    case 'branch-diff': {
      const base = options.base || 'origin/main';
      const head = options.head || 'HEAD';
      try {
        // Use triple-dot syntax for merge-base diff (standard in CI/CD)
        const { stdout } = await execAsync(`git diff ${base}...${head} --name-only`);
        
        const files = stdout
          .split('\n')
          .map(file => file.trim())
          .filter(file => file.length > 0);
        
        return files;
      } catch (error: unknown) {
        // Handle different Git error scenarios
        const errorWithCode = error as { code?: number };
        
        if (errorWithCode.code === 128) {
          throw new GitError(
            `Invalid git references: ${base}...${head}. Please ensure both references exist.`,
            'GIT_ERROR',
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
        
        throw new GitError(
          'Unable to read Git repository. Please check repository permissions.',
          'GIT_ERROR',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }
}

/**
 * Generic function to get diff content based on diff options
 * @param options - Diff options specifying which changes to analyze
 * @returns Promise<string> Full diff content
 * @throws GitError When Git is not available or repository is invalid
 */
export async function getDiff(options: DiffOptions = { mode: 'all' }): Promise<string> {
  switch (options.mode) {
    case 'staged':
      return getStagedDiff();
    case 'all':
      return getUncommittedDiff();
    case 'branch-diff': {
      const base = options.base || 'origin/main';
      const head = options.head || 'HEAD';
      try {
        // Use triple-dot syntax for merge-base diff with minimal context
        const { stdout } = await execAsync(`git diff ${base}...${head} --unified=1`);
        return stdout;
      } catch (error: unknown) {
        // Handle different Git error scenarios
        const errorWithCode = error as { code?: number };
        
        if (errorWithCode.code === 128) {
          throw new GitError(
            `Invalid git references: ${base}...${head}. Please ensure both references exist.`,
            'GIT_ERROR',
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
        
        throw new GitError(
          'Unable to read Git repository. Please check repository permissions.',
          'GIT_ERROR',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }
}
