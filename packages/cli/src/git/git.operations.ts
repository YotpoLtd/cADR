import { exec } from 'child_process';
import { promisify } from 'util';
import { GitError } from './git.errors';

const execAsync = promisify(exec);

export interface DiffOptions {
  mode: 'staged' | 'all' | 'branch-diff';
  base?: string;
  head?: string;
}

function handleGitError(error: unknown, operation: string): never {
  const errorWithCode = error as { code?: number };

  if (errorWithCode.code === 128) {
    throw new GitError(
      `Not in a Git repository. Please run 'cadr' from within a Git repository.`,
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

  throw new GitError(
    `Unable to ${operation}. Please check repository permissions.`,
    'GIT_ERROR',
    error instanceof Error ? error : new Error(String(error))
  );
}

async function execGitCommand(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command);
    return stdout;
  } catch (error) {
    handleGitError(error, command.split(' ')[1] || 'execute git command');
  }
}

function parseFileList(stdout: string): string[] {
  return stdout
    .split('\n')
    .map((file) => file.trim())
    .filter((file) => file.length > 0);
}

export async function getStagedFiles(): Promise<string[]> {
  const stdout = await execGitCommand('git diff --cached --name-only');
  return parseFileList(stdout);
}

export async function getStagedDiff(): Promise<string> {
  return execGitCommand('git diff --cached --unified=1');
}

export async function getAllChanges(): Promise<string[]> {
  const stdout = await execGitCommand('git diff HEAD --name-only');
  return parseFileList(stdout);
}

export async function getAllDiff(): Promise<string> {
  return execGitCommand('git diff HEAD --unified=1');
}

export async function getChangedFiles(options: DiffOptions): Promise<string[]> {
  if (options.mode === 'staged') {
    return getStagedFiles();
  }
  return getAllChanges();
}

export async function getDiff(options: DiffOptions): Promise<string> {
  if (options.mode === 'staged') {
    return getStagedDiff();
  }
  return getAllDiff();
}
