jest.mock('../config');
jest.mock('../llm/prompts');
jest.mock('../llm/llm');
jest.mock('../logger');
jest.mock('../adr/adr');
jest.mock('./strategies/git-strategy');
jest.mock('../presenters/console-presenter');

import { loadConfig, getDefaultConfigPath } from '../config';
import {
  formatPrompt,
  formatGenerationPrompt,
  promptForGeneration,
} from '../llm/prompts';
import { analyzeChanges, generateADRContent } from '../llm/llm';
import { saveADR } from '../adr/adr';
import { createGitStrategy } from './strategies/git-strategy';
import { presenter } from '../presenters/console-presenter';
import { runAnalysis } from './analysis.orchestrator';

const mockPresenter = presenter as jest.Mocked<typeof presenter>;
const mockStrategy = { getFiles: jest.fn(), getDiff: jest.fn() };

(createGitStrategy as jest.Mock).mockReturnValue(mockStrategy);
(getDefaultConfigPath as jest.Mock).mockReturnValue('cadr.yaml');
(formatPrompt as jest.Mock).mockReturnValue('formatted-prompt');
(formatGenerationPrompt as jest.Mock).mockReturnValue('formatted-generation-prompt');

const mockConfig = {
  provider: 'openai' as const,
  analysis_model: 'gpt-4',
  api_key_env: 'KEY',
  timeout_seconds: 15,
};

const defaultDiffOptions = { mode: 'all' as const };

function setupHappyPath(overrides?: { isSignificant?: boolean; confidence?: number }) {
  const isSignificant = overrides?.isSignificant ?? true;
  const confidence = overrides?.confidence ?? 0.9;

  (loadConfig as jest.Mock).mockResolvedValue(mockConfig);
  mockStrategy.getFiles.mockResolvedValue(['src/index.ts', 'src/utils.ts']);
  mockStrategy.getDiff.mockResolvedValue('diff content here');
  (analyzeChanges as jest.Mock).mockResolvedValue({
    result: {
      is_significant: isSignificant,
      reason: 'Introduced new dependency',
      confidence,
      timestamp: '2026-01-01T00:00:00.000Z',
    },
    error: undefined,
  });
}

