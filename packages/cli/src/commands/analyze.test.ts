import { analyzeCommand } from './analyze';
import { runAnalysis } from '../analysis/analysis.orchestrator';
import { loggerInstance as logger } from '../logger';

jest.mock('../analysis/analysis.orchestrator');
jest.mock('../logger');

const mockRunAnalysis = runAnalysis as jest.MockedFunction<typeof runAnalysis>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('analyzeCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunAnalysis.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call runAnalysis with mode "all" when no args provided', async () => {
    await analyzeCommand([]);

    expect(mockRunAnalysis).toHaveBeenCalledWith({ mode: 'all' });
  });

  it('should call runAnalysis with mode "all" when --all flag is provided', async () => {
    await analyzeCommand(['--all']);

    expect(mockRunAnalysis).toHaveBeenCalledWith({ mode: 'all' });
  });

  it('should call runAnalysis with mode "staged" when --staged flag is provided', async () => {
    await analyzeCommand(['--staged']);

    expect(mockRunAnalysis).toHaveBeenCalledWith({ mode: 'staged' });
  });

  it('should call runAnalysis with mode "branch-diff" and base when --base is provided', async () => {
    await analyzeCommand(['--base', 'origin/main']);

    expect(mockRunAnalysis).toHaveBeenCalledWith({
      mode: 'branch-diff',
      base: 'origin/main',
    });
  });

  it('should call runAnalysis with mode "branch-diff", base and head when both flags are provided', async () => {
    await analyzeCommand(['--base', 'origin/main', '--head', 'feature']);

    expect(mockRunAnalysis).toHaveBeenCalledWith({
      mode: 'branch-diff',
      base: 'origin/main',
      head: 'feature',
    });
  });

  it('should fall back to mode "all" when --base has no value after it', async () => {
    await analyzeCommand(['--base']);

    expect(mockRunAnalysis).toHaveBeenCalledWith({ mode: 'all' });
  });

  it('should detect --staged flag anywhere in the args array', async () => {
    await analyzeCommand(['analyze', '--staged']);

    expect(mockRunAnalysis).toHaveBeenCalledWith({ mode: 'staged' });
  });

  it('should catch errors from runAnalysis and not re-throw', async () => {
    mockRunAnalysis.mockRejectedValue(new Error('analysis failed'));

    await expect(analyzeCommand(['--all'])).resolves.not.toThrow();
  });

  it('should log "Analyze command started" with mode information', async () => {
    await analyzeCommand(['--staged']);

    expect(mockLogger.info).toHaveBeenCalledWith('Analyze command started', {
      mode: 'staged',
      base: undefined,
      head: undefined,
    });
  });

  it('should log "Analyze command completed" on success', async () => {
    await analyzeCommand([]);

    expect(mockLogger.info).toHaveBeenCalledWith('Analyze command completed');
  });
});
