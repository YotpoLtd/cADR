import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { tmpdir } from 'os';
import { mkdirSync, writeFileSync } from 'fs';

const execAsync = promisify(exec);

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('Error Recovery Integration (Fail-Open Principle)', () => {
  const cliPath = path.join(__dirname, '../../packages/cli/dist/index.js');

  const createTestRepo = async (): Promise<string> => {
    const testDir = path.join(tmpdir(), `cadr-error-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    mkdirSync(testDir, { recursive: true });
    await execAsync(`cd ${testDir} && git init`);
    await execAsync(`cd ${testDir} && git config user.email "test@example.com"`);
    await execAsync(`cd ${testDir} && git config user.name "Test User"`);
    await execAsync(`cd ${testDir} && echo "test" > README.md && git add . && git commit -m "initial"`);
    
    // Create a test file to analyze
    writeFileSync(path.join(testDir, 'feature.ts'), 'export const NEW_FEATURE = true;');
    await execAsync(`cd ${testDir} && git add feature.ts`);
    
    return testDir;
  };

  const cleanup = async (testDir: string): Promise<void> => {
    await execAsync(`rm -rf ${testDir}`).catch(() => {});
  };

  describe('LLM API Errors', () => {
    test('Invalid API key fails gracefully without throwing', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: INVALID_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        // Set invalid API key
        process.env.INVALID_API_KEY = 'invalid-key-12345';

        // Should not throw - fail open (provide 'no' input to avoid hanging on prompts)
        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        // Should show error but exit cleanly
        expect(output).toMatch(/API key|authentication|invalid/i);
        // Should mention the failure
        expect(output).toMatch(/failed|error/i);
        
        delete process.env.INVALID_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });

    test('Missing API key environment variable fails gracefully', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: TOTALLY_MISSING_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        // Ensure env var doesn't exist (provide 'no' input to avoid hanging on prompts)
        const result = await execAsync(
          `cd ${testDir} && unset TOTALLY_MISSING_KEY && echo 'no' | node ${cliPath} analyze`
        );
        const output = result.stdout + result.stderr;
        
        // Should show clear error message
        expect(output).toMatch(/API key|TOTALLY_MISSING_KEY|environment variable|not set/i);
        // Should not crash
        expect(output).toMatch(/failed|error/i);
      } finally {
        await cleanup(testDir);
      }
    });

    test('Very short timeout still completes gracefully', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 1
`);

        process.env.OPENAI_API_KEY = 'fake-key-for-timeout-test';

        // Should handle timeout gracefully
        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        // Should either timeout or complete, but not crash
        // Timeout might show timeout error or might complete if fast
        expect(output).toBeDefined();
        
        delete process.env.OPENAI_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });
  });

  describe('Configuration Errors', () => {
    test('Malformed config fails gracefully', async () => {
      const testDir = await createTestRepo();
      
      try {
        // Write completely invalid YAML
        writeFileSync(path.join(testDir, 'cadr.yaml'), `{{{invalid yaml syntax]]}`);

        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        // Should show error but not crash
        expect(output).toMatch(/configuration|error|invalid/i);
      } finally {
        await cleanup(testDir);
      }
    });

    test('Empty config file fails gracefully', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), '');

        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        expect(output).toMatch(/configuration|error|required/i);
      } finally {
        await cleanup(testDir);
      }
    });
  });

  describe('Git Errors', () => {
    test('Corrupted git repo fails gracefully', async () => {
      const testDir = path.join(tmpdir(), `cadr-corrupt-${Date.now()}`);
      
      try {
        mkdirSync(testDir, { recursive: true });
        // Create .git directory but don't initialize properly
        mkdirSync(path.join(testDir, '.git'), { recursive: true });
        
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        // Should show git error but not crash
        expect(output).toMatch(/git|repository|error/i);
      } finally {
        await execAsync(`rm -rf ${testDir}`).catch(() => {});
      }
    });
  });

  describe('Edge Cases', () => {
    test('Very large number of files still completes or fails gracefully', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        // Create many files
        for (let i = 0; i < 20; i++) {
          writeFileSync(
            path.join(testDir, `file${i}.ts`),
            `export const VALUE${i} = ${i};`
          );
        }
        await execAsync(`cd ${testDir} && git add .`);

        process.env.OPENAI_API_KEY = 'fake-key';

        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        // Should handle large number of files (either succeed or fail gracefully)
        expect(output).toBeDefined();
        expect(output.length).toBeGreaterThan(0);
        
        delete process.env.OPENAI_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });

    test('Binary files in diff handled gracefully', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        // Create a binary-like file
        const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0xFF, 0xFE]);
        writeFileSync(path.join(testDir, 'binary.dat'), binaryContent);
        await execAsync(`cd ${testDir} && git add binary.dat`);

        process.env.OPENAI_API_KEY = 'fake-key';

        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        // Should handle binary files gracefully
        expect(output).toBeDefined();
        
        delete process.env.OPENAI_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });
  });

  describe('Fail-Open Principle Verification', () => {
    test('All error scenarios exit with code 0 (fail-open)', async () => {
      const testDir = await createTestRepo();
      
      try {
        // Missing config - should exit cleanly
        try {
          await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
          // Should not throw
        } catch (error) {
          // If it does exit with non-zero, that's a violation of fail-open
          fail('Should not exit with non-zero code (fail-open principle)');
        }
      } finally {
        await cleanup(testDir);
      }
    });

    test('Analysis continues to show results even after LLM errors', async () => {
      const testDir = await createTestRepo();
      
      try {
        writeFileSync(path.join(testDir, 'cadr.yaml'), `
provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30
`);

        process.env.OPENAI_API_KEY = 'definitely-invalid-key';

        const result = await execAsync(`cd ${testDir} && echo 'no' | node ${cliPath} analyze`);
        const output = result.stdout + result.stderr;
        
        // Even with invalid key, should show what it was trying to analyze
        expect(output).toMatch(/feature\.ts|analyzing/i);
        
        delete process.env.OPENAI_API_KEY;
      } finally {
        await cleanup(testDir);
      }
    });
  });
});

