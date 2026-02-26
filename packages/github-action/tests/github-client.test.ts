import { GitHubClient } from '../src/github-client';

// Mock octokit
const mockOctokit = {
  paginate: jest.fn(async (method: (params: object) => Promise<{ data: unknown[] }>, params: object) => {
    const result = await method(params);
    return result.data;
  }),
  rest: {
    issues: {
      listComments: jest.fn(),
      createComment: jest.fn(),
      updateComment: jest.fn()
    },
    pulls: {
      get: jest.fn()
    },
    repos: {
      getContent: jest.fn()
    }
  }
};

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(() => mockOctokit),
  context: {
    repo: { owner: 'owner', repo: 'repo' }
  }
}));

describe('GitHubClient Deduplication', () => {
  let client: GitHubClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new GitHubClient('token');
  });

  it('should create new comment when no existing comment found', async () => {
    mockOctokit.rest.issues.listComments.mockResolvedValue({ data: [] });

    await client.postOrUpdateComment(123, 'New comment');

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 123,
      body: 'New comment'
    });
    expect(mockOctokit.rest.issues.updateComment).not.toHaveBeenCalled();
  });

  it('should update existing comment when found', async () => {
    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: [
        { id: 1, body: 'Some other comment' },
        { id: 2, body: '### 🤖 cADR Analysis\nOld content' }
      ]
    });

    await client.postOrUpdateComment(123, 'New content');

    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 2,
      body: 'New content'
    });
    expect(mockOctokit.rest.issues.createComment).not.toHaveBeenCalled();
  });
});

describe('GitHubClient getPRDiff', () => {
  let client: GitHubClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new GitHubClient('token');
  });

  it('should return diff string from octokit pulls.get', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({ data: 'diff --git a/file.ts b/file.ts\n+new line' });

    const diff = await client.getPRDiff('owner', 'repo', 42);

    expect(diff).toBe('diff --git a/file.ts b/file.ts\n+new line');
    expect(mockOctokit.rest.pulls.get).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 42,
      mediaType: { format: 'diff' }
    });
  });

  it('should return empty string when diff is empty', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({ data: '' });

    const diff = await client.getPRDiff('owner', 'repo', 1);

    expect(diff).toBe('');
  });
});

describe('GitHubClient getExistingADRs', () => {
  let client: GitHubClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new GitHubClient('token');
  });

  it('should return list of ADR numbers from repo contents', async () => {
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: [
        { name: '0001-initial-architecture.md' },
        { name: '0002-database-choice.md' },
        { name: '0010-api-redesign.md' },
        { name: 'README.md' },
        { name: 'template.md' },
      ]
    });

    const result = await client.getExistingADRs('owner', 'repo', 'main', 'docs/adr');

    expect(result).toEqual([1, 2, 10]);
    expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      path: 'docs/adr',
      ref: 'main'
    });
  });

  it('should return empty array when directory does not exist (404)', async () => {
    mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));

    const result = await client.getExistingADRs('owner', 'repo', 'main', 'docs/adr');

    expect(result).toEqual([]);
  });

  it('should return empty array when directory has no ADR files', async () => {
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: [
        { name: 'README.md' },
        { name: 'template.md' },
      ]
    });

    const result = await client.getExistingADRs('owner', 'repo', 'main', 'docs/adr');

    expect(result).toEqual([]);
  });
});

describe('GitHubClient postOrUpdateComment error handling', () => {
  let client: GitHubClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new GitHubClient('token');
  });

  it('should propagate error when listComments throws', async () => {
    mockOctokit.rest.issues.listComments.mockRejectedValue(new Error('API rate limit exceeded'));

    await expect(client.postOrUpdateComment(123, 'body'))
      .rejects.toThrow('API rate limit exceeded');

    expect(mockOctokit.rest.issues.createComment).not.toHaveBeenCalled();
    expect(mockOctokit.rest.issues.updateComment).not.toHaveBeenCalled();
  });
});
