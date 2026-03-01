import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';

const execAsync = promisify(exec);
const CLI_PATH = resolve(__dirname, '../../../packages/cli/dist/index.js');
const PACKAGE_JSON = resolve(__dirname, '../../../packages/cli/package.json');

jest.setTimeout(30000);

const describeIfBuilt = existsSync(CLI_PATH) ? describe : describe.skip;

describeIfBuilt('CLI E2E Smoke Tests', () => {
  test('CLI entry point has shebang', () => {
    expect(existsSync(CLI_PATH)).toBe(true);

    const content = readFileSync(CLI_PATH, 'utf-8');
    const firstLine = content.split('\n')[0];

    expect(firstLine).toBe('#!/usr/bin/env node');
  });

  test('No args displays help', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH}`);
    expect(stdout).toContain('cADR');
    expect(stdout).toContain('USAGE');
    expect(stdout).toContain('COMMANDS');
  });

  test('--help flag displays help', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
    expect(stdout).toContain('cADR');
    expect(stdout).toContain('USAGE');
  });

  test('Unknown command exits 1 with help', async () => {
    try {
      await execAsync(`node ${CLI_PATH} unknown-command`, { cwd: tmpdir() });
      fail('Should have thrown for unknown command');
    } catch (error: unknown) {
      const err = error as { code?: number; stdout?: string; stderr?: string };
      expect(err.code).toBe(1);
      const output = (err.stdout || '') + (err.stderr || '');
      expect(output).toMatch(/unknown command/i);
      expect(output).toContain('USAGE');
    }
  });

  test('status command shows environment info', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} status`, { cwd: tmpdir() });
    expect(stdout).toMatch(/cADR Status|Status/);
    expect(stdout).toContain('Configuration');
    expect(stdout).toContain('Environment');
  });

  test('--version matches package.json and is semver', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'));
    expect(stdout).toContain(pkg.version);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });
});
