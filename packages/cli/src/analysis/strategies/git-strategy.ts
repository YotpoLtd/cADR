import {
  getStagedFiles,
  getStagedDiff,
  getAllChanges,
  getAllDiff,
  getBranchDiffFiles,
  getBranchDiff,
  type DiffOptions,
} from '../../git/git.operations';

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
    return getBranchDiffFiles(this.base, this.head);
  }

  async getDiff(): Promise<string> {
    return getBranchDiff(this.base, this.head);
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
