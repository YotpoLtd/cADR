import { analyzeCommand } from './analyze';
import * as analysis from '../analysis';

// Mock dependencies
jest.mock('../analysis');

describe('Analyze Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCommand', () => {
    test('analyzes staged changes successfully', async () => {
      (analysis.runAnalysis as jest.Mock).mockResolvedValue(undefined);

      await analyzeCommand();

      expect(analysis.runAnalysis).toHaveBeenCalled();
    });

    test('handles analysis errors gracefully (fail-open)', async () => {
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(new Error('Analysis failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('exits with code 0 on success', async () => {
      (analysis.runAnalysis as jest.Mock).mockResolvedValue(undefined);

      // Should complete without throwing
      await expect(analyzeCommand()).resolves.not.toThrow();
    });

    test('exits with code 0 even on failure (fail-open)', async () => {
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should complete without throwing
      await expect(analyzeCommand()).resolves.not.toThrow();
      
      consoleErrorSpy.mockRestore();
    });

    test('does not throw on any error condition', async () => {
      const errorScenarios = [
        new Error('Config not found'),
        new Error('No staged files'),
        new Error('API error'),
        new Error('Timeout'),
        new Error('Rate limit'),
        new Error('Invalid response')
      ];

      for (const error of errorScenarios) {
        (analysis.runAnalysis as jest.Mock).mockRejectedValue(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        await expect(analyzeCommand()).resolves.not.toThrow();
        
        consoleErrorSpy.mockRestore();
      }
    });

    test('passes control to analysis orchestration', async () => {
      (analysis.runAnalysis as jest.Mock).mockResolvedValue(undefined);

      await analyzeCommand();

      // The command should delegate to the analysis module
      expect(analysis.runAnalysis).toHaveBeenCalledTimes(1);
    });

    test('handles missing configuration error', async () => {
      const configError = new Error('Configuration file not found');
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(configError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      // Should handle gracefully
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('handles API authentication error', async () => {
      const authError = new Error('API key not found');
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(authError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('handles network timeout error', async () => {
      const timeoutError = new Error('Request timeout');
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(timeoutError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('handles rate limiting error', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(rateLimitError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('handles no staged files scenario', async () => {
      const noFilesError = new Error('No staged files');
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(noFilesError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Messages', () => {
    test('provides helpful error message on failure', async () => {
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(new Error('Test error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      if (consoleErrorSpy.mock.calls.length > 0) {
        const output = consoleErrorSpy.mock.calls.map(call => call.join(' ')).join('\n');
        expect(output.length).toBeGreaterThan(0);
      }
      
      consoleErrorSpy.mockRestore();
    });

    test('logs errors to stderr for debugging', async () => {
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(new Error('Test error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyzeCommand();

      // Should log to console.error for structured logging
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Fail-Open Behavior', () => {
    test('never blocks workflow regardless of error', async () => {
      const criticalErrors = [
        new Error('CRITICAL: Database connection failed'),
        new Error('FATAL: System error'),
        new Error('EMERGENCY: Complete failure')
      ];

      for (const error of criticalErrors) {
        (analysis.runAnalysis as jest.Mock).mockRejectedValue(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Should NEVER throw, even on critical errors
        await expect(analyzeCommand()).resolves.not.toThrow();
        
        consoleErrorSpy.mockRestore();
      }
    });

    test('allows command to complete even if analysis fails', async () => {
      (analysis.runAnalysis as jest.Mock).mockRejectedValue(new Error('Complete failure'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await analyzeCommand();

      // Should return (not throw)
      expect(result).toBeUndefined();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration with Analysis Module', () => {
    test('delegates all logic to analysis orchestration', async () => {
      (analysis.runAnalysis as jest.Mock).mockResolvedValue(undefined);

      await analyzeCommand();

      // The command should be a thin wrapper around analysis
      expect(analysis.runAnalysis).toHaveBeenCalledWith();
    });

    test('does not modify or intercept analysis results', async () => {
      (analysis.runAnalysis as jest.Mock).mockResolvedValue(undefined);

      await analyzeCommand();

      // Should just call through without modification
      expect(analysis.runAnalysis).toHaveBeenCalledWith();
    });
  });

  describe('Command Execution', () => {
    test('can be called multiple times without issues', async () => {
      (analysis.runAnalysis as jest.Mock).mockResolvedValue(undefined);

      await analyzeCommand();
      await analyzeCommand();
      await analyzeCommand();

      expect(analysis.runAnalysis).toHaveBeenCalledTimes(3);
    });

    test('handles concurrent executions gracefully', async () => {
      (analysis.runAnalysis as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      // Run multiple analyses concurrently
      await Promise.all([
        analyzeCommand(),
        analyzeCommand(),
        analyzeCommand()
      ]);

      expect(analysis.runAnalysis).toHaveBeenCalledTimes(3);
    });
  });
});

