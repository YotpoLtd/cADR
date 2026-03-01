import { showVersion } from './index';

jest.mock('./commands/init', () => ({ initCommand: jest.fn() }));
jest.mock('./commands/analyze', () => ({ analyzeCommand: jest.fn() }));
jest.mock('./commands/status', () => ({ statusCommand: jest.fn() }));

describe('showVersion', () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  test('writes to process.stdout', () => {
    showVersion();
    expect(stdoutSpy).toHaveBeenCalled();
  });

  test('output contains cADR version', () => {
    showVersion();
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toContain('cADR version');
  });

  test('output version string matches semver pattern', () => {
    showVersion();
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toMatch(/\d+\.\d+\.\d+/);
  });

  test('output contains the version from package.json', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    showVersion();
    const output = stdoutSpy.mock.calls[0][0] as string;
    expect(output).toContain(pkg.version);
  });
});
