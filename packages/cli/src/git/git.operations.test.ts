const mockExecAsync = jest.fn();
jest.mock('child_process', () => ({ exec: jest.fn() }));
jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: jest.fn(() => mockExecAsync),
}));

import { GitError } from './git.errors';
import {
  getStagedFiles,
  getStagedDiff,
  getAllChanges,
  getAllDiff,
  getChangedFiles,
  getDiff,
} from './git.operations';

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// handleGitError (tested indirectly through any git command call)
// ---------------------------------------------------------------------------
describe('handleGitError', () => {
  it('throws GitError with code NOT_GIT_REPO when exec fails with code 128', async () => {
    const error = Object.assign(new Error('fatal: not a git repository'), { code: 128 });
    mockExecAsync.mockRejectedValue(error);

    const promise = getStagedFiles();
    await expect(promise).rejects.toThrow(GitError);
    await expect(promise).rejects.toMatchObject({ code: 'NOT_GIT_REPO' });
  });

  it('throws GitError with code GIT_NOT_FOUND when exec fails with code 127', async () => {
    const error = Object.assign(new Error('git: command not found'), { code: 127 });
    mockExecAsync.mockRejectedValue(error);

    await expect(getStagedFiles()).rejects.toThrow(GitError);
    await expect(getStagedFiles()).rejects.toMatchObject({ code: 'GIT_NOT_FOUND' });
  });

  it('throws GitError with code GIT_ERROR when exec fails with other code', async () => {
    const error = Object.assign(new Error('unknown error'), { code: 1 });
    mockExecAsync.mockRejectedValue(error);

    await expect(getStagedFiles()).rejects.toThrow(GitError);
    await expect(getStagedFiles()).rejects.toMatchObject({ code: 'GIT_ERROR' });
  });
});

// ---------------------------------------------------------------------------
// getStagedFiles
// ---------------------------------------------------------------------------
describe('getStagedFiles', () => {
  it('returns array of filenames from stdout', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: 'file1.ts\nfile2.ts\nfile3.ts\n' });

    const result = await getStagedFiles();

    expect(result).toEqual(['file1.ts', 'file2.ts', 'file3.ts']);
  });

  it('returns empty array when stdout is empty', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: '' });

    const result = await getStagedFiles();

    expect(result).toEqual([]);
  });

  it('filters blank lines from stdout', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: 'file1.ts\n\nfile2.ts\n\n' });

    const result = await getStagedFiles();

    expect(result).toEqual(['file1.ts', 'file2.ts']);
  });
});

// ---------------------------------------------------------------------------
// getStagedDiff
// ---------------------------------------------------------------------------
describe('getStagedDiff', () => {
  it('returns raw diff string from stdout', async () => {
    const diff = 'diff --git a/file.ts b/file.ts\n+added line\n';
    mockExecAsync.mockResolvedValueOnce({ stdout: diff });

    const result = await getStagedDiff();

    expect(result).toBe(diff);
  });
});

// ---------------------------------------------------------------------------
// getAllChanges
// ---------------------------------------------------------------------------
describe('getAllChanges', () => {
  it('returns array of filenames', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: 'a.ts\nb.ts\n' });

    const result = await getAllChanges();

    expect(result).toEqual(['a.ts', 'b.ts']);
  });

  it('runs git diff HEAD --name-only command', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: '' });

    await getAllChanges();

    expect(mockExecAsync).toHaveBeenCalledWith('git diff HEAD --name-only');
  });
});

// ---------------------------------------------------------------------------
// getAllDiff
// ---------------------------------------------------------------------------
describe('getAllDiff', () => {
  it('returns raw diff string', async () => {
    const diff = 'diff --git a/x.ts b/x.ts\n-removed\n+added\n';
    mockExecAsync.mockResolvedValueOnce({ stdout: diff });

    const result = await getAllDiff();

    expect(result).toBe(diff);
  });

  it('runs git diff HEAD --unified=1 command', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: '' });

    await getAllDiff();

    expect(mockExecAsync).toHaveBeenCalledWith('git diff HEAD --unified=1');
  });
});

// ---------------------------------------------------------------------------
// getChangedFiles
// ---------------------------------------------------------------------------
describe('getChangedFiles', () => {
  it('delegates to getStagedFiles when mode is staged', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: 'staged.ts\n' });

    const result = await getChangedFiles({ mode: 'staged' });

    expect(mockExecAsync).toHaveBeenCalledWith('git diff --cached --name-only');
    expect(result).toEqual(['staged.ts']);
  });

  it('delegates to getAllChanges when mode is all', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: 'all.ts\n' });

    const result = await getChangedFiles({ mode: 'all' });

    expect(mockExecAsync).toHaveBeenCalledWith('git diff HEAD --name-only');
    expect(result).toEqual(['all.ts']);
  });

  it('delegates to getAllChanges when mode is branch-diff (fallback)', async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: 'branch.ts\n' });

    const result = await getChangedFiles({ mode: 'branch-diff' });

    expect(mockExecAsync).toHaveBeenCalledWith('git diff HEAD --name-only');
    expect(result).toEqual(['branch.ts']);
  });
});

// ---------------------------------------------------------------------------
// getDiff
// ---------------------------------------------------------------------------
describe('getDiff', () => {
  it('delegates to getStagedDiff when mode is staged', async () => {
    const diff = 'staged diff content';
    mockExecAsync.mockResolvedValueOnce({ stdout: diff });

    const result = await getDiff({ mode: 'staged' });

    expect(mockExecAsync).toHaveBeenCalledWith('git diff --cached --unified=1');
    expect(result).toBe(diff);
  });

  it('delegates to getAllDiff when mode is all', async () => {
    const diff = 'all diff content';
    mockExecAsync.mockResolvedValueOnce({ stdout: diff });

    const result = await getDiff({ mode: 'all' });

    expect(mockExecAsync).toHaveBeenCalledWith('git diff HEAD --unified=1');
    expect(result).toBe(diff);
  });

  it('delegates to getAllDiff when mode is branch-diff (fallback)', async () => {
    const diff = 'branch diff content';
    mockExecAsync.mockResolvedValueOnce({ stdout: diff });

    const result = await getDiff({ mode: 'branch-diff' });

    expect(mockExecAsync).toHaveBeenCalledWith('git diff HEAD --unified=1');
    expect(result).toBe(diff);
  });
});

// ---------------------------------------------------------------------------
// parseFileList (tested indirectly)
// ---------------------------------------------------------------------------
describe('parseFileList (indirect)', () => {
  it('multi-line stdout with trailing newline returns only non-empty trimmed entries', async () => {
    mockExecAsync.mockResolvedValueOnce({
      stdout: '  file1.ts \nfile2.ts\n  \n file3.ts\n',
    });

    const result = await getStagedFiles();

    expect(result).toEqual(['file1.ts', 'file2.ts', 'file3.ts']);
  });
});
