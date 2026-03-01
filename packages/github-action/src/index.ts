import * as core from '@actions/core';
import * as github from '@actions/github';
import { ActionInputsSchema } from './validation';
import { PRAnalyzer } from './pr-analyzer';
import { GitHubClient } from './github-client';
import { CommentBuilder } from './comment-builder';
import { ActionInputs, PRContext } from './types';

export async function run() {
  try {
    // 1. Parse Inputs
    const inputsRaw = {
      apiKey: core.getInput('api_key', { required: true }),
      provider: core.getInput('provider') || 'openai',
      model: core.getInput('model') || '',
      configPath: core.getInput('config_path') || 'cadr.yaml',
      adrDirectory: core.getInput('adr_directory') || 'docs/adr',
      failOnError: core.getInput('fail_on_error') === 'true',
    };

    const inputs = await ActionInputsSchema.validate(inputsRaw) as ActionInputs;

    // 2. Get PR Context
    const { context } = github;
    if (context.eventName !== 'pull_request' || !context.payload.pull_request) {
      core.warning('This action only runs on pull_request events. Skipping.');
      return;
    }

    const pr = context.payload.pull_request;
    const prContext: PRContext = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      pullNumber: pr.number,
      headSha: pr.head.sha,
      baseSha: pr.base.sha,
      headRef: pr.head.ref,
      baseRef: pr.base.ref,
      title: pr.title,
      author: pr.user.login
    };

    core.info(`Starting cADR analysis for PR #${prContext.pullNumber}: ${prContext.title}`);

    // 3. Initialize Services
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN is not set. Please ensure it is passed to the action.');
    }
    const githubClient = new GitHubClient(token);
    const analyzer = new PRAnalyzer(githubClient, inputs.apiKey);
    const commentBuilder = new CommentBuilder();

    // 4. Analyze
    const { analysisResult, suggestedAdr } = await analyzer.analyze(prContext, inputs);

    // 5. Set Outputs
    core.setOutput('is_significant', analysisResult.is_significant);
    if (analysisResult.is_significant) {
      core.setOutput('analysis_reason', analysisResult.reason);
    }

    // 6. Post Comment
    if (analysisResult.is_significant && suggestedAdr) {
      core.info('Significant changes detected. Generating ADR suggestion.');
      
      const commentBody = commentBuilder.buildAnalysisComment(analysisResult.reason, suggestedAdr);
      await githubClient.postOrUpdateComment(prContext.pullNumber, commentBody);
      
      core.setOutput('adr_suggested', true);
      core.setOutput('adr_path', suggestedAdr.path);
    } else {
      core.info('No significant architectural changes detected.');
      core.setOutput('adr_suggested', false);
      
      // Optional: Post "No changes" comment if requested, but usually silence is golden
    }

  } catch (error: unknown) {
    const failOnError = core.getInput('fail_on_error') === 'true';
    const message = error instanceof Error ? error.message : String(error);
    if (failOnError) {
      core.setFailed(message);
    } else {
      core.warning(`cADR Analysis failed: ${message}`);
      // Don't fail the build, just log warning
    }
  }
}

if (require.main === module) {
  run();
}
