import { loadConfig, validateConfig, AnalysisConfig } from './config';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

// Mock fs and yaml modules
jest.mock('fs');
jest.mock('js-yaml');

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
});