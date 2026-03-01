import {
  StagedChangesStrategy,
  AllChangesStrategy,
  BranchDiffStrategy,
  createGitStrategy,
} from './git-strategy';
import { GitError } from '../../git/git.errors';
import {
  getStagedFiles,
  getStagedDiff,
  getAllChanges,
  getAllDiff,
  type DiffOptions,
} from '../../git/git.operations';

jest.mock('../../git/git.operations');

let mockExecAsync: jest.Mock;

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

jest.mock('util', () => {
  const actual = jest.requireActual('util');
  return {
    ...actual,
    promisify: jest.fn(() => (...args: unknown[]) => mockExecAsync(...args)),
  };
});

const mockedGetStagedFiles = getStagedFiles as jest.MockedFunction<typeof getStagedFiles>;
const mockedGetStagedDiff = getStagedDiff as jest.MockedFunction<typeof getStagedDiff>;
const mockedGetAllChanges = getAllChanges as jest.MockedFunction<typeof getAllChanges>;
const mockedGetAllDiff = getAllDiff as jest.MockedFunction<typeof getAllDiff>;

beforeEach(() => {
  mockExecAsync = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('StagedChangesStrategy', () => {
  let strategy: StagedChangesStrategy;

  beforeEach(() => {
    strategy = new StagedChangesStrategy();
  });

  it('getFiles() delegates to getStagedFiles', async () => {
    const files = ['src/a.ts', 'src/b.ts'];
    mockedGetStagedFiles.mockResolvedValue(files);

    const result = await strategy.getFiles();

    expect(result).toEqual(files);
    expect(getStagedFiles).toHaveBeenCalledTimes(1);
  });

  it('getDiff() delegates to getStagedDiff', async () => {
    const diff = 'diff --git a/file.ts b/file.ts\n+added line';
    mockedGetStagedDiff.mockResolvedValue(diff);

    const result = await strategy.getDiff();

    expect(result).toBe(diff);
    expect(getStagedDiff).toHaveBeenCalledTimes(1);
  });
});

describe('AllChangesStrategy', () => {
  let strategy: AllChangesStrategy;

  beforeEach(() => {
    strategy = new AllChangesStrategy();
  });

  it('getFiles() delegates to getAllChanges', async () => {
    const files = ['lib/x.ts'];
    mockedGetAllChanges.mockResolvedValue(files);

    const result = await strategy.getFiles();

    expect(result).toEqual(files);
    expect(getAllChanges).toHaveBeenCalledTimes(1);
  });

  it('getDiff() delegates to getAllDiff', async () => {
    const diff = 'diff output here';
    mockedGetAllDiff.mockResolvedValue(diff);

    const result = await strategy.getDiff();

    expect(result).toBe(diff);
    expect(getAllDiff).toHaveBeenCalledTimes(1);
  });
});

describe('BranchDiffStrategy', () => {
  let strategy: BranchDiffStrategy;

  beforeEach(() => {
    strategy = new BranchDiffStrategy('main', 'feat/test');
  });

  describe('getFiles()', () => {
    it('parses stdout newline list and returns array of files', async () => {
      mockExecAsync.mockResolvedValue({
        stdout: 'src/a.ts\nsrc/b.ts\n',
        stderr: '',
      });

      const result = await strategy.getFiles();

      expect(result).toEqual(['src/a.ts', 'src/b.ts']);
    });

    it('throws GitError with "Invalid git reference" when exec fails with code 128', async () => {
      const execError = Object.assign(new Error('fatal: bad revision'), { code: 128 });
      mockExecAsync.mockRejectedValue(execError);

      await expect(strategy.getFiles()).rejects.toThrow(GitError);
      await expect(strategy.getFiles()).rejects.toThrow(/Invalid git reference/);
    });

    it('throws GitError with "Unable to read Git repository" when exec fails with other code', async () => {
      const execError = Object.assign(new Error('some error'), { code: 1 });
      mockExecAsync.mockRejectedValue(execError);

      await expect(strategy.getFiles()).rejects.toThrow(GitError);
      await expect(strategy.getFiles()).rejects.toThrow(/Unable to read Git repository/);
    });
  });

  describe('getDiff()', () => {
    it('returns raw stdout on success', async () => {
      const diffOutput = 'diff --git a/file.ts b/file.ts\n+new line';
      mockExecAsync.mockResolvedValue({
        stdout: diffOutput,
        stderr: '',
      });

      const result = await strategy.getDiff();

      expect(result).toBe(diffOutput);
    });

    it('throws GitError when exec fails with code 128', async () => {
      const execError = Object.assign(new Error('fatal: bad revision'), { code: 128 });
      mockExecAsync.mockRejectedValue(execError);

      await expect(strategy.getDiff()).rejects.toThrow(GitError);
      await expect(strategy.getDiff()).rejects.toThrow(/Invalid git reference/);
    });

    it('throws GitError when exec fails with other code', async () => {
      const execError = Object.assign(new Error('permission denied'), { code: 2 });
      mockExecAsync.mockRejectedValue(execError);

      await expect(strategy.getDiff()).rejects.toThrow(GitError);
      await expect(strategy.getDiff()).rejects.toThrow(/Unable to read Git repository/);
    });
  });

  it('uses correct base and head in git commands', async () => {
    const customStrategy = new BranchDiffStrategy('origin/develop', 'feature/abc');
    mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });

    await customStrategy.getFiles();
    expect(mockExecAsync).toHaveBeenCalledWith(
      'git diff --name-only origin/develop...feature/abc'
    );

    mockExecAsync.mockClear();

    await customStrategy.getDiff();
    expect(mockExecAsync).toHaveBeenCalledWith(
      'git diff origin/develop...feature/abc --unified=1'
    );
  });
});

describe('createGitStrategy', () => {
  it('returns StagedChangesStrategy for mode "staged"', () => {
    const strategy = createGitStrategy({ mode: 'staged' });

    expect(strategy).toBeInstanceOf(StagedChangesStrategy);
  });

  it('returns AllChangesStrategy for mode "all"', () => {
    const strategy = createGitStrategy({ mode: 'all' });

    expect(strategy).toBeInstanceOf(AllChangesStrategy);
  });

  it('returns BranchDiffStrategy for mode "branch-diff"', () => {
    const strategy = createGitStrategy({ mode: 'branch-diff', base: 'main', head: 'feat' });

    expect(strategy).toBeInstanceOf(BranchDiffStrategy);
  });

  it('returns AllChangesStrategy for unknown mode (default case)', () => {
    const strategy = createGitStrategy({ mode: 'unknown' as unknown as DiffOptions['mode'] });

    expect(strategy).toBeInstanceOf(AllChangesStrategy);
  });
});
