/**
 * ADR File Management Module Tests
 * 
 * Tests for ADR file creation, numbering, and management.
 * Following TDD: These tests are written BEFORE implementation.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  titleToSlug,
  getNextADRNumber,
  generateADRFilename,
  ensureADRDirectory,
  saveADR,
  DEFAULT_ADR_DIR,
} from './adr';

describe('ADR Module', () => {
  const testDir = path.join(__dirname, '../test-adrs');

  beforeEach(() => {
    // Clean up test directory before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('titleToSlug', () => {
    it('converts title to lowercase slug', () => {
      expect(titleToSlug('Use PostgreSQL for Storage')).toBe('use-postgresql-for-storage');
    });

    it('replaces spaces with hyphens', () => {
      expect(titleToSlug('My Great Decision')).toBe('my-great-decision');
    });

    it('handles special characters', () => {
      expect(titleToSlug('API v2.0: New Endpoints!')).toBe('api-v2-0-new-endpoints');
    });

    it('removes leading and trailing hyphens', () => {
      expect(titleToSlug('---Test Title---')).toBe('test-title');
    });

    it('handles multiple consecutive spaces', () => {
      expect(titleToSlug('Too    Many    Spaces')).toBe('too-many-spaces');
    });

    it('handles empty string', () => {
      expect(titleToSlug('')).toBe('');
    });

    it('handles only special characters', () => {
      expect(titleToSlug('!!!')).toBe('');
    });
  });

  describe('generateADRFilename', () => {
    it('generates properly formatted filename', () => {
      expect(generateADRFilename(1, 'Use PostgreSQL')).toBe('0001-use-postgresql.md');
    });

    it('pads numbers with zeros to 4 digits', () => {
      expect(generateADRFilename(42, 'Test Decision')).toBe('0042-test-decision.md');
    });

    it('handles three-digit numbers', () => {
      expect(generateADRFilename(123, 'Another Decision')).toBe('0123-another-decision.md');
    });

    it('handles four-digit numbers', () => {
      expect(generateADRFilename(9999, 'Max Decision')).toBe('9999-max-decision.md');
    });

    it('handles titles with special characters', () => {
      expect(generateADRFilename(5, 'Switch to React v18!')).toBe('0005-switch-to-react-v18.md');
    });
  });

  describe('getNextADRNumber', () => {
    it('returns 1 for non-existent directory', () => {
      expect(getNextADRNumber(testDir)).toBe(1);
    });

    it('returns 1 for empty directory', () => {
      fs.mkdirSync(testDir, { recursive: true });
      expect(getNextADRNumber(testDir)).toBe(1);
    });

    it('returns next number after existing ADRs', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, '0001-first.md'), '# First');
      fs.writeFileSync(path.join(testDir, '0002-second.md'), '# Second');
      expect(getNextADRNumber(testDir)).toBe(3);
    });

    it('handles non-sequential numbers correctly', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, '0001-first.md'), '# First');
      fs.writeFileSync(path.join(testDir, '0005-fifth.md'), '# Fifth');
      expect(getNextADRNumber(testDir)).toBe(6);
    });

    it('ignores files without number prefix', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, '0001-first.md'), '# First');
      fs.writeFileSync(path.join(testDir, 'README.md'), '# README');
      fs.writeFileSync(path.join(testDir, 'template.md'), '# Template');
      expect(getNextADRNumber(testDir)).toBe(2);
    });

    it('ignores files with incorrect number format', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, '0001-first.md'), '# First');
      fs.writeFileSync(path.join(testDir, '1-wrong.md'), '# Wrong');
      fs.writeFileSync(path.join(testDir, '00002-also-wrong.md'), '# Also Wrong');
      expect(getNextADRNumber(testDir)).toBe(2);
    });

    it('handles directory with only non-ADR files', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'README.md'), '# README');
      expect(getNextADRNumber(testDir)).toBe(1);
    });
  });

  describe('ensureADRDirectory', () => {
    it('creates directory if it does not exist', () => {
      ensureADRDirectory(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
      expect(fs.statSync(testDir).isDirectory()).toBe(true);
    });

    it('creates nested directories recursively', () => {
      const nestedDir = path.join(testDir, 'nested', 'path');
      ensureADRDirectory(nestedDir);
      expect(fs.existsSync(nestedDir)).toBe(true);
      expect(fs.statSync(nestedDir).isDirectory()).toBe(true);
    });

    it('does not error if directory already exists', () => {
      fs.mkdirSync(testDir, { recursive: true });
      expect(() => ensureADRDirectory(testDir)).not.toThrow();
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('can be called multiple times safely', () => {
      ensureADRDirectory(testDir);
      ensureADRDirectory(testDir);
      ensureADRDirectory(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
    });
  });

  describe('saveADR', () => {
    it('saves ADR with correct filename in specified directory', () => {
      const content = '# Use PostgreSQL\n\n* Status: accepted\n\nContent here';
      const result = saveADR(content, 'Use PostgreSQL', testDir);

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(path.join(testDir, '0001-use-postgresql.md'));
      expect(result.error).toBeUndefined();
      expect(fs.existsSync(result.filePath!)).toBe(true);
    });

    it('creates directory automatically if it does not exist', () => {
      const content = '# Test ADR\n\nContent';
      const result = saveADR(content, 'Test ADR', testDir);

      expect(fs.existsSync(testDir)).toBe(true);
      expect(result.success).toBe(true);
    });

    it('increments number for multiple ADRs', () => {
      const result1 = saveADR('# First\n\nFirst ADR', 'First', testDir);
      const result2 = saveADR('# Second\n\nSecond ADR', 'Second', testDir);
      const result3 = saveADR('# Third\n\nThird ADR', 'Third', testDir);

      expect(result1.filePath).toContain('0001-first.md');
      expect(result2.filePath).toContain('0002-second.md');
      expect(result3.filePath).toContain('0003-third.md');
      
      expect(fs.existsSync(result1.filePath!)).toBe(true);
      expect(fs.existsSync(result2.filePath!)).toBe(true);
      expect(fs.existsSync(result3.filePath!)).toBe(true);
    });

    it('saves correct content to file', () => {
      const content = '# My Decision\n\n* Status: accepted\n* Date: 2025-10-21\n\n## Context\n\nSome context here.';
      const result = saveADR(content, 'My Decision', testDir);

      const savedContent = fs.readFileSync(result.filePath!, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('uses default directory when not specified', () => {
      // Clean up default directory
      const defaultPath = path.join(process.cwd(), DEFAULT_ADR_DIR);
      if (fs.existsSync(defaultPath)) {
        fs.rmSync(defaultPath, { recursive: true, force: true });
      }

      const content = '# Default Location\n\nContent';
      const result = saveADR(content, 'Default Location');

      expect(result.success).toBe(true);
      expect(result.filePath).toContain(DEFAULT_ADR_DIR);
      
      // Cleanup
      if (fs.existsSync(defaultPath)) {
        fs.rmSync(defaultPath, { recursive: true, force: true });
      }
    });

    it('handles file write errors gracefully', () => {
      // Create a read-only directory to trigger write error
      fs.mkdirSync(testDir, { recursive: true });
      
      // Make directory read-only (if not Windows)
      if (process.platform !== 'win32') {
        fs.chmodSync(testDir, 0o444);
        
        const content = '# Test\n\nContent';
        const result = saveADR(content, 'Test', testDir);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.filePath).toBeUndefined();
        
        // Restore permissions for cleanup
        fs.chmodSync(testDir, 0o755);
      } else {
        // On Windows, just verify error handling structure exists
        // Skip actual permission test as Windows permissions work differently
        const content = '# Test\n\nContent';
        const result = saveADR(content, 'Test', testDir);
        
        // Should succeed on Windows since we can't easily simulate permission errors
        expect(result).toHaveProperty('success');
        expect(typeof result.success).toBe('boolean');
      }
    });

    it('handles long titles correctly', () => {
      const longTitle = 'This is a very long title that should still work correctly when converted to a filename slug';
      const content = `# ${longTitle}\n\nContent`;
      const result = saveADR(content, longTitle, testDir);

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('0001-this-is-a-very-long-title');
    });

    it('handles titles with unicode characters', () => {
      const content = '# Decision with émojis 🚀\n\nContent';
      const result = saveADR(content, 'Decision with émojis 🚀', testDir);

      expect(result.success).toBe(true);
      // Should strip unicode to safe characters
      expect(result.filePath).toMatch(/0001-.+\.md$/);
    });
  });

  describe('DEFAULT_ADR_DIR constant', () => {
    it('is defined and has expected value', () => {
      expect(DEFAULT_ADR_DIR).toBeDefined();
      expect(DEFAULT_ADR_DIR).toBe('docs/adr');
    });
  });
});

