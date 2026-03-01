jest.mock('../providers', () => ({
  getProvider: jest.fn(),
}));

jest.mock('../logger', () => ({
  loggerInstance: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { getProvider } from '../providers';
import { loggerInstance as logger } from '../logger';
import { analyzeChanges, generateADRContent } from './llm';
import type { AnalysisConfig } from '../config';
import type { LLMProvider } from '../providers/types';

const mockedGetProvider = getProvider as jest.MockedFunction<typeof getProvider>;
const mockedLogger = logger as jest.Mocked<typeof logger>;

const config: AnalysisConfig = {
  provider: 'openai',
  analysis_model: 'gpt-4',
  api_key_env: 'TEST_API_KEY',
  timeout_seconds: 15,
};

const baseAnalysisRequest = {
  file_paths: ['src/index.ts'],
  diff_content: 'diff --git a/src/index.ts',
  repository_context: 'test repo',
  analysis_prompt: 'Analyze these changes',
};

const baseGenerationRequest = {
  file_paths: ['src/index.ts'],
  diff_content: 'diff --git a/src/index.ts',
  reason: 'significant architectural change',
  generation_prompt: 'Generate ADR for these changes',
};

function createMockProvider(analyzeFn: jest.Mock): LLMProvider {
  return {
    name: 'openai',
    analyze: analyzeFn,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.TEST_API_KEY = 'test-key';
});

afterEach(() => {
  delete process.env.TEST_API_KEY;
  jest.restoreAllMocks();
});

describe('analyzeChanges', () => {
  it('should return error when API key is not set', async () => {
    delete process.env.TEST_API_KEY;

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('TEST_API_KEY');
  });

  it('should return successful result when provider returns clean JSON', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue(
      JSON.stringify({ is_significant: true, reason: 'big' })
    );
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).not.toBeNull();
    expect(response.result!.is_significant).toBe(true);
    expect(response.result!.reason).toBe('big');
    expect(response.result!.timestamp).toBeDefined();
    expect(response.error).toBeUndefined();
  });

  it('should parse JSON wrapped in a code block', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue(
      '```json\n{"is_significant": true, "reason": "refactored"}\n```'
    );
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).not.toBeNull();
    expect(response.result!.is_significant).toBe(true);
    expect(response.result!.reason).toBe('refactored');
  });

  it('should return error when provider returns undefined', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue(undefined);
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toBe('No response content from LLM');
  });

  it('should return error when provider returns invalid JSON', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue('not valid json at all');
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('Failed to parse LLM response as JSON');
  });

  it('should return error when is_significant is not a boolean', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue(
      JSON.stringify({ is_significant: 'yes', reason: 'something' })
    );
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('Invalid response format');
  });

  it('should return error when is_significant is true but reason is empty', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue(
      JSON.stringify({ is_significant: true, reason: '' })
    );
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('no reason');
  });

  it('should include confidence when value is within valid range', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue(
      JSON.stringify({ is_significant: true, reason: 'big change', confidence: 0.85 })
    );
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).not.toBeNull();
    expect(response.result!.confidence).toBe(0.85);
  });

  it('should not include confidence when value is out of range', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue(
      JSON.stringify({ is_significant: true, reason: 'big change', confidence: 1.5 })
    );
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).not.toBeNull();
    expect(response.result!.confidence).toBeUndefined();
  });

  it('should log warning when estimated tokens exceed 7000', async () => {
    const longPrompt = 'x'.repeat(28004);
    const mockAnalyze = jest.fn().mockResolvedValue(
      JSON.stringify({ is_significant: false, reason: 'minor' })
    );
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const request = { ...baseAnalysisRequest, analysis_prompt: longPrompt };
    await analyzeChanges(config, request);

    expect(mockedLogger.warn).toHaveBeenCalledWith(
      'High token count detected',
      expect.objectContaining({ estimated_tokens: expect.any(Number) })
    );
  });

  it('should return auth error when provider throws with status 401', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({ status: 401, message: 'Unauthorized' });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('Invalid API key');
  });

  it('should return diff-too-large error when provider throws status 400 with context length message', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({
      status: 400,
      message: 'maximum context length exceeded with 50000 tokens',
    });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('Diff too large');
  });

  it('should return rate limit error when provider throws with status 429', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({ status: 429, message: 'Too many requests' });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('Rate limit exceeded');
  });

  it('should return timeout error when provider throws with code ETIMEDOUT', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({ code: 'ETIMEDOUT', message: 'connection timed out' });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('timeout');
    expect(response.error).toContain('15s');
  });

  it('should return timeout error when provider throws with timeout in message', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({ message: 'Request timeout after 15000ms' });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('timeout');
  });

  it('should return network error when provider throws with code ENOTFOUND', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({ code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND' });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('Network error');
  });

  it('should return generic API error for unknown errors', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({ message: 'Something unexpected' });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await analyzeChanges(config, baseAnalysisRequest);

    expect(response.result).toBeNull();
    expect(response.error).toBe('API error: Something unexpected');
  });
});

describe('generateADRContent', () => {
  it('should return error when API key is not set', async () => {
    delete process.env.TEST_API_KEY;

    const response = await generateADRContent(config, baseGenerationRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('TEST_API_KEY');
  });

  it('should extract title from markdown h1 and return cleaned content', async () => {
    const markdown = '# Adopt New Database\n\n## Context\nWe need a new DB.';
    const mockAnalyze = jest.fn().mockResolvedValue(markdown);
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await generateADRContent(config, baseGenerationRequest);

    expect(response.result).not.toBeNull();
    expect(response.result!.title).toBe('Adopt New Database');
    expect(response.result!.content).toBe(markdown);
    expect(response.result!.timestamp).toBeDefined();
    expect(response.error).toBeUndefined();
  });

  it('should strip code block wrapper from markdown response', async () => {
    const inner = '# My Decision\n\n## Context\nSome context.';
    const wrapped = '```markdown\n' + inner + '\n```';
    const mockAnalyze = jest.fn().mockResolvedValue(wrapped);
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await generateADRContent(config, baseGenerationRequest);

    expect(response.result).not.toBeNull();
    expect(response.result!.title).toBe('My Decision');
    expect(response.result!.content).toBe(inner);
  });

  it('should use Untitled Decision when markdown has no h1', async () => {
    const markdown = '## Context\nSome context without a title.';
    const mockAnalyze = jest.fn().mockResolvedValue(markdown);
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await generateADRContent(config, baseGenerationRequest);

    expect(response.result).not.toBeNull();
    expect(response.result!.title).toBe('Untitled Decision');
  });

  it('should return auth error when provider throws with status 401', async () => {
    const mockAnalyze = jest.fn().mockRejectedValue({ status: 401, message: 'Unauthorized' });
    mockedGetProvider.mockReturnValue(createMockProvider(mockAnalyze));

    const response = await generateADRContent(config, baseGenerationRequest);

    expect(response.result).toBeNull();
    expect(response.error).toContain('Invalid API key');
  });
});
