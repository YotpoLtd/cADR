import { ConsolePresenter, presenter, AnalysisSummary } from './console-presenter';

describe('ConsolePresenter', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let instance: ConsolePresenter;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    instance = new ConsolePresenter();
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function allLogOutput(): string {
    return logSpy.mock.calls.map((c: unknown[]) => c.join(' ')).join('\n');
  }

  function allErrorOutput(): string {
    return errorSpy.mock.calls.map((c: unknown[]) => c.join(' ')).join('\n');
  }

  describe('showConfigError', () => {
    test('outputs Configuration Error to stderr', () => {
      instance.showConfigError();
      const output = allErrorOutput();
      expect(output).toContain('Configuration Error');
    });

    test('suggests running cadr init', () => {
      instance.showConfigError();
      const output = allErrorOutput();
      expect(output).toContain('cadr init');
    });
  });

  describe('showGitError', () => {
    test('outputs Git Error with the provided message to stderr', () => {
      instance.showGitError('not a repository');
      const output = allErrorOutput();
      expect(output).toContain('Git Error: not a repository');
    });
  });

  describe('showReadFilesError', () => {
    test('outputs Failed to read changed files to stderr', () => {
      instance.showReadFilesError();
      const output = allErrorOutput();
      expect(output).toContain('Failed to read changed files');
    });
  });

  describe('showNoChanges', () => {
    test('staged mode mentions staged, git add, and cadr analyze --staged', () => {
      instance.showNoChanges({ mode: 'staged' });
      const output = allLogOutput();
      expect(output).toContain('staged');
      expect(output).toContain('git add');
      expect(output).toContain('cadr analyze --staged');
    });

    test('all mode mentions uncommitted and cadr analyze', () => {
      instance.showNoChanges({ mode: 'all' });
      const output = allLogOutput();
      expect(output).toContain('uncommitted');
      expect(output).toContain('cadr analyze');
    });

    test('branch-diff mode with base and head mentions between main and HEAD', () => {
      instance.showNoChanges({ mode: 'branch-diff', base: 'main', head: 'HEAD' });
      const output = allLogOutput();
      expect(output).toContain('between main and HEAD');
    });

    test('branch-diff mode without base/head defaults to origin/main and HEAD', () => {
      instance.showNoChanges({ mode: 'branch-diff' });
      const output = allLogOutput();
      expect(output).toContain('origin/main');
      expect(output).toContain('HEAD');
    });
  });

  describe('showAnalyzingFiles', () => {
    test('all mode with 2 files shows count and lists both files', () => {
      instance.showAnalyzingFiles(['a.ts', 'b.ts'], { mode: 'all' });
      const output = allLogOutput();
      expect(output).toContain('2 uncommitted files');
      expect(output).toContain('a.ts');
      expect(output).toContain('b.ts');
    });

    test('staged mode with 1 file shows singular file count', () => {
      instance.showAnalyzingFiles(['a.ts'], { mode: 'staged' });
      const output = allLogOutput();
      expect(output).toContain('1 staged file');
    });

    test('branch-diff mode shows files changed between base and head', () => {
      instance.showAnalyzingFiles(['a.ts', 'b.ts'], { mode: 'branch-diff', base: 'main', head: 'feat' });
      const output = allLogOutput();
      expect(output).toContain('2 files changed between main and feat');
    });
  });

  describe('showNoDiffContent', () => {
    test('outputs No diff content found', () => {
      instance.showNoDiffContent();
      const output = allLogOutput();
      expect(output).toContain('No diff content found');
    });
  });

  describe('showSendingToLLM', () => {
    test('staged mode mentions staged changes, provider, and model', () => {
      instance.showSendingToLLM({ mode: 'staged' }, 'openai', 'gpt-4');
      const output = allLogOutput();
      expect(output).toContain('staged changes');
      expect(output).toContain('openai');
      expect(output).toContain('gpt-4');
    });

    test('all mode mentions uncommitted changes', () => {
      instance.showSendingToLLM({ mode: 'all' }, 'gemini', 'gemini-pro');
      const output = allLogOutput();
      expect(output).toContain('uncommitted changes');
    });

    test('branch-diff mode mentions changes', () => {
      instance.showSendingToLLM({ mode: 'branch-diff' }, 'openai', 'gpt-4');
      const output = allLogOutput();
      expect(output).toContain('changes');
    });
  });

  describe('showAnalysisFailed', () => {
    test('outputs Analysis failed and the error message to stderr', () => {
      instance.showAnalysisFailed('some error');
      const output = allErrorOutput();
      expect(output).toContain('Analysis failed');
      expect(output).toContain('some error');
    });

    test('shows Unknown error occurred when no argument provided', () => {
      instance.showAnalysisFailed();
      const output = allErrorOutput();
      expect(output).toContain('Unknown error occurred');
    });
  });

  describe('showAnalysisComplete', () => {
    test('outputs Analysis Complete', () => {
      instance.showAnalysisComplete();
      const output = allLogOutput();
      expect(output).toContain('Analysis Complete');
    });
  });

  describe('showSignificantResult', () => {
    const baseSummary: AnalysisSummary = {
      fileCount: 5,
      mode: 'all',
      isSignificant: true,
      reason: 'big change',
    };

    test('outputs ARCHITECTURALLY SIGNIFICANT with reason and confidence', () => {
      instance.showSignificantResult({ ...baseSummary, confidence: 0.9 });
      const output = allLogOutput();
      expect(output).toContain('ARCHITECTURALLY SIGNIFICANT');
      expect(output).toContain('big change');
      expect(output).toContain('90%');
    });

    test('does not show percentage when confidence is not provided', () => {
      instance.showSignificantResult(baseSummary);
      const output = allLogOutput();
      expect(output).toContain('ARCHITECTURALLY SIGNIFICANT');
      expect(output).not.toContain('%');
    });
  });

  describe('showNotSignificantResult', () => {
    const baseSummary: AnalysisSummary = {
      fileCount: 2,
      mode: 'all',
      isSignificant: false,
      reason: 'trivial',
    };

    test('outputs NOT ARCHITECTURALLY SIGNIFICANT with reason and confidence', () => {
      instance.showNotSignificantResult({ ...baseSummary, confidence: 0.5 });
      const output = allLogOutput();
      expect(output).toContain('NOT ARCHITECTURALLY SIGNIFICANT');
      expect(output).toContain('trivial');
      expect(output).toContain('50%');
    });

    test('does not show percentage when confidence is not provided', () => {
      instance.showNotSignificantResult(baseSummary);
      const output = allLogOutput();
      expect(output).toContain('NOT ARCHITECTURALLY SIGNIFICANT');
      expect(output).not.toContain('%');
    });
  });

  describe('showGeneratingADR', () => {
    test('outputs Generating ADR', () => {
      instance.showGeneratingADR();
      const output = allLogOutput();
      expect(output).toContain('Generating ADR');
    });
  });

  describe('showGenerationFailed', () => {
    test('outputs ADR generation failed and error message to stderr', () => {
      instance.showGenerationFailed('error msg');
      const output = allErrorOutput();
      expect(output).toContain('ADR generation failed');
      expect(output).toContain('error msg');
    });
  });

  describe('showADRSuccess', () => {
    test('outputs Success, file path, and Next steps', () => {
      instance.showADRSuccess('/path/to/adr.md');
      const output = allLogOutput();
      expect(output).toContain('Success');
      expect(output).toContain('/path/to/adr.md');
      expect(output).toContain('Next steps');
    });
  });

  describe('showSkippingGeneration', () => {
    test('outputs Skipping ADR generation', () => {
      instance.showSkippingGeneration();
      const output = allLogOutput();
      expect(output).toContain('Skipping ADR generation');
    });
  });

  describe('showUnexpectedError', () => {
    test('outputs unexpected error to stderr', () => {
      instance.showUnexpectedError();
      const output = allErrorOutput();
      expect(output).toContain('unexpected error');
    });
  });

  describe('presenter export', () => {
    test('is an instance of ConsolePresenter', () => {
      expect(presenter).toBeInstanceOf(ConsolePresenter);
    });
  });
});
