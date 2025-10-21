import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { tmpdir } from 'os';
import { mkdirSync, writeFileSync } from 'fs';

const execAsync = promisify(exec);

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('Git Operations Integration', () => {
  const cliPath = path.join(__dirname, '../../packages/cli/dist/index.js');

  describe('Error Handling', () => {
    test('cadr analyze fails gracefully when not in a git repository', async () => {
      // Create a non-git directory
      const nonGitDir = path.join(tmpdir(), `cadr-no-git-${Date.now()}`);
      mkdirSync(nonGitDir, { recursive: true });

      try {
        // Create config file
        const configPath = path.join(nonGitDir, 'cadr.yaml');
        writeFileSync(configPath, `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`);

        const { stdout, stderr } = await execAsync(`cd ${nonGitDir} && node ${cliPath} analyze`);
        const output = stdout + stderr;
        
        // Should show git error message
        expect(output).toMatch(/git|repository/i);
      } finally {
        // Cleanup
        await execAsync(`rm -rf ${nonGitDir}`).catch(() => {});
      }
    });

    test('cadr analyze with invalid git reference shows helpful error', async () => {
      const testDir = path.join(tmpdir(), `cadr-invalid-ref-${Date.now()}`);
      
      try {
        // Create git repo
        mkdirSync(testDir, { recursive: true });
        await execAsync(`cd ${testDir} && git init`);
        await execAsync(`cd ${testDir} && git config user.email "test@example.com"`);
        await execAsync(`cd ${testDir} && git config user.name "Test User"`);
        await execAsync(`cd ${testDir} && echo "test" > README.md && git add README.md && git commit -m "initial"`);

        // Create config
        const configPath = path.join(testDir, 'cadr.yaml');
        writeFileSync(configPath, `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`);

        // Try to analyze with invalid ref
        const { stdout, stderr } = await execAsync(
          `cd ${testDir} && node ${cliPath} analyze --base invalid-ref-does-not-exist`
        );
        const output = stdout + stderr;
        
        // Should show error about invalid reference
        expect(output).toMatch(/invalid|reference|not exist/i);
      } finally {
        await execAsync(`rm -rf ${testDir}`).catch(() => {});
      }
    });
  });

  describe('Empty States', () => {
    test('cadr analyze with no uncommitted changes shows helpful message', async () => {
      const testDir = path.join(tmpdir(), `cadr-no-changes-${Date.now()}`);
      
      try {
        // Create git repo with committed files
        mkdirSync(testDir, { recursive: true });
        await execAsync(`cd ${testDir} && git init`);
        await execAsync(`cd ${testDir} && git config user.email "test@example.com"`);
        await execAsync(`cd ${testDir} && git config user.name "Test User"`);
        
        // Create and commit config
        const configPath = path.join(testDir, 'cadr.yaml');
        writeFileSync(configPath, `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`);
        await execAsync(`cd ${testDir} && git add . && git commit -m "initial"`);

        // Analyze with no changes
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        
        expect(stdout).toContain('No');
        expect(stdout).toContain('changes');
        expect(stdout).toMatch(/uncommitted|analyze/i);
      } finally {
        await execAsync(`rm -rf ${testDir}`).catch(() => {});
      }
    });

    test('cadr analyze --staged with no staged files shows helpful message', async () => {
      const testDir = path.join(tmpdir(), `cadr-no-staged-${Date.now()}`);
      
      try {
        // Create git repo
        mkdirSync(testDir, { recursive: true });
        await execAsync(`cd ${testDir} && git init`);
        await execAsync(`cd ${testDir} && git config user.email "test@example.com"`);
        await execAsync(`cd ${testDir} && git config user.name "Test User"`);
        await execAsync(`cd ${testDir} && echo "test" > README.md && git add . && git commit -m "initial"`);

        // Create config
        const configPath = path.join(testDir, 'cadr.yaml');
        writeFileSync(configPath, `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`);

        // Analyze staged with nothing staged
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze --staged`);
        
        expect(stdout).toContain('No');
        expect(stdout).toContain('changes');
        expect(stdout).toMatch(/staged/i);
      } finally {
        await execAsync(`rm -rf ${testDir}`).catch(() => {});
      }
    });
  });

  describe('Different Diff Modes', () => {
    // Note: Staged/unstaged/branch comparison happy paths are tested in happy-flows.test.ts
    // This file focuses on git error scenarios
  });
});

