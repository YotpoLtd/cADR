import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

describe('LLM Analysis Integration', () => {
  const testDir = '/tmp/cadr-llm-test';
  const cliPath = path.join(__dirname, '../../packages/cli/dist/index.js');

  beforeAll(async () => {
    // Create test directory and initialize git
    await execAsync(`mkdir -p ${testDir}`);
    await execAsync(`cd ${testDir} && git init`);
    await execAsync(`cd ${testDir} && git config user.email "test@example.com"`);
    await execAsync(`cd ${testDir} && git config user.name "Test User"`);
  });

  afterAll(async () => {
    // Clean up test directory
    await execAsync(`rm -rf ${testDir}`);
  });

  describe('LLM Analysis Core Functionality', () => {
    test('Analyzes Significant Architectural Changes', async () => {
      // Create config file
      const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
      await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
      
      // Create files representing significant architectural changes
      await execAsync(
        `cd ${testDir} && echo 'export interface DatabaseConfig { host: string; port: number; database: string; }' > database-config.ts`
      );
      await execAsync(
        `cd ${testDir} && echo 'export class DatabaseConnection { async connect() { return true; } }' > database-connection.ts`
      );
      await execAsync(`cd ${testDir} && git add database-config.ts database-connection.ts`);

      process.env.OPENAI_API_KEY = 'test-api-key';

      try {
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        expect(stdout).toContain('database-config.ts');
        expect(stdout).toContain('database-connection.ts');
      } finally {
        delete process.env.OPENAI_API_KEY;
      }
    });
  });
});
