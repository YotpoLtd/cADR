import { initCommand } from './init';
import * as config from '../config';
import { existsSync } from 'fs';
import { loggerInstance as logger } from '../logger';

// Mock dependencies
jest.mock('../config');
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
}));
jest.mock('../logger');

const mockExistsSync = existsSync as jest.Mock;
const mockCreateConfig = config.createConfig as jest.Mock;
const mockGetDefaultConfigPath = config.getDefaultConfigPath as jest.Mock;
const mockValidateConfig = config.validateConfig as jest.Mock;

function makeValidConfig(overrides: Partial<config.AnalysisConfig> = {}): config.AnalysisConfig {
  return {
    provider: 'openai',
    analysis_model: 'gpt-4',
    api_key_env: 'OPENAI_API_KEY',
    timeout_seconds: 30,
    ...overrides,
  };
}

describe('Init Command', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockGetDefaultConfigPath.mockReturnValue('/fake/path/cadr.yaml');
    mockValidateConfig.mockReturnValue({ valid: true, errors: [] });
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  describe('initCommand', () => {
    test('calls createConfig when no config exists', async () => {
      mockCreateConfig.mockResolvedValue(makeValidConfig());

      await initCommand();

      expect(config.createConfig).toHaveBeenCalled();
    });

    test('handles config creation errors gracefully', async () => {
      mockCreateConfig.mockRejectedValue(new Error('Permission denied'));

      await expect(initCommand()).resolves.not.toThrow();
    });

    test('prints already-exists message and does not call createConfig when config exists', async () => {
      mockExistsSync.mockReturnValue(true);

      await initCommand();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('already exists'),
      );
      expect(mockCreateConfig).not.toHaveBeenCalled();
    });

    test('prints failure message and does not display summary when createConfig returns null', async () => {
      mockCreateConfig.mockResolvedValue(null);

      await initCommand();

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create configuration'),
      );
      // Summary header should NOT appear
      const logCalls = consoleSpy.log.mock.calls.map((c: unknown[]) => c[0]);
      expect(logCalls).not.toEqual(
        expect.arrayContaining([expect.stringContaining('Configuration Summary')]),
      );
    });

    test('displays summary with provider, model, api_key_env, and timeout when config is valid', async () => {
      const cfg = makeValidConfig({
        provider: 'gemini',
        analysis_model: 'gemini-pro',
        api_key_env: 'GEMINI_API_KEY',
        timeout_seconds: 45,
      });
      mockCreateConfig.mockResolvedValue(cfg);
      process.env['GEMINI_API_KEY'] = 'fake-key';

      await initCommand();

      expect(consoleSpy.log).toHaveBeenCalledWith('📋 Configuration Summary:');
      expect(consoleSpy.log).toHaveBeenCalledWith('   Provider: gemini');
      expect(consoleSpy.log).toHaveBeenCalledWith('   Model: gemini-pro');
      expect(consoleSpy.log).toHaveBeenCalledWith('   API Key Env: GEMINI_API_KEY');
      expect(consoleSpy.log).toHaveBeenCalledWith('   Timeout: 45s');

      delete process.env['GEMINI_API_KEY'];
    });

    test('includes ignore patterns line when config has ignore_patterns', async () => {
      const cfg = makeValidConfig({
        ignore_patterns: ['node_modules', '*.log'],
      });
      mockCreateConfig.mockResolvedValue(cfg);
      process.env['OPENAI_API_KEY'] = 'fake-key';

      await initCommand();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '   Ignore Patterns: node_modules, *.log',
      );

      delete process.env['OPENAI_API_KEY'];
    });

    test('does not show ignore patterns line when ignore_patterns is undefined', async () => {
      const cfg = makeValidConfig();
      delete cfg.ignore_patterns;
      mockCreateConfig.mockResolvedValue(cfg);
      process.env['OPENAI_API_KEY'] = 'fake-key';

      await initCommand();

      const logCalls = consoleSpy.log.mock.calls.map((c: unknown[]) => c[0]);
      expect(logCalls).not.toEqual(
        expect.arrayContaining([expect.stringContaining('Ignore Patterns')]),
      );

      delete process.env['OPENAI_API_KEY'];
    });

    test('does not display warning when API key env var is set', async () => {
      const cfg = makeValidConfig({ api_key_env: 'OPENAI_API_KEY' });
      mockCreateConfig.mockResolvedValue(cfg);
      process.env['OPENAI_API_KEY'] = 'fake-key';

      await initCommand();

      expect(consoleSpy.warn).not.toHaveBeenCalled();

      delete process.env['OPENAI_API_KEY'];
    });

    test('displays warning with OpenAI link when API key env var is not set for OpenAI', async () => {
      const cfg = makeValidConfig({ provider: 'openai', api_key_env: 'OPENAI_API_KEY' });
      mockCreateConfig.mockResolvedValue(cfg);
      delete process.env['OPENAI_API_KEY'];

      await initCommand();

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('OPENAI_API_KEY is not set'),
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('https://platform.openai.com/api-keys'),
      );
    });

    test('displays warning with Gemini link when API key env var is not set for Gemini', async () => {
      const cfg = makeValidConfig({ provider: 'gemini', api_key_env: 'GEMINI_API_KEY' });
      mockCreateConfig.mockResolvedValue(cfg);
      delete process.env['GEMINI_API_KEY'];

      await initCommand();

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('GEMINI_API_KEY is not set'),
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('https://aistudio.google.com/app/apikey'),
      );
    });

    test('logs validation warning when validateConfig returns invalid', async () => {
      const cfg = makeValidConfig();
      mockCreateConfig.mockResolvedValue(cfg);
      mockValidateConfig.mockReturnValue({
        valid: false,
        errors: ['timeout too low'],
      });
      process.env['OPENAI_API_KEY'] = 'fake-key';

      await initCommand();

      expect(logger.warn).toHaveBeenCalledWith(
        'Created config has validation warnings',
        { errors: ['timeout too low'] },
      );

      delete process.env['OPENAI_API_KEY'];
    });

    test('catches unexpected error and prints error message', async () => {
      mockCreateConfig.mockRejectedValue(new Error('unexpected boom'));

      await initCommand();

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('unexpected error occurred'),
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Init command failed',
        expect.objectContaining({ error: expect.any(Error) }),
      );
    });
  });
});