describe('runAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createGitStrategy as jest.Mock).mockReturnValue(mockStrategy);
    (getDefaultConfigPath as jest.Mock).mockReturnValue('cadr.yaml');
    (formatPrompt as jest.Mock).mockReturnValue('formatted-prompt');
    (formatGenerationPrompt as jest.Mock).mockReturnValue('formatted-generation-prompt');
  });

  it('should show config error and return early when loadConfig returns null', async () => {
    (loadConfig as jest.Mock).mockResolvedValue(null);

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showConfigError).toHaveBeenCalled();
    expect(mockStrategy.getFiles).not.toHaveBeenCalled();
  });

  it('should show git error when getFiles throws a GitError', async () => {
    (loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    const gitError = new Error('Not a git repo');
    gitError.name = 'GitError';
    mockStrategy.getFiles.mockRejectedValue(gitError);

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showGitError).toHaveBeenCalledWith('Not a git repo');
  });

  it('should show read files error when getFiles throws a non-GitError', async () => {
    (loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    mockStrategy.getFiles.mockRejectedValue(new Error('some other error'));

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showReadFilesError).toHaveBeenCalled();
  });

  it('should show no changes when getFiles returns empty array', async () => {
    (loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    mockStrategy.getFiles.mockResolvedValue([]);

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showNoChanges).toHaveBeenCalledWith(defaultDiffOptions);
  });

  it('should show read files error when getDiff throws', async () => {
    (loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    mockStrategy.getFiles.mockResolvedValue(['file.ts']);
    mockStrategy.getDiff.mockRejectedValue(new Error('diff failed'));

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showReadFilesError).toHaveBeenCalled();
  });

  it('should show no diff content when getDiff returns empty string', async () => {
    (loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    mockStrategy.getFiles.mockResolvedValue(['file.ts']);
    mockStrategy.getDiff.mockResolvedValue('');

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showNoDiffContent).toHaveBeenCalled();
  });

  it('should show analysis failed when analyzeChanges returns error', async () => {
    (loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    mockStrategy.getFiles.mockResolvedValue(['file.ts']);
    mockStrategy.getDiff.mockResolvedValue('diff content');
    (analyzeChanges as jest.Mock).mockResolvedValue({
      result: null,
      error: 'api error',
    });

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showAnalysisFailed).toHaveBeenCalledWith('api error');
  });

  it('should show not significant result when analysis result is not significant', async () => {
    setupHappyPath({ isSignificant: false });

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showNotSignificantResult).toHaveBeenCalledWith(
      expect.objectContaining({
        fileCount: 2,
        mode: 'all',
        isSignificant: false,
        reason: 'Introduced new dependency',
        confidence: 0.9,
      })
    );
  });

  it('should show skipping generation when user declines', async () => {
    setupHappyPath({ isSignificant: true });
    (promptForGeneration as jest.Mock).mockResolvedValue(false);

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showSignificantResult).toHaveBeenCalled();
    expect(mockPresenter.showSkippingGeneration).toHaveBeenCalled();
  });

  it('should show generation failed when generateADRContent returns error', async () => {
    setupHappyPath({ isSignificant: true });
    (promptForGeneration as jest.Mock).mockResolvedValue(true);
    (generateADRContent as jest.Mock).mockResolvedValue({
      result: null,
      error: 'generation error',
    });

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showGeneratingADR).toHaveBeenCalled();
    expect(mockPresenter.showGenerationFailed).toHaveBeenCalledWith('generation error');
  });

  it('should show ADR success when generation and save succeed', async () => {
    setupHappyPath({ isSignificant: true });
    (promptForGeneration as jest.Mock).mockResolvedValue(true);
    (generateADRContent as jest.Mock).mockResolvedValue({
      result: { content: '# ADR Content', title: 'Use Redis', timestamp: '2026-01-01' },
      error: undefined,
    });
    (saveADR as jest.Mock).mockReturnValue({
      success: true,
      filePath: 'docs/adr/0001-use-redis.md',
    });

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showGeneratingADR).toHaveBeenCalled();
    expect(saveADR).toHaveBeenCalledWith('# ADR Content', 'Use Redis');
    expect(mockPresenter.showADRSuccess).toHaveBeenCalledWith('docs/adr/0001-use-redis.md');
  });

  it('should show ADR save error when save fails', async () => {
    setupHappyPath({ isSignificant: true });
    (promptForGeneration as jest.Mock).mockResolvedValue(true);
    (generateADRContent as jest.Mock).mockResolvedValue({
      result: { content: '# ADR Content', title: 'Use Redis', timestamp: '2026-01-01' },
      error: undefined,
    });
    (saveADR as jest.Mock).mockReturnValue({
      success: false,
      error: 'permission denied',
    });

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showADRSaveError).toHaveBeenCalledWith('permission denied');
  });

  it('should show unexpected error when runAnalysisInternal throws', async () => {
    (loadConfig as jest.Mock).mockRejectedValue(new Error('unexpected boom'));

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showUnexpectedError).toHaveBeenCalled();
  });

  it('should call showAnalyzingFiles, showSendingToLLM, and showAnalysisComplete in happy path', async () => {
    setupHappyPath({ isSignificant: false });

    await runAnalysis(defaultDiffOptions);

    expect(mockPresenter.showAnalyzingFiles).toHaveBeenCalledWith(
      ['src/index.ts', 'src/utils.ts'],
      defaultDiffOptions
    );
    expect(mockPresenter.showSendingToLLM).toHaveBeenCalledWith(
      defaultDiffOptions,
      'openai',
      'gpt-4'
    );
    expect(mockPresenter.showAnalysisComplete).toHaveBeenCalled();
  });
});
