import { GitHubClient } from '../src/github-client';

const mockOctokit = {
  paginate: jest.fn(),
  rest: {
    issues: {
      listComments: jest.fn(),
      createComment: jest.fn(),
      updateComment: jest.fn()
    }
  }
};

jest.mock(
  '@actions/github',
  () => ({
    getOctokit: jest.fn(() => mockOctokit),
    context: {
      repo: { owner: 'owner', repo: 'repo' }
    }
  }),
  { virtual: true }
);

describe('GitHubClient comment deduplication', () => {
  let client: GitHubClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new GitHubClient('token');
  });

  it('paginates issue comments and updates existing bot comment', async () => {
    const firstPageComments = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      body: `Comment ${i + 1}`
    }));
    const existingBotComment = {
      id: 77,
      body: '### 🤖 cADR Analysis\nOld content'
    };

    mockOctokit.paginate.mockResolvedValue([...firstPageComments, existingBotComment]);

    await client.postOrUpdateComment(123, 'Updated content');

    expect(mockOctokit.paginate).toHaveBeenCalledWith(
      mockOctokit.rest.issues.listComments,
      expect.objectContaining({
        owner: 'owner',
        repo: 'repo',
        issue_number: 123,
        per_page: 100
      })
    );
    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      comment_id: 77,
      body: 'Updated content'
    });
    expect(mockOctokit.rest.issues.createComment).not.toHaveBeenCalled();
  });
});
