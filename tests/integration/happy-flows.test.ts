import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

describe('cADR Happy Flows Integration', () => {
  const testDir = '/tmp/cadr-happy-flows';
  const cliPath = path.join(__dirname, '../../packages/cli/bin/cadr.js');
  
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

  describe('Core Happy Flows', () => {
    test('Complete End-to-End Workflow', async () => {
      // Test the complete workflow: stage files and analyze
      await execAsync(`cd ${testDir} && echo 'export function authenticateUser(token: string) { return jwt.verify(token); }' > auth.ts`);
      await execAsync(`cd ${testDir} && echo 'export class UserService { async getUser(id: string) { return { id, name: "Test" }; } }' > user.ts`);
      await execAsync(`cd ${testDir} && git add auth.ts user.ts`);
      
      // Analyze
      const { stdout: analyzeOutput } = await execAsync(`cd ${testDir} && node ${cliPath} --analyze`);
      expect(analyzeOutput).toContain('Hello, cADR!');
      expect(analyzeOutput).toContain('auth.ts');
      expect(analyzeOutput).toContain('user.ts');
    });
  });
});