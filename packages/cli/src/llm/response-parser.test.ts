jest.mock('../logger', () => ({
  loggerInstance: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import {
  parseAnalysisResponse,
  extractTitleFromMarkdown,
  parseLLMResponse,
  ParsedAnalysisResponse,
} from './response-parser';

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('parseAnalysisResponse', () => {
  it('should parse a clean JSON string', () => {
    const input = JSON.stringify({ is_significant: true, reason: 'big change' });
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: true, reason: 'big change' });
  });

  it('should extract JSON wrapped in ```json code block', () => {
    const input = '```json\n{"is_significant": true, "reason": "refactored module"}\n```';
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: true, reason: 'refactored module' });
  });

  it('should extract JSON wrapped in ``` code block without language', () => {
    const input = '```\n{"is_significant": true, "reason": "new feature"}\n```';
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: true, reason: 'new feature' });
  });

  it('should extract JSON embedded in surrounding text', () => {
    const input = 'Here is the analysis:\n{"is_significant": false, "reason": "minor fix"}\nEnd of response.';
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: false, reason: 'minor fix' });
  });

  it('should parse is_significant: false with a reason', () => {
    const input = JSON.stringify({ is_significant: false, reason: 'no impact' });
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: false, reason: 'no impact' });
  });

  it('should include confidence when within [0, 1]', () => {
    const input = JSON.stringify({ is_significant: true, reason: 'important', confidence: 0.85 });
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: true, reason: 'important', confidence: 0.85 });
  });

  it('should not include confidence when out of range (> 1)', () => {
    const input = JSON.stringify({ is_significant: true, reason: 'important', confidence: 1.5 });
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: true, reason: 'important' });
    expect(result.confidence).toBeUndefined();
  });

  it('should not include confidence when it is not a number', () => {
    const input = JSON.stringify({ is_significant: true, reason: 'important', confidence: 'high' });
    const result = parseAnalysisResponse(input);
    expect(result).toEqual({ is_significant: true, reason: 'important' });
    expect(result.confidence).toBeUndefined();
  });

  it('should throw when is_significant is true but reason is empty', () => {
    const input = JSON.stringify({ is_significant: true, reason: '' });
    expect(() => parseAnalysisResponse(input)).toThrow(
      'LLM indicated significant change but provided no reason'
    );
  });

  it('should throw when is_significant is not a boolean', () => {
    const input = JSON.stringify({ is_significant: 'yes', reason: 'something' });
    expect(() => parseAnalysisResponse(input)).toThrow('Invalid response format');
  });

  it('should throw when reason is not a string', () => {
    const input = JSON.stringify({ is_significant: true, reason: 123 });
    expect(() => parseAnalysisResponse(input)).toThrow('Invalid response format');
  });

  it('should throw on invalid JSON', () => {
    const input = 'not json at all {{{';
    expect(() => parseAnalysisResponse(input)).toThrow();
  });

  it('should throw on empty string', () => {
    expect(() => parseAnalysisResponse('')).toThrow();
  });
});

describe('extractTitleFromMarkdown', () => {
  it('should extract h1 title from markdown', () => {
    const input = '# My Decision Title\n\nSome content here.';
    expect(extractTitleFromMarkdown(input)).toBe('My Decision Title');
  });

  it('should return "Untitled Decision" when only h2 is present', () => {
    const input = '## Second level\n\nSome content.';
    expect(extractTitleFromMarkdown(input)).toBe('Untitled Decision');
  });

  it('should return "Untitled Decision" for empty string', () => {
    expect(extractTitleFromMarkdown('')).toBe('Untitled Decision');
  });

  it('should extract h1 from content wrapped in ```markdown code block', () => {
    const input = '```markdown\n# Wrapped Title\n\nBody text.\n```';
    expect(extractTitleFromMarkdown(input)).toBe('Wrapped Title');
  });

  it('should trim trailing whitespace from the title', () => {
    const input = '# Title With Spaces   \n\nContent.';
    expect(extractTitleFromMarkdown(input)).toBe('Title With Spaces');
  });
});

describe('parseLLMResponse', () => {
  it('should return validator result for valid JSON', () => {
    const input = JSON.stringify({ key: 'value' });
    const validator = (parsed: unknown) => parsed as { key: string };
    const result = parseLLMResponse(input, validator);
    expect(result).toEqual({ key: 'value' });
  });

  it('should rethrow with descriptive message when validator throws', () => {
    const input = JSON.stringify({ key: 'value' });
    const validator = (_parsed: unknown): never => {
      throw new Error('validation failed');
    };
    expect(() => parseLLMResponse(input, validator)).toThrow(
      'Failed to parse LLM response as JSON'
    );
    expect(() => parseLLMResponse(input, validator)).toThrow(
      expect.objectContaining({
        message: expect.stringContaining(input.substring(0, 20)),
      })
    );
  });

  it('should rethrow with descriptive message on invalid JSON', () => {
    const input = 'totally not json';
    const validator = (parsed: unknown) => parsed;
    expect(() => parseLLMResponse(input, validator)).toThrow(
      'Failed to parse LLM response as JSON'
    );
    expect(() => parseLLMResponse(input, validator)).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('totally not json'),
      })
    );
  });

  it('should strip code block wrapping before parsing', () => {
    const input = '```json\n{"status": "ok"}\n```';
    const validator = (parsed: unknown) => parsed as { status: string };
    const result = parseLLMResponse(input, validator);
    expect(result).toEqual({ status: 'ok' });
  });
});
