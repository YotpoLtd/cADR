import { GitError } from '../../../packages/cli/src/git';

describe('GitModule', () => {
  describe('GitError', () => {
    it('should create GitError with correct properties', () => {
      const originalError = new Error('Original error');
      const gitError = new GitError('Test error', 'GIT_ERROR', originalError);

      expect(gitError.message).toBe('Test error');
      expect(gitError.code).toBe('GIT_ERROR');
      expect(gitError.originalError).toBe(originalError);
      expect(gitError.name).toBe('GitError');
    });

    it('should create GitError without original error', () => {
      const gitError = new GitError('Test error', 'NOT_GIT_REPO');

      expect(gitError.message).toBe('Test error');
      expect(gitError.code).toBe('NOT_GIT_REPO');
      expect(gitError.originalError).toBeUndefined();
    });

    it('should handle different error codes', () => {
      const notGitRepoError = new GitError('Not in a Git repository', 'NOT_GIT_REPO');
      const gitNotFoundError = new GitError('Git is not installed', 'GIT_NOT_FOUND');
      const gitError = new GitError('Unable to read Git repository', 'GIT_ERROR');

      expect(notGitRepoError.code).toBe('NOT_GIT_REPO');
      expect(gitNotFoundError.code).toBe('GIT_NOT_FOUND');
      expect(gitError.code).toBe('GIT_ERROR');
    });
  });
});