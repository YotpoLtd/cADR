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
