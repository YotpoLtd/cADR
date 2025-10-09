import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { tmpdir } from 'os';
import { mkdirSync, writeFileSync } from 'fs';

const execAsync = promisify(exec);

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('Config Validation Integration', () => {
  const cliPath = path.join(__dirname, '../../packages/cli/dist/index.js');

  const createTestRepo = async (): Promise<string> => {
    const testDir = path.join(tmpdir(), `cadr-config-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    mkdirSync(testDir, { recursive: true });
    await execAsync(`cd ${testDir} && git init`);
    await execAsync(`cd ${testDir} && git config user.email "test@example.com"`);
    await execAsync(`cd ${testDir} && git config user.name "Test User"`);
    await execAsync(`cd ${testDir} && echo "test" > README.md && git add . && git commit -m "initial"`);
    
    // Create a test file to analyze
    writeFileSync(path.join(testDir, 'test.ts'), 'export const TEST = true;');
    await execAsync(`cd ${testDir} && git add test.ts`);
    
    return testDir;
  };

  const cleanup = async (testDir: string): Promise<void> => {
    await execAsync(`rm -rf ${testDir}`).catch(() => {});
  };

  describe('Invalid Config Files', () => {
    test('Missing config file shows helpful error', async () => {
      const testDir = await createTestRepo();
      
      try {
        const { stdout, stderr } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        const output = stdout + stderr;
        
        expect(output).toMatch(/configuration|config|not found/i);
        expect(output).toMatch(/cadr init/i);
      } finally {
        await cleanup(testDir);
      }
    });

    test('Invalid YAML format shows parse error', async () => {
      const testDir = await createTestRepo();
      
      try {
        // Write invalid YAML
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
  invalid indentation here
api_key_env: OPENAI_API_KEY
`);

        const { stdout, stderr } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        const output = stdout + stderr;
        
        expect(output).toMatch(/configuration|invalid|error/i);
      } finally {
        await cleanup(testDir);
      }
    });

    test('Missing required field shows validation error', async () => {
      const testDir = await createTestRepo();
      
      try {
        // Config without required provider field
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
`);

        const { stdout, stderr } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        const output = stdout + stderr;
        
        expect(output).toMatch(/configuration|provider|required/i);
      } finally {
        await cleanup(testDir);
      }
    });

    test('Invalid timeout value shows validation error', async () => {
      const testDir = await createTestRepo();
      
      try {
        // Negative timeout
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: -5
`);

        const { stdout, stderr } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        const output = stdout + stderr;
        
        expect(output).toMatch(/configuration|timeout|invalid/i);
      } finally {
        await cleanup(testDir);
      }
    });

    test('Missing API key environment variable shows clear error', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: NONEXISTENT_API_KEY_VAR
analysis_model: gpt-4
timeout_seconds: 30
`);

        // Make sure the env var doesn't exist
        const { stdout, stderr } = await execAsync(
          `cd ${testDir} && unset NONEXISTENT_API_KEY_VAR && node ${cliPath} analyze`
        );
        const output = stdout + stderr;
        
        expect(output).toMatch(/API key|NONEXISTENT_API_KEY_VAR|environment variable/i);
      } finally {
        await cleanup(testDir);
      }
    });
  });

  describe('Valid Config Files', () => {
    test('Valid config allows analysis to proceed', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        // Set fake API key to get past config validation
        process.env.OPENAI_API_KEY = 'fake-key-for-test';

        const { stdout, stderr } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        const output = stdout + stderr;
        
        // Should not show config errors
        expect(output).not.toMatch(/configuration.*error/i);
        // Should show it's analyzing
        expect(output).toMatch(/analyzing|test\.ts/i);
        
        delete process.env.OPENAI_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });

    test('Config with optional fields works correctly', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 45
ignore_patterns:
  - "*.test.ts"
  - "node_modules/**"
`);

        process.env.OPENAI_API_KEY = 'fake-key-for-test';

        const { stdout, stderr } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        const output = stdout + stderr;
        
        expect(output).not.toMatch(/configuration.*error/i);
        
        delete process.env.OPENAI_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });
  });

  describe('Config Location', () => {
    test('Uses cadr.yaml from current directory', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        process.env.OPENAI_API_KEY = 'fake-key-for-test';

        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        
        // Should proceed with analysis (config found)
        expect(stdout).toMatch(/analyzing/i);
        
        delete process.env.OPENAI_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });
  });
});

