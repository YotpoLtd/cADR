import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { tmpdir } from 'os';
import { existsSync, readFileSync } from 'fs';

const execAsync = promisify(exec);
const CLI_PATH = resolve(__dirname, '../../packages/cli/dist/index.js');

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('CLI Infrastructure Tests', () => {
  describe('Build Artifacts', () => {
    test('CLI entry point exists and has shebang', () => {
      expect(existsSync(CLI_PATH)).toBe(true);
      
      const content = readFileSync(CLI_PATH, 'utf-8');
      const firstLine = content.split('\n')[0];
      
      expect(firstLine).toBe('#!/usr/bin/env node');
    });
  });

  describe('Help and Version', () => {
    test('displays help when executed with no args', async () => {
      const { stdout, stderr } = await execAsync(`node ${CLI_PATH}`);
      expect(stdout).toContain('cADR');
      expect(stdout).toContain('USAGE');
      expect(stdout).toContain('COMMANDS');
      expect(stderr).toBeDefined();
    });

    test('displays help with --help flag', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      expect(stdout).toContain('cADR');
      expect(stdout).toContain('USAGE');
    });

    test('displays help within 2 seconds', async () => {
      const start = Date.now();
      await execAsync(`node ${CLI_PATH} --help`);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Command Validation', () => {
    test('unknown command shows error and help', async () => {
      try {
        await execAsync(`node ${CLI_PATH} unknown-command`, { cwd: tmpdir() });
        fail('Should have thrown for unknown command');
      } catch (error: unknown) {
        const errorWithCode = error as { code?: number; stdout?: string; stderr?: string };
        expect(errorWithCode.code).toBe(1);
        const output = (errorWithCode.stdout || '') + (errorWithCode.stderr || '');
        expect(output).toMatch(/unknown command/i);
        expect(output).toContain('USAGE');
      }
    });

    test('status command is removed (regression test)', async () => {
      try {
        await execAsync(`node ${CLI_PATH} status`, { cwd: tmpdir() });
        fail('Status command should not exist');
      } catch (error: unknown) {
        const errorWithCode = error as { code?: number; stdout?: string; stderr?: string };
        expect(errorWithCode.code).toBe(1);
        const output = (errorWithCode.stdout || '') + (errorWithCode.stderr || '');
        expect(output).toContain('Unknown command');
      }
    });
  });
});

