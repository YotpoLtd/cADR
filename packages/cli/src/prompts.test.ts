import { ANALYSIS_PROMPT_V1, formatPrompt } from './prompts';

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
});

