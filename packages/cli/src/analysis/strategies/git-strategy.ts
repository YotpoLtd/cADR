import {
  getStagedFiles,
  getStagedDiff,
  getAllChanges,
  getAllDiff,
  type DiffOptions,
} from '../../git/git.operations';
import { GitError } from '../../git';

export interface GitStrategy {
  getFiles(): Promise<string[]>;
  getDiff(): Promise<string>;
}

export class StagedChangesStrategy implements GitStrategy {
  async getFiles(): Promise<string[]> {
    return getStagedFiles();
  }

  async getDiff(): Promise<string> {
    return getStagedDiff();
  }
}

export class AllChangesStrategy implements GitStrategy {
  async getFiles(): Promise<string[]> {
    return getAllChanges();
  }

  async getDiff(): Promise<string> {
    return getAllDiff();
  }
}

export class BranchDiffStrategy implements GitStrategy {
  constructor(
    private base: string,
    private head: string
  ) {}

  async getFiles(): Promise<string[]> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync(`git diff --name-only ${this.base}...${this.head}`);
      return stdout
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
    } catch (error) {
      const errorWithCode = error as { code?: number };
      if (errorWithCode.code === 128) {
        throw new GitError(
          `Invalid git reference: ${this.base} or ${this.head}. Please ensure both references exist.`,
          'GIT_ERROR',
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

  async getDiff(): Promise<string> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync(`git diff ${this.base}...${this.head} --unified=1`);
      return stdout;
    } catch (error) {
      const errorWithCode = error as { code?: number };
      if (errorWithCode.code === 128) {
        throw new GitError(
          `Invalid git reference: ${this.base} or ${this.head}. Please ensure both references exist.`,
          'GIT_ERROR',
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

export function createGitStrategy(options: DiffOptions): GitStrategy {
  switch (options.mode) {
    case 'staged':
      return new StagedChangesStrategy();
    case 'all':
      return new AllChangesStrategy();
    case 'branch-diff':
      return new BranchDiffStrategy(options.base || 'origin/main', options.head || 'HEAD');
    default:
      return new AllChangesStrategy();
  }
}
