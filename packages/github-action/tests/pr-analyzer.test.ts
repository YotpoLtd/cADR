import { PRAnalyzer } from '../src/pr-analyzer';
import { PRContext } from '../src/types';

jest.mock('cadr-cli/src/llm');
import { analyzeChanges, generateADRContent } from 'cadr-cli/src/llm';

const mockAnalyzeChanges = analyzeChanges as jest.Mock;
const mockGenerateADRContent = generateADRContent as jest.Mock;

describe('PRAnalyzer', () => {
  let analyzer: PRAnalyzer;
  const config = { provider: 'openai', analysis_model: 'gpt-4' };
  const prContext: PRContext = {
    owner: 'owner',
    repo: 'repo',
    pullNumber: 1,
    headSha: 'head',
    baseSha: 'base',
    headRef: 'feature',
    baseRef: 'main',
    title: 'PR Title',
    author: 'user'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockGithubClient = {
      getPRDiff: jest.fn().mockResolvedValue('raw diff'),
      getExistingADRs: jest.fn().mockResolvedValue([1, 2]),
    };
    analyzer = new PRAnalyzer(mockGithubClient as any, 'dummy-key');
  });

  it('should return null suggestedAdr when changes are not significant', async () => {
    mockAnalyzeChanges.mockResolvedValue({ result: { is_significant: false, reason: 'Docs only' } });
    
    const result = await analyzer.analyze(prContext, config as any);
    
    expect(result.suggestedAdr).toBeNull();
    expect(mockGenerateADRContent).not.toHaveBeenCalled();
  });

  it('should generate ADR when changes are significant', async () => {
    mockAnalyzeChanges.mockResolvedValue({ result: { is_significant: true, reason: 'Big change' } });
    mockGenerateADRContent.mockResolvedValue({
      result: {
        content: '# 3. New ADR\n\nContent',
        title: 'New ADR'
      }
    });

    const result = await analyzer.analyze(prContext, config as any);

    expect(result.suggestedAdr).not.toBeNull();
    expect(result.suggestedAdr!.content).toBe('# 3. New ADR\n\nContent');
    expect(result.suggestedAdr!.number).toBe(3);
    // Check next number logic (mock returns [1, 2] -> next is 3)
  });

  it('should throw when analyzeChanges returns result null with error', async () => {
    mockAnalyzeChanges.mockResolvedValue({ result: null, error: 'LLM quota exceeded' });

    await expect(analyzer.analyze(prContext, config as any))
      .rejects.toThrow('LLM quota exceeded');
  });

  it('should throw with default message when analyzeChanges returns result null without error', async () => {
    mockAnalyzeChanges.mockResolvedValue({ result: null });

    await expect(analyzer.analyze(prContext, config as any))
      .rejects.toThrow('Analysis failed');
  });

  it('should propagate error when analyzeChanges throws', async () => {
    mockAnalyzeChanges.mockRejectedValue(new Error('Network timeout'));

    await expect(analyzer.analyze(prContext, config as any))
      .rejects.toThrow('Network timeout');
  });

  it('should return null suggestedAdr when generateADRContent returns result null', async () => {
    mockAnalyzeChanges.mockResolvedValue({ result: { is_significant: true, reason: 'Big change' } });
    mockGenerateADRContent.mockResolvedValue({ result: null });

    const result = await analyzer.analyze(prContext, config as any);

    expect(result.suggestedAdr).toBeNull();
    expect(result.analysisResult.is_significant).toBe(true);
  });

  it('should still call analyzeChanges when diff is empty', async () => {
    const mockGithubClient = {
      getPRDiff: jest.fn().mockResolvedValue(''),
      getExistingADRs: jest.fn().mockResolvedValue([]),
    };
    const emptyDiffAnalyzer = new PRAnalyzer(mockGithubClient as any, 'dummy-key');
    mockAnalyzeChanges.mockResolvedValue({ result: { is_significant: false, reason: 'No changes' } });

    await emptyDiffAnalyzer.analyze(prContext, config as any);

    expect(mockAnalyzeChanges).toHaveBeenCalled();
    expect(mockAnalyzeChanges.mock.calls[0][1]).toMatchObject({ diff_content: '' });
  });

  it('should set next ADR number to 1 when no existing ADRs', async () => {
    const mockGithubClient = {
      getPRDiff: jest.fn().mockResolvedValue('raw diff'),
      getExistingADRs: jest.fn().mockResolvedValue([]),
    };
    const freshAnalyzer = new PRAnalyzer(mockGithubClient as any, 'dummy-key');
    mockAnalyzeChanges.mockResolvedValue({ result: { is_significant: true, reason: 'New arch' } });
    mockGenerateADRContent.mockResolvedValue({
      result: { content: '# 1. First ADR\n\nContent', title: 'First ADR' }
    });

    const result = await freshAnalyzer.analyze(prContext, config as any);

    expect(result.suggestedAdr).not.toBeNull();
    expect(result.suggestedAdr!.number).toBe(1);
    expect(result.suggestedAdr!.filename).toBe('0001-first-adr.md');
  });

  it('should propagate error when generateADRContent throws', async () => {
    mockAnalyzeChanges.mockResolvedValue({ result: { is_significant: true, reason: 'Big change' } });
    mockGenerateADRContent.mockRejectedValue(new Error('Generation service unavailable'));

    await expect(analyzer.analyze(prContext, config as any))
      .rejects.toThrow('Generation service unavailable');
  });
});
