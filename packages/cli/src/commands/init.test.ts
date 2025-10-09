import { initCommand } from './init';
import * as config from '../config';

// Mock dependencies
jest.mock('../config');

describe('Init Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initCommand', () => {
    test('calls createConfig when no config exists', async () => {
      (config.createConfig as jest.Mock).mockResolvedValue({ provider: 'openai' });
      
      await initCommand();
      
      expect(config.createConfig).toHaveBeenCalled();
    });

    test('handles config creation errors gracefully', async () => {
      (config.createConfig as jest.Mock).mockRejectedValue(new Error('Permission denied'));
      
      await expect(initCommand()).resolves.not.toThrow();
    });
  });
});