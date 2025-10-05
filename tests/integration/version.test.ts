import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const execAsync = promisify(exec);
const CLI_PATH = resolve(__dirname, '../../packages/cli/bin/cadr.js');
const PACKAGE_JSON = resolve(__dirname, '../../packages/cli/package.json');

describe('Version Display', () => {
  test('displayed version matches package.json', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH}`);
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'));
    
    expect(stdout).toContain(packageJson.version);
  });

  test('version format is semantic (X.Y.Z)', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH}`);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });
});

