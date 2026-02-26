import * as core from '@actions/core';
import * as github from '@actions/github';
import { CommentBuilder } from './comment-builder';

interface GitHubComment {
  id: number;
  body?: string | null;
}

interface GitHubContentItem {
  name: string;
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
    });

    return comments.find((c: GitHubComment) => c.body && c.body.includes(marker));
  }

  async postOrUpdateComment(issueNumber: number, body: string): Promise<void> {
    const context = github.context;
    const { owner, repo } = context.repo;

    const existingComment = await this.findExistingComment(owner, repo, issueNumber, CommentBuilder.MARKER);

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

  async getExistingADRs(owner: string, repo: string, ref: string, directory: string): Promise<number[]> {
    try {
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: directory,
        ref
      });

      if (!Array.isArray(contents)) return [];

      return contents
        .filter((file: GitHubContentItem) => file.name.match(/^\d{4}-.*\.md$/))
        .map((file: GitHubContentItem) => parseInt(file.name.substring(0, 4), 10))
        .filter((n: number) => !isNaN(n));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      core.warning(`getExistingADRs failed (${owner}/${repo}, path=${directory}): ${message}`);
      return [];
    }
  }
}
