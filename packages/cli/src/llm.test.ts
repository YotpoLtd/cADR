import { analyzeChanges, AnalysisRequest } from './llm';
import { AnalysisConfig } from './config';
import OpenAI from 'openai';

// Mock OpenAI module
jest.mock('openai');

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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).not.toBeNull();
      expect(result?.is_significant).toBe(true);
      expect(result?.reason).toContain('authentication');
      expect(result?.timestamp).toBeDefined();
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).not.toBeNull();
      expect(result?.is_significant).toBe(false);
      expect(result?.reason).toContain('documentation');
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      // Fail-open: should return null, not throw
      expect(result).toBeNull();
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).toBeNull();
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).toBeNull();
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).toBeNull();
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).toBeNull();
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).toBeNull();
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

      const result = await analyzeChanges(mockConfig, mockRequest);

      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(0.95);
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
});

