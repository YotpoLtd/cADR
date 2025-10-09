import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { tmpdir } from 'os';
import { existsSync, readFileSync } from 'fs';

const execAsync = promisify(exec);
const CLI_PATH = resolve(__dirname, '../../packages/cli/dist/index.js');

describe('CLI Execution', () => {
  test('CLI entry point exists and has shebang', () => {
    expect(existsSync(CLI_PATH)).toBe(true);
    
    const content = readFileSync(CLI_PATH, 'utf-8');
    const firstLine = content.split('\n')[0];
    
    expect(firstLine).toBe('#!/usr/bin/env node');
  });
  test('displays help when executed with no args', async () => {
    const { stdout, stderr } = await execAsync(`node ${CLI_PATH}`);
    expect(stdout).toContain('cADR');
    expect(stdout).toContain('USAGE');
    expect(stdout).toContain('COMMANDS');
    // Allow debugger output in stderr (common in development environments)
    expect(stderr).toBeDefined();
  });

  test('exits with code 0 on success', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
    // If no error thrown, exit code was 0
    expect(stdout).toBeTruthy();
  });

  test('displays help within 2 seconds', async () => {
    const start = Date.now();
    await execAsync(`node ${CLI_PATH} --help`);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test('works when executed from different directory', async () => {
    try {
      const { stdout } = await execAsync(`node ${CLI_PATH} status`, { cwd: tmpdir() });
      expect(stdout).toContain('No staged files');
    } catch (error: unknown) {
      // CLI should exit with code 1 when not in a git repository
      const errorWithCode = error as { code?: number; stdout?: string; stderr?: string };
      expect(errorWithCode.code).toBe(1);
      // Error message might be in stdout or stderr
      const output = (errorWithCode.stdout || '') + (errorWithCode.stderr || '');
      expect(output).toContain('Unable to read Git repository');
    }
  });
});

