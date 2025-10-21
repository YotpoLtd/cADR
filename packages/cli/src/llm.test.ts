import { analyzeChanges, AnalysisRequest, generateADRContent, GenerationRequest } from './llm';
import { AnalysisConfig } from './config';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock OpenAI module
jest.mock('openai');
jest.mock('@google/generative-ai');

describe('LLM Client Module', () => {
  const mockConfig: AnalysisConfig = {
    provider: 'openai',
    analysis_model: 'gpt-4',
    api_key_env: 'OPENAI_API_KEY',
    timeout_seconds: 15
  };

  const mockRequest: AnalysisRequest = {
    file_paths: ['src/auth.ts', 'src/user.ts'],
    diff_content: `
diff --git a/src/auth.ts b/src/auth.ts
+export function authenticateUser(token: string) {
+  return jwt.verify(token);
+}
`,
    repository_context: 'my-app',
    analysis_prompt: 'Analyze these changes...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('analyzeChanges', () => {
    test('analyzes changes successfully with significant result', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: true,
              reason: 'Introduces new authentication system'
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).not.toBeNull();
      expect(response.error).toBeUndefined();
      expect(response.result?.is_significant).toBe(true);
      expect(response.result?.reason).toContain('authentication');
      expect(response.result?.timestamp).toBeDefined();
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.any(Array)
        }),
        expect.objectContaining({
          timeout: 15000
        })
      );
    });

    test('analyzes changes successfully with non-significant result', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: false,
              reason: 'Minor documentation updates'
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).not.toBeNull();
      expect(response.error).toBeUndefined();
      expect(response.result?.is_significant).toBe(false);
      expect(response.result?.reason).toContain('documentation');
    });

    test('accepts empty reason when change is not significant', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: false,
              reason: ''
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).not.toBeNull();
      expect(response.error).toBeUndefined();
      expect(response.result?.is_significant).toBe(false);
      expect(response.result?.reason).toBe('');
    });

    test('rejects empty reason when change is significant', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: true,
              reason: ''
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
      expect(response.error).toContain('no reason');
    });

    test('handles API failures gracefully (fail-open)', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      // Fail-open: should return error, not throw
      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
      expect(response.error).toContain('API error');
      expect(mockCreate).toHaveBeenCalled();
    });

    test('handles rate limiting gracefully', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as Error & { status: number }).status = 429;
      
      const mockCreate = jest.fn().mockRejectedValue(rateLimitError);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
      expect(response.error).toContain('Rate limit exceeded');
    });

    test('handles timeout gracefully', async () => {
      const timeoutError = new Error('Request timeout');
      (timeoutError as Error & { code: string }).code = 'ETIMEDOUT';
      
      const mockCreate = jest.fn().mockRejectedValue(timeoutError);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
    });

    test('validates response format and rejects invalid JSON', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'This is not valid JSON'
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
    });

    test('validates response format and rejects missing fields', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: true
              // Missing 'reason' field
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
    });

    test('respects timeout configuration', async () => {
      const customConfig = { ...mockConfig, timeout_seconds: 5 };
      
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: true,
              reason: 'Test'
            })
          }
        }]
      });

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      await analyzeChanges(customConfig, mockRequest);

      // Verify timeout was passed to OpenAI client
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.any(Array)
        }),
        expect.objectContaining({
          timeout: 5000 // milliseconds
        })
      );
    });

    test('returns null when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
    });

    test('includes confidence score when provided by LLM', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: true,
              reason: 'Major change',
              confidence: 0.95
            })
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await analyzeChanges(mockConfig, mockRequest);

      expect(response.result).not.toBeNull();
      expect(response.error).toBeUndefined();
      expect(response.result?.confidence).toBe(0.95);
    });

    test('supports Gemini provider with valid JSON response', async () => {
      const geminiConfig: AnalysisConfig = {
        provider: 'gemini',
        analysis_model: 'gemini-1.5-pro',
        api_key_env: 'GEMINI_API_KEY',
        timeout_seconds: 10,
      };
      (GoogleGenerativeAI as unknown as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => JSON.stringify({ is_significant: false, reason: '' }),
            },
          }),
        }),
      }));

      process.env.GEMINI_API_KEY = 'test-api-key';
      const response = await analyzeChanges(geminiConfig, mockRequest);
      expect(response.result).not.toBeNull();
      expect(response.result?.is_significant).toBe(false);
      delete process.env.GEMINI_API_KEY;
    });

    test('handles Gemini timeout gracefully', async () => {
      const geminiConfig: AnalysisConfig = {
        provider: 'gemini',
        analysis_model: 'gemini-1.5-pro',
        api_key_env: 'GEMINI_API_KEY',
        timeout_seconds: 1,
      };
      type GeminiResponse = { response: { text: () => string } };
      const slowPromise: Promise<GeminiResponse> = new Promise((resolve) => setTimeout(() => resolve({
        response: { text: () => JSON.stringify({ is_significant: true, reason: 'Test' }) }
      }), 3000));
      (GoogleGenerativeAI as unknown as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockReturnValue(slowPromise),
        }),
      }));

      process.env.GEMINI_API_KEY = 'test-api-key';
      const response = await analyzeChanges(geminiConfig, mockRequest);
      expect(response.result).toBeNull();
      expect(response.error).toMatch(/timeout/i);
      delete process.env.GEMINI_API_KEY;
    });
  });

  describe('Prompt Construction', () => {
    test('constructs proper prompt with file paths and diff', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              is_significant: false,
              reason: 'Test'
            })
          }
        }]
      });

      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      await analyzeChanges(mockConfig, mockRequest);

      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages).toBeDefined();
      expect(callArgs.messages.length).toBeGreaterThan(0);
    });
  });

  describe('generateADRContent', () => {
    const mockGenerationRequest: GenerationRequest = {
      file_paths: ['src/database.ts'],
      diff_content: `
diff --git a/src/database.ts b/src/database.ts
+import pg from 'pg';
+export const database = new pg.Pool();
`,
      reason: 'Introduces PostgreSQL as primary datastore',
      generation_prompt: 'Generate an ADR for the following changes...'
    };

    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
    });

    afterEach(() => {
      delete process.env.OPENAI_API_KEY;
    });

    test('generates ADR content successfully', async () => {
      const mockADRContent = `# Use PostgreSQL as Primary Datastore

* Status: accepted
* Date: 2025-10-21

## Context and Problem Statement

We need a reliable database for our application.

## Decision Drivers

* Need for ACID compliance
* Strong community support
* Excellent performance

## Considered Options

* PostgreSQL
* MySQL
* MongoDB

## Decision Outcome

Chosen option: "PostgreSQL", because it provides strong ACID guarantees and excellent JSON support.

### Consequences

* Good, because we get reliable transactions
* Good, because we have strong typing
* Bad, because requires more setup than NoSQL`;

      const mockResponse = {
        choices: [{
          message: {
            content: mockADRContent
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await generateADRContent(mockConfig, mockGenerationRequest);

      expect(response.result).not.toBeNull();
      expect(response.error).toBeUndefined();
      expect(response.result?.content).toBe(mockADRContent);
      expect(response.result?.title).toBe('Use PostgreSQL as Primary Datastore');
      expect(response.result?.timestamp).toBeDefined();
    });

    test('extracts title from markdown heading', async () => {
      const mockADRContent = `# Switch to TypeScript

* Status: accepted

Some content...`;

      const mockResponse = {
        choices: [{
          message: {
            content: mockADRContent
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await generateADRContent(mockConfig, mockGenerationRequest);

      expect(response.result?.title).toBe('Switch to TypeScript');
    });

    test('handles missing title gracefully', async () => {
      const mockADRContent = `Some content without a title heading

* Status: accepted`;

      const mockResponse = {
        choices: [{
          message: {
            content: mockADRContent
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await generateADRContent(mockConfig, mockGenerationRequest);

      expect(response.result?.title).toBe('Untitled Decision');
    });

    test('removes markdown code fences if present', async () => {
      const mockADRContent = `# My Decision

* Status: accepted`;

      const mockResponse = {
        choices: [{
          message: {
            content: '```markdown\n' + mockADRContent + '\n```'
          }
        }]
      };

      const mockCreate = jest.fn().mockResolvedValue(mockResponse);
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await generateADRContent(mockConfig, mockGenerationRequest);

      expect(response.result?.content).toBe(mockADRContent);
      expect(response.result?.content).not.toContain('```');
    });

    test('handles API failures gracefully', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await generateADRContent(mockConfig, mockGenerationRequest);

      expect(response.result).toBeNull();
      expect(response.error).toBeDefined();
      expect(response.error).toContain('API error');
    });

    test('handles missing API key', async () => {
      delete process.env.OPENAI_API_KEY;

      const response = await generateADRContent(mockConfig, mockGenerationRequest);

      expect(response.result).toBeNull();
      expect(response.error).toContain('API key not found');
    });

    test('handles timeout errors', async () => {
      const mockCreate = jest.fn().mockRejectedValue({ code: 'ETIMEDOUT' });
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      const response = await generateADRContent(mockConfig, mockGenerationRequest);

      expect(response.result).toBeNull();
      expect(response.error).toMatch(/timeout/i);
    });

    test('follows fail-open principle on all errors', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      // Should not throw, should return error response
      await expect(generateADRContent(mockConfig, mockGenerationRequest)).resolves.toEqual({
        result: null,
        error: expect.any(String)
      });
    });

    test('respects timeout configuration', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: '# Test\n\nContent'
          }
        }]
      });
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      await generateADRContent(mockConfig, mockGenerationRequest);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          timeout: 15000 // 15 seconds from config
        })
      );
    });

    test('uses same model as analysis', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: '# Test\n\nContent'
          }
        }]
      });
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
        chat: {
          completions: {
            create: mockCreate
          }
        }
      } as unknown as jest.Mocked<OpenAI>));

      await generateADRContent(mockConfig, mockGenerationRequest);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4' // Same as analysis_model
        }),
        expect.any(Object)
      );
    });
  });
});

