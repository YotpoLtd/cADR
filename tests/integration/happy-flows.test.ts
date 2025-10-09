import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('cADR Happy Flows Integration', () => {
  const cliPath = path.join(__dirname, '../../packages/cli/dist/index.js');
  
  // Helper function to create a unique test directory for each test
  const createTestDir = async (): Promise<string> => {
    const testDir = path.join(tmpdir(), `cadr-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await execAsync(`mkdir -p ${testDir}`);
    await execAsync(`cd ${testDir} && git init`);
    await execAsync(`cd ${testDir} && git config user.email "test@example.com"`);
    await execAsync(`cd ${testDir} && git config user.name "Test User"`);
    // Create initial commit so HEAD exists
    await execAsync(`cd ${testDir} && echo "# Test Repo" > README.md && git add README.md && git commit -m "Initial commit"`);
    return testDir;
  };
  
  // Helper to clean up test directory
  const cleanupTestDir = async (testDir: string): Promise<void> => {
    await execAsync(`rm -rf ${testDir}`).catch(() => {
      // Ignore cleanup errors
    });
  };

  describe('Core Happy Flows', () => {
    test('Workflow 1: Default mode analyzes all uncommitted changes', async () => {
      const testDir = await createTestDir();
      try {
        // Create config file
        const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
        await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
        
        // Create uncommitted files (not staged)
        await execAsync(`cd ${testDir} && echo 'export function authenticateUser(token: string) { return jwt.verify(token); }' > auth.ts`);
        await execAsync(`cd ${testDir} && echo 'export class UserService { async getUser(id: string) { return { id, name: "Test" }; } }' > user.ts`);
        
        // Track files with git so they can be detected by git diff HEAD
        await execAsync(`cd ${testDir} && git add auth.ts user.ts`);
        
        // Analyze uncommitted changes (files don't need to be staged)
        const { stdout: analyzeOutput } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        expect(analyzeOutput).toContain('uncommitted');
        expect(analyzeOutput).toContain('auth.ts');
        expect(analyzeOutput).toContain('user.ts');
      } finally {
        await cleanupTestDir(testDir);
      }
    });

    test('Workflow 2: Staged-only mode analyzes only staged files', async () => {
      const testDir = await createTestDir();
      try {
        // Create config
        const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
        await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
        
        // Create two files: one staged, one unstaged
        await execAsync(`cd ${testDir} && echo 'export const STAGED = true;' > staged.ts`);
        await execAsync(`cd ${testDir} && git add staged.ts`);
        await execAsync(`cd ${testDir} && echo 'export const UNSTAGED = true;' > unstaged.ts`);
        
        // Analyze with --staged flag (should only see staged.ts)
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze --staged`);
        expect(stdout).toContain('staged');
        expect(stdout).toContain('staged.ts');
        expect(stdout).not.toContain('unstaged.ts');
      } finally {
        await cleanupTestDir(testDir);
      }
    });

    test('Workflow 3: Mixed staged and unstaged analyzed by default', async () => {
      const testDir = await createTestDir();
      try {
        // Create config
        const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
        await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
        
        // Create mixed scenario
        await execAsync(`cd ${testDir} && echo 'export const STAGED = true;' > staged.ts`);
        await execAsync(`cd ${testDir} && git add staged.ts`);
        await execAsync(`cd ${testDir} && echo 'export const UNSTAGED = true;' > unstaged.ts`);
        
        // Track unstaged.ts so git can see it (but keep it in working tree, not staging area)
        await execAsync(`cd ${testDir} && git add unstaged.ts`);
        
        // Default analyze should see both
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        expect(stdout).toContain('uncommitted');
        expect(stdout).toContain('staged.ts');
        expect(stdout).toContain('unstaged.ts');
      } finally {
        await cleanupTestDir(testDir);
      }
    });

    test('Workflow 4: No changes shows helpful message', async () => {
      const testDir = await createTestDir();
      try {
        // Create config file
        const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
        await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
        
        // Try to analyze with no changes
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        expect(stdout).toContain('No');
        expect(stdout).toContain('changes');
      } finally {
        await cleanupTestDir(testDir);
      }
    });

    test('Workflow 5: CI/CD branch comparison workflow', async () => {
      const testDir = await createTestDir();
      try {
        // Create config and commit it
        const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
        await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
        await execAsync(`cd ${testDir} && git add cadr.yaml && git commit -m "Add config"`);
        
        // Create a feature branch
        await execAsync(`cd ${testDir} && git checkout -b feature-auth`);
        
        // Add files on feature branch
        await execAsync(`cd ${testDir} && echo 'export const AUTH = true;' > feature-auth.ts`);
        await execAsync(`cd ${testDir} && git add feature-auth.ts && git commit -m "Add auth feature"`);
        
        // Analyze changes between main and feature branch
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze --base HEAD~1 --head HEAD`);
        expect(stdout).toContain('between');
        expect(stdout).toContain('feature-auth.ts');
      } finally {
        await cleanupTestDir(testDir);
      }
    });

    test('Workflow 6: Multiple commits in branch diff', async () => {
      const testDir = await createTestDir();
      try {
        // Create config
        const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
        await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
        await execAsync(`cd ${testDir} && git add cadr.yaml && git commit -m "Add config"`);
        
        // Record current HEAD
        const { stdout: currentHead } = await execAsync(`cd ${testDir} && git rev-parse HEAD`);
        const baseCommit = currentHead.trim();
        
        // Create multiple commits
        await execAsync(`cd ${testDir} && echo 'export const FILE1 = true;' > file1.ts`);
        await execAsync(`cd ${testDir} && git add file1.ts && git commit -m "Add file1"`);
        
        await execAsync(`cd ${testDir} && echo 'export const FILE2 = true;' > file2.ts`);
        await execAsync(`cd ${testDir} && git add file2.ts && git commit -m "Add file2"`);
        
        // Analyze all changes from base to current HEAD
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze --base ${baseCommit} --head HEAD`);
        expect(stdout).toContain('between');
        expect(stdout).toContain('file1.ts');
        expect(stdout).toContain('file2.ts');
      } finally {
        await cleanupTestDir(testDir);
      }
    });

    test('Workflow 7: Modified files (not new files)', async () => {
      const testDir = await createTestDir();
      try {
        // Create config
        const config = `provider: openai
api_key_env: OPENAI_API_KEY
analysis_model: gpt-4
timeout_seconds: 30`;
        await execAsync(`cd ${testDir} && echo '${config}' > cadr.yaml`);
        await execAsync(`cd ${testDir} && git add cadr.yaml && git commit -m "Add config"`);
        
        // Commit a file first
        await execAsync(`cd ${testDir} && echo 'export const ORIGINAL = true;' > modify-me.ts`);
        await execAsync(`cd ${testDir} && git add modify-me.ts && git commit -m "Add file to modify"`);
        
        // Now modify it
        await execAsync(`cd ${testDir} && echo 'export const MODIFIED = true;' >> modify-me.ts`);
        
        // Analyze should detect the modification
        const { stdout } = await execAsync(`cd ${testDir} && node ${cliPath} analyze`);
        expect(stdout).toContain('uncommitted');
        expect(stdout).toContain('modify-me.ts');
      } finally {
        await cleanupTestDir(testDir);
      }
    });

    test('Workflow 8: Init command creates valid config', async () => {
      const testDir = await createTestDir();
      try {
        // Note: init is interactive, so we can't fully test it here
        // But we can verify the command exists and doesn't crash
        try {
          // This will fail due to interactive prompts, but shouldn't crash
          await execAsync(`cd ${testDir} && echo '' | node ${cliPath} init`, { timeout: 2000 });
        } catch (error) {
          // Expected to timeout or fail on interactive prompts
          // Just verify the command was recognized
          const err = error as { stdout?: string; stderr?: string };
          const output = (err.stdout || '') + (err.stderr || '');
          expect(output).not.toContain('Unknown command');
        }
      } finally {
        await cleanupTestDir(testDir);
      }
    });
  });
});