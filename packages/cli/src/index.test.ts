import { showHelp, showVersion } from './index';

describe('CLI Help', () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  test('showHelp displays product name', () => {
    showHelp();
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('cADR'));
  });

  test('showHelp displays available commands', () => {
    showHelp();
    const output = stdoutSpy.mock.calls[0][0];
    expect(output).toContain('init');
    expect(output).toContain('analyze');
    expect(output).toContain('status');
    expect(output).toContain('help');
  });

  test('showHelp displays usage examples', () => {
    showHelp();
    const output = stdoutSpy.mock.calls[0][0];
    expect(output).toContain('USAGE');
    expect(output).toContain('COMMANDS');
    expect(output).toContain('OPTIONS');
    expect(output).toContain('EXAMPLES');
  });

  test('showHelp displays version info', () => {
    showHelp();
    const output = stdoutSpy.mock.calls[0][0];
    expect(output).toContain('0.0.1');
  });
});

describe('CLI Version', () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  test('showVersion displays version information', () => {
    showVersion();
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('cADR version'));
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('0.0.1'));
  });
});
