import { runAnalysis } from './analysis';
import * as config from './config';
import * as llm from './llm';
import * as git from './git';

// Mock all dependencies
jest.mock('./config');
jest.mock('./llm');
jest.mock('./git');

describe('Analysis Orchestration', () => {
  const mockConfig = {
    provider: 'openai',
    analysis_model: 'gpt-4',
    api_key_env: 'OPENAI_API_KEY',
    timeout_seconds: 15
  };

  const mockStagedFiles = ['src/auth.ts', 'src/user.ts'];
  const mockDiff = 'diff --git a/src/auth.ts b/src/auth.ts\n+export function authenticateUser() {}';
  const mockAnalysisResult = {
    is_significant: true,
    reason: 'Introduces new authentication system',
    timestamp: new Date().toISOString()
  };
  const mockAnalysisResponse = {
    result: mockAnalysisResult,
    error: undefined
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (config.loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    (git.getStagedFiles as jest.Mock).mockResolvedValue(mockStagedFiles);
    (git.getStagedDiff as jest.Mock).mockResolvedValue(mockDiff);
    (llm.analyzeChanges as jest.Mock).mockResolvedValue(mockAnalysisResponse);
  });

  describe('runAnalysis', () => {
    test('runs complete analysis flow successfully', async () => {
      await runAnalysis();
      
      expect(config.loadConfig).toHaveBeenCalled();
      expect(git.getStagedFiles).toHaveBeenCalled();
      expect(git.getStagedDiff).toHaveBeenCalled();
      expect(llm.analyzeChanges).toHaveBeenCalled();
    });

    test('handles missing configuration gracefully', async () => {
      (config.loadConfig as jest.Mock).mockResolvedValue(null);
      
      await expect(runAnalysis()).resolves.not.toThrow();
    });

    test('handles no staged files gracefully', async () => {
      (git.getStagedFiles as jest.Mock).mockResolvedValue([]);
      
      await expect(runAnalysis()).resolves.not.toThrow();
    });

    test('handles LLM analysis failure gracefully', async () => {
      (llm.analyzeChanges as jest.Mock).mockResolvedValue({
        result: null,
        error: 'API key not found: OPENAI_API_KEY environment variable is not set'
      });
      
      await expect(runAnalysis()).resolves.not.toThrow();
    });
  });
});