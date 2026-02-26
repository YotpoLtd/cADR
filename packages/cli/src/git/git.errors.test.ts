import { GitError } from './git.errors';

describe('GitError', () => {
  it('should set message, code, and name for NOT_GIT_REPO', () => {
    const error = new GitError('msg', 'NOT_GIT_REPO');

    expect(error.message).toBe('msg');
    expect(error.code).toBe('NOT_GIT_REPO');
    expect(error.name).toBe('GitError');
  });

  it('should set code to GIT_NOT_FOUND', () => {
    const error = new GitError('msg', 'GIT_NOT_FOUND');

    expect(error.code).toBe('GIT_NOT_FOUND');
  });

  it('should set code to GIT_ERROR', () => {
    const error = new GitError('msg', 'GIT_ERROR');

    expect(error.code).toBe('GIT_ERROR');
  });

  it('should store originalError when provided', () => {
    const original = new Error('original');
    const error = new GitError('msg', 'GIT_ERROR', original);

    expect(error.originalError).toBe(original);
  });

  it('should have undefined originalError when not provided', () => {
    const error = new GitError('msg', 'GIT_ERROR');

    expect(error.originalError).toBeUndefined();
  });

  it('should be an instance of both Error and GitError', () => {
    const error = new GitError('msg', 'NOT_GIT_REPO');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof GitError).toBe(true);
  });
});
