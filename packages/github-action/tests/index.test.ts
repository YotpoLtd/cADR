import { run } from '../src/index';
import * as core from '@actions/core';
import * as github from '@actions/github';

// Mock everything
jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('../src/pr-analyzer');
jest.mock('../src/github-client');
jest.mock('../src/comment-builder');

describe('Action Entrypoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default context
    (github as unknown as Record<string, unknown>).context = {
      eventName: 'pull_request',
      repo: { owner: 'owner', repo: 'repo' },
      payload: {
        pull_request: {
          number: 1,
          head: { sha: 'head', ref: 'feat' },
          base: { sha: 'base', ref: 'main' },
          title: 'Title',
          user: { login: 'user' }
        }
      }
    };
  });

  it('should run successfully for significant changes', async () => {
    // Setup inputs
    (core.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'api_key') return 'key';
      return '';
    });

    // Run action
    await run();

    // Verify it didn't fail
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it('should catch errors and log warning (fail-open)', async () => {
    // Force error
    // Force error on api_key, but allow fail_on_error to be read
    (core.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'api_key') throw new Error('API Error');
      return '';
    });

    await run();

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('API Error'));
  });
});
