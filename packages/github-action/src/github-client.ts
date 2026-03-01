import * as github from '@actions/github';

interface GitHubComment {
  id: number;
  body?: string | null;
}

export class GitHubClient {
  private octokit: ReturnType<typeof github.getOctokit>;

  constructor(token: string) {
    this.octokit = github.getOctokit(token);
  }

  async getPRDiff(owner: string, repo: string, prNumber: number): Promise<string> {
    const response = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: {
        format: 'diff'
      }
    });
    return response.data as unknown as string;
  }

  async findExistingComment(owner: string, repo: string, issueNumber: number, marker: string) {
    const comments = await this.octokit.paginate(this.octokit.rest.issues.listComments, {
      owner,
      repo,
      issue_number: issueNumber,
      per_page: 100
    });

    return comments.find((c: GitHubComment) => Boolean(c.body && c.body.includes(marker)));
  }

  async postOrUpdateComment(issueNumber: number, body: string): Promise<void> {
    const context = github.context;
    const { owner, repo } = context.repo;
    const CADR_MARKER = '### 🤖 cADR Analysis';

    const existingComment = await this.findExistingComment(owner, repo, issueNumber, CADR_MARKER);

    if (existingComment) {
      await this.octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
        body
      });
    } else {
      await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body
      });
    }
  }
}
