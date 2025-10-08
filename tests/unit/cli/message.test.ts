import { getWelcomeMessage, displayWelcome } from '../../../packages/cli/src/index';

describe('Welcome Message', () => {
  test('includes product name', () => {
    const message = getWelcomeMessage();
    expect(message).toMatch(/cADR/i);
  });

  test('includes version number', () => {
    const message = getWelcomeMessage();
    expect(message).toContain('0.0.1');
  });

  test('includes description', () => {
    const message = getWelcomeMessage();
    expect(message).toMatch(/architectural decision record/i);
  });

  test('is properly formatted with newlines', () => {
    const message = getWelcomeMessage();
    expect(message).toContain('\n');
    expect(message.length).toBeGreaterThan(50);
  });
});

describe('displayWelcome', () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  test('writes welcome message to stdout', () => {
    displayWelcome();
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('Hello, cADR!'));
  });
});

