import { run } from '../src/index';
import * as core from '@actions/core';

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('../src/pr-analyzer');

describe('Error Handling', () => {
  it('should fail if failOnError is true', async () => {
     (core.getInput as jest.Mock).mockImplementation((name) => {
      if (name === 'fail_on_error') return 'true';
      throw new Error('Critical Error');
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('Critical Error'));
  });
});
