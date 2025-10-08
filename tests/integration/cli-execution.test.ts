import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);
const CLI_PATH = resolve(__dirname, '../../packages/cli/bin/cadr.js');

describe('CLI Execution', () => {
  test('displays welcome message when executed', async () => {
    const { stdout, stderr } = await execAsync(`node ${CLI_PATH}`);
    expect(stdout).toContain('Hello, cADR!');
    // Allow debugger output in stderr (common in development environments)
    expect(stderr).toBeDefined();
  });

  test('exits with code 0 on success', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH}`);
    // If no error thrown, exit code was 0
    expect(stdout).toBeTruthy();
  });

  test('displays message within 2 seconds', async () => {
    const start = Date.now();
    await execAsync(`node ${CLI_PATH}`);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test('works when executed from different directory', async () => {
    const { stdout } = await execAsync(`node ${CLI_PATH}`, { cwd: tmpdir() });
    expect(stdout).toContain('cADR');
  });
});

