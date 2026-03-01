import { loadConfig, validateConfig, getDefaultConfigPath, createConfig, AnalysisConfig } from './config';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as readline from 'readline';
// Mock fs and yaml modules
jest.mock('fs');
jest.mock('js-yaml');
jest.mock('readline');
jest.mock('./logger', () => ({
  loggerInstance: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { loggerInstance as logger } from './logger';
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Configuration Module', () => {
  const mockConfig: AnalysisConfig = {
    provider: 'openai',
    analysis_model: 'gpt-4',
    api_key_env: 'OPENAI_API_KEY',
    timeout_seconds: 15
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    test('loads valid configuration successfully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('provider: openai\nanalysis_model: gpt-4');
      (yaml.load as jest.Mock).mockReturnValue(mockConfig);

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toEqual(mockConfig);
      expect(fs.existsSync).toHaveBeenCalledWith('/test/cadr.yaml');
      expect(fs.readFileSync).toHaveBeenCalledWith('/test/cadr.yaml', 'utf-8');
    });

    test('returns null when config file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toBeNull();
    });

    test('returns null when config file is invalid', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid yaml');
      (yaml.load as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toBeNull();
    });
  });

  describe('validateConfig', () => {
    test('validates correct configuration', () => {
      const result = validateConfig(mockConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects invalid provider', () => {
      const invalidConfig = { ...mockConfig, provider: 'invalid' };
      const result = validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.join('\n')).toMatch(/provider must be one of the following values: openai, gemini/);
    });

    test('rejects missing required fields', () => {
      const invalidConfig = { provider: 'openai' };
      const result = validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // --- NEW TEST CASES ---

  describe('loadConfig — additional branches', () => {
    test('returns null when YAML parses to null', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('');
      (yaml.load as jest.Mock).mockReturnValue(null);

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Invalid YAML configuration',
        expect.objectContaining({ configPath: '/test/cadr.yaml' })
      );
    });

    test('returns null when YAML parses to a string', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('just a string');
      (yaml.load as jest.Mock).mockReturnValue('just a string');

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Invalid YAML configuration',
        expect.objectContaining({ configPath: '/test/cadr.yaml' })
      );
    });

    test('does not log warning when api_key_env is set in environment', async () => {
      const envKey = 'TEST_API_KEY_PRESENT';
      const configWithEnv = { ...mockConfig, api_key_env: envKey };
      process.env[envKey] = 'some-key-value';

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('yaml');
      (yaml.load as jest.Mock).mockReturnValue(configWithEnv);

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toEqual(configWithEnv);
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        'API key environment variable is not set',
        expect.anything()
      );

      delete process.env[envKey];
    });

    test('logs warning but still returns config when api_key_env is NOT set', async () => {
      const envKey = 'MISSING_API_KEY_XYZ';
      const configWithMissingEnv = { ...mockConfig, api_key_env: envKey };
      delete process.env[envKey];

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('yaml');
      (yaml.load as jest.Mock).mockReturnValue(configWithMissingEnv);

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toEqual(configWithMissingEnv);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'API key environment variable is not set',
        { api_key_env: envKey }
      );
    });

    test('returns null when readFileSync throws a permissions error', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      const result = await loadConfig('/test/cadr.yaml');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load configuration',
        expect.objectContaining({ configPath: '/test/cadr.yaml' })
      );
    });
  });

  describe('validateConfig — additional cases', () => {
    test('accepts provider gemini as valid', () => {
      const geminiConfig = { ...mockConfig, provider: 'gemini' };
      const result = validateConfig(geminiConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('accepts timeout_seconds: 1 (min boundary) as valid', () => {
      const config = { ...mockConfig, timeout_seconds: 1 };
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('accepts timeout_seconds: 60 (max boundary) as valid', () => {
      const config = { ...mockConfig, timeout_seconds: 60 };
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects timeout_seconds: 0 (below min) with error message', () => {
      const config = { ...mockConfig, timeout_seconds: 0 };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.join('\n')).toMatch(/timeout_seconds must be at least 1 second/);
    });

    test('rejects timeout_seconds: 61 (above max)', () => {
      const config = { ...mockConfig, timeout_seconds: 61 };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.join('\n')).toMatch(/timeout_seconds must not exceed 60 seconds/);
    });

    test('returns unknown validation error for non-yup errors', () => {
      // We need to force validateSync to throw a non-yup error.
      // We can do this by passing an object with a valueOf that throws.
      const badConfig = {
        get provider() {
          throw new TypeError('unexpected');
        },
      };

      const result = validateConfig(badConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Unknown validation error']);
    });

    test('accepts ignore_patterns as a valid optional array', () => {
      const config = { ...mockConfig, ignore_patterns: ['*.md', '*.json'] };
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getDefaultConfigPath', () => {
    test('returns cadr.yaml', () => {
      const result = getDefaultConfigPath();

      expect(result).toBe('cadr.yaml');
    });
  });

  describe('createConfig', () => {
    function mockReadline(answers: string[]) {
      let callIndex = 0;
      const mockRl = {
        question: jest.fn((_prompt: string, callback: (answer: string) => void) => {
          callback(answers[callIndex] || '');
          callIndex++;
        }),
        close: jest.fn(),
      };
      (readline.createInterface as jest.Mock).mockReturnValue(mockRl);
      return mockRl;
    }

    beforeEach(() => {
      // yaml.dump needs to return a string for writeFileSync
      (yaml.dump as jest.Mock).mockReturnValue('provider: openai\n');
    });

    test('creates config with openai defaults and writes to file', async () => {
      // Answers: provider=openai, model=gpt-4, api_key_env=OPENAI_API_KEY, timeout=15, ignore_patterns=*.md
      const mockRl = mockReadline(['openai', 'gpt-4', 'OPENAI_API_KEY', '15', '*.md']);

      const result = await createConfig('/test/cadr.yaml');

      expect(result).not.toBeNull();
      expect(result!.provider).toBe('openai');
      expect(result!.analysis_model).toBe('gpt-4');
      expect(result!.api_key_env).toBe('OPENAI_API_KEY');
      expect(result!.timeout_seconds).toBe(15);
      expect(result!.ignore_patterns).toEqual(['*.md']);
      expect(fs.writeFileSync).toHaveBeenCalledWith('/test/cadr.yaml', expect.any(String), 'utf-8');
      expect(mockRl.close).toHaveBeenCalled();
    });

    test('creates config with gemini defaults when gemini provider is chosen', async () => {
      // Answer provider=gemini, then use defaults for the rest
      mockReadline(['gemini', '', '', '15', '']);

      // yaml.dump needs to be realistic for this call
      (yaml.dump as jest.Mock).mockReturnValue('provider: gemini\n');

      const result = await createConfig('/test/cadr.yaml');

      expect(result).not.toBeNull();
      expect(result!.provider).toBe('gemini');
      expect(result!.analysis_model).toBe('gemini-1.5-pro');
      expect(result!.api_key_env).toBe('GEMINI_API_KEY');
    });

    test('returns null when validation fails during createConfig', async () => {
      // Use an invalid provider to trigger validation failure
      mockReadline(['invalid_provider', 'model', 'KEY', '15', '']);

      const result = await createConfig('/test/cadr.yaml');

      expect(result).toBeNull();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });
});