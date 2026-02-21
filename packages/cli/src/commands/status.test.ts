import { statusCommand } from './status';
import * as config from '../config';
import * as fs from 'fs';

// Mock dependencies
jest.mock('../config');
jest.mock('fs');
jest.mock('../logger');

describe('Status Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('statusCommand', () => {
    test('displays status when config exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (config.getDefaultConfigPath as jest.Mock).mockReturnValue('cadr.yaml');
      (config.loadConfig as jest.Mock).mockResolvedValue({
        provider: 'openai',
        analysis_model: 'gpt-4',
        api_key_env: 'OPENAI_API_KEY'
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await statusCommand();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('cADR Status'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Provider: openai'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Model: gpt-4'));
      
      consoleSpy.mockRestore();
    });

    test('displays warning when config does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (config.getDefaultConfigPath as jest.Mock).mockReturnValue('cadr.yaml');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await statusCommand();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Not Found'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Run `cadr init`'));
      
      consoleSpy.mockRestore();
    });

    test('handles errors gracefully', async () => {
      (config.getDefaultConfigPath as jest.Mock).mockImplementation(() => {
        throw new Error('FileSystem error');
      });
      
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await statusCommand();
      
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to retrieve status'));
      
      errorSpy.mockRestore();
    });
  });
});
