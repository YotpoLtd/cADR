import { 
  ANALYSIS_PROMPT_V1, 
  formatPrompt, 
  GENERATION_PROMPT_V1,
  formatGenerationPrompt,
  promptForGeneration 
} from './prompts';
import * as readline from 'readline';

// Mock readline
jest.mock('readline');

describe('Prompts Module', () => {
  describe('ANALYSIS_PROMPT_V1', () => {
    test('prompt template includes required placeholders', () => {
      expect(ANALYSIS_PROMPT_V1).toContain('{file_paths}');
      expect(ANALYSIS_PROMPT_V1).toContain('{diff_content}');
    });

    test('prompt template includes architectural significance instructions', () => {
      expect(ANALYSIS_PROMPT_V1).toContain('architectural');
      expect(ANALYSIS_PROMPT_V1).toContain('significant');
    });

    test('prompt template specifies JSON response format', () => {
      expect(ANALYSIS_PROMPT_V1).toContain('JSON');
      expect(ANALYSIS_PROMPT_V1).toContain('is_significant');
      expect(ANALYSIS_PROMPT_V1).toContain('reason');
    });

    test('prompt template includes analysis criteria', () => {
      const prompt = ANALYSIS_PROMPT_V1.toLowerCase();
      
      // Should mention various architectural concerns
      expect(
        prompt.includes('pattern') ||
        prompt.includes('data model') ||
        prompt.includes('api') ||
        prompt.includes('security')
      ).toBe(true);
    });

    test('prompt includes all specific architectural significance criteria', () => {
      const prompt = ANALYSIS_PROMPT_V1.toLowerCase();
      
      // Must include all key criteria
      expect(prompt).toContain('dependency');
      expect(prompt).toContain('infrastructure');
      expect(prompt).toContain('api contract');
      expect(prompt).toContain('data schema');
      expect(prompt).toContain('authentication');
      expect(prompt).toContain('authorization');
      expect(prompt).toContain('cross-cutting');
    });

    test('prompt specifies empty string for non-significant changes', () => {
      expect(ANALYSIS_PROMPT_V1).toContain('empty string');
    });

    test('prompt emphasizes strict JSON output format', () => {
      expect(ANALYSIS_PROMPT_V1).toContain('minified');
      expect(ANALYSIS_PROMPT_V1).toContain('no preamble');
      expect(ANALYSIS_PROMPT_V1).toContain('no markdown');
    });
  });

  describe('formatPrompt', () => {
    const mockData = {
      file_paths: ['src/auth.ts', 'src/user.ts', 'src/middleware/auth.ts'],
      diff_content: `
diff --git a/src/auth.ts b/src/auth.ts
index 1234567..abcdefg 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1,5 +1,10 @@
+import jwt from 'jsonwebtoken';
+
+export function authenticateUser(token: string) {
+  return jwt.verify(token, process.env.JWT_SECRET);
+}
`
    };

    test('replaces file_paths placeholder with formatted list', () => {
      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, mockData);

      expect(formatted).not.toContain('{file_paths}');
      expect(formatted).toContain('src/auth.ts');
      expect(formatted).toContain('src/user.ts');
      expect(formatted).toContain('src/middleware/auth.ts');
    });

    test('replaces diff_content placeholder with actual diff', () => {
      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, mockData);

      expect(formatted).not.toContain('{diff_content}');
      expect(formatted).toContain('diff --git');
      expect(formatted).toContain('authenticateUser');
      expect(formatted).toContain('jwt.verify');
    });

    test('handles empty file paths array', () => {
      const emptyData = {
        file_paths: [],
        diff_content: mockData.diff_content
      };

      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, emptyData);

      expect(formatted).not.toContain('{file_paths}');
      expect(formatted).toBeDefined();
    });

    test('handles empty diff content', () => {
      const emptyDiff = {
        file_paths: mockData.file_paths,
        diff_content: ''
      };

      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, emptyDiff);

      expect(formatted).not.toContain('{diff_content}');
      expect(formatted).toBeDefined();
    });

    test('preserves prompt structure and instructions', () => {
      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, mockData);

      expect(formatted).toContain('architectural');
      expect(formatted).toContain('significant');
      expect(formatted).toContain('JSON');
    });

    test('formats multiple file paths readably', () => {
      const manyFiles = {
        file_paths: [
          'src/auth/login.ts',
          'src/auth/logout.ts',
          'src/auth/session.ts',
          'src/middleware/auth.ts',
          'src/models/user.ts'
        ],
        diff_content: mockData.diff_content
      };

      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, manyFiles);

      // Should list all files in a readable format
      manyFiles.file_paths.forEach(filePath => {
        expect(formatted).toContain(filePath);
      });
    });

    test('handles special characters in diff content', () => {
      const specialChars = {
        file_paths: ['src/test.ts'],
        diff_content: `
diff --git a/src/test.ts b/src/test.ts
+const regex = /[a-z]+/gi;
+const template = \`Hello \${name}\`;
+const quote = "He said: \\"Hello\\"";
`
      };

      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, specialChars);

      expect(formatted).toContain('regex');
      expect(formatted).toContain('template');
      expect(formatted).toContain('quote');
    });

    test('returns valid prompt with all placeholders replaced', () => {
      const formatted = formatPrompt(ANALYSIS_PROMPT_V1, mockData);

      // Should not contain any unreplaced placeholders
      expect(formatted).not.toMatch(/\{[a-z_]+\}/);
    });
  });

  describe('Prompt Versioning', () => {
    test('ANALYSIS_PROMPT_V1 is exported and accessible', () => {
      expect(ANALYSIS_PROMPT_V1).toBeDefined();
      expect(typeof ANALYSIS_PROMPT_V1).toBe('string');
      expect(ANALYSIS_PROMPT_V1.length).toBeGreaterThan(0);
    });

    test('prompt version is clearly identifiable', () => {
      // Future proofing: when V2 is added, we should be able to distinguish versions
      expect(ANALYSIS_PROMPT_V1).toBeDefined();
    });
  });

  describe('Prompt Quality', () => {
    test('prompt is not empty or too short', () => {
      expect(ANALYSIS_PROMPT_V1.length).toBeGreaterThan(50);
    });

    test('prompt provides clear instructions', () => {
      const prompt = ANALYSIS_PROMPT_V1.toLowerCase();
      
      // Should have clear action words
      expect(
        prompt.includes('analyze') ||
        prompt.includes('determine') ||
        prompt.includes('evaluate')
      ).toBe(true);
    });

    test('prompt specifies expected output format', () => {
      expect(ANALYSIS_PROMPT_V1).toContain('is_significant');
      expect(ANALYSIS_PROMPT_V1).toContain('reason');
      
      // Should specify it's a boolean
      const hasBoolean = 
        ANALYSIS_PROMPT_V1.includes('boolean') ||
        ANALYSIS_PROMPT_V1.includes('true') ||
        ANALYSIS_PROMPT_V1.includes('false');
      
      expect(hasBoolean).toBe(true);
    });
  });

  describe('GENERATION_PROMPT_V1', () => {
    test('prompt template includes required placeholders', () => {
      expect(GENERATION_PROMPT_V1).toContain('{file_paths}');
      expect(GENERATION_PROMPT_V1).toContain('{diff_content}');
      expect(GENERATION_PROMPT_V1).toContain('{current_date}');
    });

    test('prompt includes MADR template structure', () => {
      const prompt = GENERATION_PROMPT_V1.toLowerCase();
      
      // Must mention MADR sections
      expect(prompt).toContain('context and problem statement');
      expect(prompt).toContain('decision drivers');
      expect(prompt).toContain('considered options');
      expect(prompt).toContain('decision outcome');
      expect(prompt).toContain('consequences');
    });

    test('prompt specifies MADR format explicitly', () => {
      expect(GENERATION_PROMPT_V1).toContain('MADR');
    });

    test('prompt includes all required MADR sections in template', () => {
      const prompt = GENERATION_PROMPT_V1;
      
      // Check for MADR section headings
      expect(prompt).toContain('# [');  // Title format
      expect(prompt).toContain('* Status:');
      expect(prompt).toContain('* Date:');
      expect(prompt).toContain('## Context and Problem Statement');
      expect(prompt).toContain('## Decision Drivers');
      expect(prompt).toContain('## Considered Options');
      expect(prompt).toContain('## Decision Outcome');
      expect(prompt).toContain('### Consequences');
      expect(prompt).toContain('## More Information');
    });

    test('prompt instructs to use EXACT markdown structure', () => {
      const prompt = GENERATION_PROMPT_V1.toUpperCase();
      expect(prompt).toContain('EXACT');
    });

    test('prompt specifies response should be markdown only', () => {
      const prompt = GENERATION_PROMPT_V1.toLowerCase();
      expect(prompt).toContain('respond only');
      expect(prompt).toContain('markdown');
    });

    test('prompt version is clearly identified', () => {
      expect(GENERATION_PROMPT_V1).toBeDefined();
      expect(typeof GENERATION_PROMPT_V1).toBe('string');
    });
  });

  describe('formatGenerationPrompt', () => {
    const mockData = {
      file_paths: ['src/database.ts', 'src/config.ts'],
      diff_content: `
diff --git a/src/database.ts b/src/database.ts
+import pg from 'pg';
+export const database = new pg.Pool();
`
    };

    test('replaces file_paths placeholder with formatted list', () => {
      const formatted = formatGenerationPrompt(mockData);

      expect(formatted).not.toContain('{file_paths}');
      expect(formatted).toContain('src/database.ts');
      expect(formatted).toContain('src/config.ts');
    });

    test('replaces diff_content placeholder with actual diff', () => {
      const formatted = formatGenerationPrompt(mockData);

      expect(formatted).not.toContain('{diff_content}');
      expect(formatted).toContain('diff --git');
      expect(formatted).toContain('pg.Pool');
    });

    test('replaces current_date placeholder with valid date', () => {
      const formatted = formatGenerationPrompt(mockData);

      expect(formatted).not.toContain('{current_date}');
      // Check for YYYY-MM-DD format
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('current date is today\'s date', () => {
      const formatted = formatGenerationPrompt(mockData);
      const today = new Date().toISOString().split('T')[0];
      
      expect(formatted).toContain(today);
    });

    test('handles empty file paths array', () => {
      const emptyData = {
        file_paths: [],
        diff_content: mockData.diff_content
      };

      const formatted = formatGenerationPrompt(emptyData);
      expect(formatted).not.toContain('{file_paths}');
      expect(formatted).toBeDefined();
    });

    test('preserves MADR template structure', () => {
      const formatted = formatGenerationPrompt(mockData);

      expect(formatted).toContain('Context and Problem Statement');
      expect(formatted).toContain('Decision Drivers');
      expect(formatted).toContain('Considered Options');
      expect(formatted).toContain('Decision Outcome');
      expect(formatted).toContain('Consequences');
    });

    test('returns valid prompt with all placeholders replaced', () => {
      const formatted = formatGenerationPrompt(mockData);

      // Should not contain any unreplaced placeholders
      expect(formatted).not.toMatch(/\{[a-z_]+\}/);
    });
  });

  describe('promptForGeneration', () => {
    let mockReadlineInterface: {
      question: jest.Mock;
      close: jest.Mock;
    };

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Setup mock readline interface
      mockReadlineInterface = {
        question: jest.fn(),
        close: jest.fn()
      };

      (readline.createInterface as jest.Mock).mockReturnValue(mockReadlineInterface);
    });

    test('returns true for empty input (ENTER pressed)', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('');  // Simulate pressing ENTER
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(true);
      expect(mockReadlineInterface.close).toHaveBeenCalled();
    });

    test('returns true for "yes" input', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('yes');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(true);
    });

    test('returns true for "y" input', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('y');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(true);
    });

    test('returns true for "YES" input (case insensitive)', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('YES');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(true);
    });

    test('returns true for "Y" input (case insensitive)', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('Y');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(true);
    });

    test('returns false for "no" input', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('no');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(false);
    });

    test('returns false for "n" input', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('n');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(false);
    });

    test('returns false for any other input', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('maybe');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(false);
    });

    test('handles whitespace in input', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('  yes  ');
      });

      const result = await promptForGeneration('Test reason');

      expect(result).toBe(true);
    });

    test('displays the reason in the prompt', async () => {
      const reason = 'Introduces PostgreSQL as primary datastore';
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('yes');
      });

      await promptForGeneration(reason);

      // Check that question was called
      expect(mockReadlineInterface.question).toHaveBeenCalled();
    });

    test('closes readline interface after response', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('yes');
      });

      await promptForGeneration('Test reason');

      expect(mockReadlineInterface.close).toHaveBeenCalledTimes(1);
    });

    test('creates readline interface with stdin and stdout', async () => {
      mockReadlineInterface.question.mockImplementation((question: string, callback: (answer: string) => void) => {
        callback('yes');
      });

      await promptForGeneration('Test reason');

      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout
      });
    });
  });

  describe('Generation Prompt Quality', () => {
    test('generation prompt is substantial', () => {
      expect(GENERATION_PROMPT_V1.length).toBeGreaterThan(200);
    });

    test('generation prompt provides clear instructions', () => {
      const prompt = GENERATION_PROMPT_V1.toLowerCase();
      
      expect(
        prompt.includes('generate') ||
        prompt.includes('write') ||
        prompt.includes('create')
      ).toBe(true);
    });

    test('both prompts are exported and distinct', () => {
      expect(ANALYSIS_PROMPT_V1).toBeDefined();
      expect(GENERATION_PROMPT_V1).toBeDefined();
      expect(ANALYSIS_PROMPT_V1).not.toBe(GENERATION_PROMPT_V1);
    });
  });
});

