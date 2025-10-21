/**
 * Analysis Module Integration Tests
 * 
 * Tests for the complete analysis workflow including generation.
 * Following TDD: These tests are written BEFORE implementation.
 */

/* eslint-disable no-console */

import { runAnalysis } from './analysis';
import * as config from './config';
import * as git from './git';
import * as llm from './llm';
import * as prompts from './prompts';
import * as adr from './adr';
import { DiffOptions } from './git';

// Mock all dependencies
jest.mock('./config');
jest.mock('./git');
jest.mock('./llm');
jest.mock('./prompts');
jest.mock('./adr');

describe('Analysis with Generation Integration', () => {
  const mockConfig: config.AnalysisConfig = {
    provider: 'openai',
    analysis_model: 'gpt-4',
    api_key_env: 'OPENAI_API_KEY',
    timeout_seconds: 15
  };

  const mockDiffOptions: DiffOptions = { mode: 'staged' };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to silence output during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    // Default mocks
    (config.loadConfig as jest.Mock).mockResolvedValue(mockConfig);
    (git.getChangedFiles as jest.Mock).mockResolvedValue([
      'src/database.ts',
      'src/config.ts'
    ]);
    (git.getDiff as jest.Mock).mockResolvedValue(`
diff --git a/src/database.ts b/src/database.ts
+import pg from 'pg';
+export const database = new pg.Pool();
    `);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('runAnalysis without generation', () => {
    test('completes successfully when change is not significant', async () => {
      (llm.analyzeChanges as jest.Mock).mockResolvedValue({
        result: {
          is_significant: false,
          reason: 'Minor code formatting changes',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });

      await runAnalysis(mockDiffOptions);

      expect(config.loadConfig).toHaveBeenCalled();
      expect(git.getChangedFiles).toHaveBeenCalledWith(mockDiffOptions);
      expect(git.getDiff).toHaveBeenCalledWith(mockDiffOptions);
      expect(llm.analyzeChanges).toHaveBeenCalled();
      
      // Should not prompt for generation if not significant
      expect(prompts.promptForGeneration).not.toHaveBeenCalled();
    });

    test('handles missing configuration gracefully', async () => {
      (config.loadConfig as jest.Mock).mockResolvedValue(null);

      await runAnalysis(mockDiffOptions);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Configuration'));
      expect(git.getChangedFiles).not.toHaveBeenCalled();
    });

    test('handles no changed files gracefully', async () => {
      (git.getChangedFiles as jest.Mock).mockResolvedValue([]);

      await runAnalysis(mockDiffOptions);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No changes'));
      expect(git.getDiff).not.toHaveBeenCalled();
    });

    test('handles git errors gracefully', async () => {
      (git.getChangedFiles as jest.Mock).mockRejectedValue(new Error('Git error'));

      await runAnalysis(mockDiffOptions);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed'));
    });
  });

  describe('runAnalysis with generation - user confirms', () => {
    beforeEach(() => {
      (llm.analyzeChanges as jest.Mock).mockResolvedValue({
        result: {
          is_significant: true,
          reason: 'Introduces PostgreSQL as primary datastore',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (prompts.promptForGeneration as jest.Mock).mockResolvedValue(true); // User confirms
    });

    test('prompts for generation when change is significant', async () => {
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: '# Use PostgreSQL\n\n* Status: accepted',
          title: 'Use PostgreSQL',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: true,
        filePath: 'docs/adr/0001-use-postgresql.md'
      });

      await runAnalysis(mockDiffOptions);

      expect(prompts.promptForGeneration).toHaveBeenCalledWith(
        'Introduces PostgreSQL as primary datastore'
      );
    });

    test('generates ADR when user confirms', async () => {
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: '# Use PostgreSQL\n\n* Status: accepted',
          title: 'Use PostgreSQL',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: true,
        filePath: 'docs/adr/0001-use-postgresql.md'
      });

      await runAnalysis(mockDiffOptions);

      expect(llm.generateADRContent).toHaveBeenCalled();
      
      const generationCall = (llm.generateADRContent as jest.Mock).mock.calls[0];
      expect(generationCall[0]).toEqual(mockConfig);
      expect(generationCall[1]).toMatchObject({
        reason: 'Introduces PostgreSQL as primary datastore'
      });
    });

    test('saves ADR file after successful generation', async () => {
      const mockADRContent = '# Use PostgreSQL\n\n* Status: accepted\n\n## Context\n\nWe need a database.';
      
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: mockADRContent,
          title: 'Use PostgreSQL',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: true,
        filePath: 'docs/adr/0001-use-postgresql.md'
      });

      await runAnalysis(mockDiffOptions);

      expect(adr.saveADR).toHaveBeenCalledWith(
        mockADRContent,
        'Use PostgreSQL'
      );
    });

    test('displays success message with file path', async () => {
      const filePath = 'docs/adr/0001-use-postgresql.md';
      
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: '# Use PostgreSQL\n\n* Status: accepted',
          title: 'Use PostgreSQL',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: true,
        filePath
      });

      await runAnalysis(mockDiffOptions);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Success'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(filePath));
    });

    test('displays next steps after successful generation', async () => {
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: '# Use PostgreSQL\n\n* Status: accepted',
          title: 'Use PostgreSQL',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: true,
        filePath: 'docs/adr/0001-use-postgresql.md'
      });

      await runAnalysis(mockDiffOptions);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Next steps'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Review'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Commit'));
    });
  });

  describe('runAnalysis with generation - user declines', () => {
    beforeEach(() => {
      (llm.analyzeChanges as jest.Mock).mockResolvedValue({
        result: {
          is_significant: true,
          reason: 'Introduces Redis caching layer',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (prompts.promptForGeneration as jest.Mock).mockResolvedValue(false); // User declines
    });

    test('skips generation when user declines', async () => {
      await runAnalysis(mockDiffOptions);

      expect(prompts.promptForGeneration).toHaveBeenCalled();
      expect(llm.generateADRContent).not.toHaveBeenCalled();
      expect(adr.saveADR).not.toHaveBeenCalled();
    });

    test('displays skip message when user declines', async () => {
      await runAnalysis(mockDiffOptions);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Skipping'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('manual'));
    });
  });

  describe('runAnalysis with generation - error handling', () => {
    beforeEach(() => {
      (llm.analyzeChanges as jest.Mock).mockResolvedValue({
        result: {
          is_significant: true,
          reason: 'Introduces Kafka event streaming',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (prompts.promptForGeneration as jest.Mock).mockResolvedValue(true);
    });

    test('handles generation errors gracefully', async () => {
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: null,
        error: 'API rate limit exceeded'
      });

      await runAnalysis(mockDiffOptions);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('generation failed'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('rate limit'));
      expect(adr.saveADR).not.toHaveBeenCalled();
    });

    test('handles file save errors gracefully', async () => {
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: '# Use Kafka\n\n* Status: accepted',
          title: 'Use Kafka',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: false,
        error: 'Permission denied'
      });

      await runAnalysis(mockDiffOptions);

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to save'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));
    });

    test('continues workflow on generation error (fail-open)', async () => {
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: null,
        error: 'Network error'
      });

      // Should complete without throwing
      await expect(runAnalysis(mockDiffOptions)).resolves.not.toThrow();
    });

    test('continues workflow on save error (fail-open)', async () => {
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: '# Decision\n\n* Status: accepted',
          title: 'Decision',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: false,
        error: 'Disk full'
      });

      // Should complete without throwing
      await expect(runAnalysis(mockDiffOptions)).resolves.not.toThrow();
    });
  });

  describe('runAnalysis - complete workflow', () => {
    test('completes full happy path workflow', async () => {
      // Analysis detects significance
      (llm.analyzeChanges as jest.Mock).mockResolvedValue({
        result: {
          is_significant: true,
          reason: 'Introduces GraphQL API layer',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      // User confirms
      (prompts.promptForGeneration as jest.Mock).mockResolvedValue(true);
      
      // Generation succeeds
      (llm.generateADRContent as jest.Mock).mockResolvedValue({
        result: {
          content: '# Use GraphQL\n\n* Status: accepted',
          title: 'Use GraphQL',
          timestamp: new Date().toISOString()
        },
        error: undefined
      });
      
      // Save succeeds
      (adr.saveADR as jest.Mock).mockReturnValue({
        success: true,
        filePath: 'docs/adr/0001-use-graphql.md'
      });

      await runAnalysis(mockDiffOptions);

      // Verify complete workflow executed
      expect(config.loadConfig).toHaveBeenCalled();
      expect(git.getChangedFiles).toHaveBeenCalled();
      expect(git.getDiff).toHaveBeenCalled();
      expect(llm.analyzeChanges).toHaveBeenCalled();
      expect(prompts.promptForGeneration).toHaveBeenCalled();
      expect(llm.generateADRContent).toHaveBeenCalled();
      expect(adr.saveADR).toHaveBeenCalled();
      
      // Verify success output
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Success'));
    });
  });
});

