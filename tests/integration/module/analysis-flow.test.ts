import { exec } from 'child_process';
import { promisify } from 'util';

jest.mock('../../../packages/cli/src/providers/registry');
jest.mock('../../../packages/cli/src/llm/prompts', () => {
  const actual = jest.requireActual('../../../packages/cli/src/llm/prompts');
  return { ...actual, promptForGeneration: jest.fn() };
});

import { getProvider } from '../../../packages/cli/src/providers/registry';
import { promptForGeneration } from '../../../packages/cli/src/llm/prompts';
import { runAnalysis } from '../../../packages/cli/src/analysis/analysis.orchestrator';
import { createTestRepo } from '../helpers/test-repo';
import { createFakeProvider, SIGNIFICANT_JSON, NOT_SIGNIFICANT_JSON } from '../helpers/fake-provider';
import type { TestRepo } from '../helpers/test-repo';

const execAsync = promisify(exec);

jest.setTimeout(30000);

function allLogOutput(spy: jest.SpyInstance): string {
  return spy.mock.calls.map((c: unknown[]) => c.map(String).join(' ')).join('\n');
}

describe('analysis-flow integration', () => {
  let repo: TestRepo;
  let originalCwd: string;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    originalCwd = process.cwd();
    process.env.TEST_API_KEY = 'fake-key';
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(async () => {
    consoleSpy.mockRestore();
    process.chdir(originalCwd);
    delete process.env.TEST_API_KEY;
    if (repo) {
      await repo.cleanup();
    }
    jest.clearAllMocks();
  });

  test('Test 1: Default mode — not-significant result shows files and NOT ARCHITECTURALLY SIGNIFICANT', async () => {
    const fakeProvider = createFakeProvider({ analysisResponse: NOT_SIGNIFICANT_JSON });
    (getProvider as jest.Mock).mockReturnValue(fakeProvider);

    repo = await createTestRepo({
      files: [
        { name: 'auth.ts', content: 'export function auth() {}', stage: true },
        { name: 'user.ts', content: 'export function user() {}', stage: true },
      ],
    });

    process.chdir(repo.dir);
    await runAnalysis({ mode: 'all' });

    const output = allLogOutput(consoleSpy);
    expect(output).toContain('auth.ts');
    expect(output).toContain('user.ts');
    expect(output).toContain('NOT ARCHITECTURALLY SIGNIFICANT');
    expect(fakeProvider.analyze).toHaveBeenCalledTimes(1);
  });

  test('Test 2: Default mode — significant result, user declines ADR shows Skipping', async () => {
    const fakeProvider = createFakeProvider({ analysisResponse: SIGNIFICANT_JSON });
    (getProvider as jest.Mock).mockReturnValue(fakeProvider);
    (promptForGeneration as jest.Mock).mockResolvedValue(false);

    repo = await createTestRepo({
      files: [
        { name: 'db.ts', content: 'import { Pool } from "pg"; export const pool = new Pool();', stage: true },
      ],
    });

    process.chdir(repo.dir);
    await runAnalysis({ mode: 'all' });

    const output = allLogOutput(consoleSpy);
    expect(output).toContain('ARCHITECTURALLY SIGNIFICANT');

    // showSkippingGeneration uses console.log with 'Skipping ADR generation'
    expect(output).toContain('Skipping');
  });

  test('Test 3: Staged mode — only staged files detected, unstaged excluded', async () => {
    const fakeProvider = createFakeProvider({ analysisResponse: NOT_SIGNIFICANT_JSON });
    (getProvider as jest.Mock).mockReturnValue(fakeProvider);

    repo = await createTestRepo();

    await repo.addFiles([
      { name: 'staged.ts', content: 'export const STAGED = true;', stage: true },
      { name: 'unstaged.ts', content: 'export const UNSTAGED = true;', stage: false },
    ]);

    process.chdir(repo.dir);
    await runAnalysis({ mode: 'staged' });

    const output = allLogOutput(consoleSpy);
    expect(output).toContain('staged.ts');
    expect(output).not.toContain('unstaged.ts');
  });

  test('Test 4: Branch-diff mode — files between commits appear in output', async () => {
    const fakeProvider = createFakeProvider({ analysisResponse: NOT_SIGNIFICANT_JSON });
    (getProvider as jest.Mock).mockReturnValue(fakeProvider);

    repo = await createTestRepo();

    // Commit config so it is part of history, then record base SHA
    await execAsync('git add cadr.yaml && git commit -m "add config"', { cwd: repo.dir });
    const { stdout: baseShaRaw } = await execAsync('git rev-parse HEAD', { cwd: repo.dir });
    const baseSha = baseShaRaw.trim();

    // Add new files and commit
    await repo.addFiles([
      { name: 'feature-a.ts', content: 'export const A = 1;', stage: true },
      { name: 'feature-b.ts', content: 'export const B = 2;', stage: true },
    ]);
    await repo.commit('add features');

    process.chdir(repo.dir);
    await runAnalysis({ mode: 'branch-diff', base: baseSha, head: 'HEAD' });

    const output = allLogOutput(consoleSpy);
    expect(output).toContain('feature-a.ts');
    expect(output).toContain('feature-b.ts');
    expect(output).toContain('between');
  });

  test('Test 5: No changes — helpful message shown, LLM not called', async () => {
    const fakeProvider = createFakeProvider({ analysisResponse: NOT_SIGNIFICANT_JSON });
    (getProvider as jest.Mock).mockReturnValue(fakeProvider);

    // Create repo where all files are committed — no uncommitted changes
    repo = await createTestRepo();
    await execAsync('git add cadr.yaml && git commit -m "commit config"', { cwd: repo.dir });

    process.chdir(repo.dir);
    await runAnalysis({ mode: 'all' });

    const output = allLogOutput(consoleSpy);
    expect(output.toLowerCase()).toMatch(/no.*changes|changes.*no/);
    expect(fakeProvider.analyze).not.toHaveBeenCalled();
  });

  test('Test 6: Modified file — diff content passed to provider is non-empty and contains diff markers', async () => {
    let capturedPrompt = '';
    const fakeProvider = createFakeProvider({ analysisResponse: NOT_SIGNIFICANT_JSON });
    fakeProvider.analyze.mockImplementation(async (prompt: string) => {
      capturedPrompt = prompt;
      return NOT_SIGNIFICANT_JSON;
    });
    (getProvider as jest.Mock).mockReturnValue(fakeProvider);

    repo = await createTestRepo();

    // Commit the initial version of the file
    await repo.addFiles([
      { name: 'modify-me.ts', content: 'export const VERSION = 1;\n', stage: true },
    ]);
    await repo.commit('add file to modify');

    // Now modify it and stage the modification
    await repo.addFiles([
      { name: 'modify-me.ts', content: 'export const VERSION = 1;\nexport const MODIFIED = true;\n', stage: true },
    ]);

    process.chdir(repo.dir);
    await runAnalysis({ mode: 'all' });

    expect(capturedPrompt).toBeTruthy();
    expect(capturedPrompt.length).toBeGreaterThan(0);
    // The diff should contain + or - lines indicating actual changes
    expect(capturedPrompt).toMatch(/[+-]/);
  });

  test('Test 7: Confidence value displayed as percentage in output', async () => {
    // SIGNIFICANT_JSON has confidence: 0.92, so output should contain '92%'
    const fakeProvider = createFakeProvider({ analysisResponse: SIGNIFICANT_JSON });
    (getProvider as jest.Mock).mockReturnValue(fakeProvider);
    (promptForGeneration as jest.Mock).mockResolvedValue(false);

    repo = await createTestRepo({
      files: [
        { name: 'infra.ts', content: 'import Redis from "ioredis"; export const cache = new Redis();', stage: true },
      ],
    });

    process.chdir(repo.dir);
    await runAnalysis({ mode: 'all' });

    const output = allLogOutput(consoleSpy);
    expect(output).toContain('92%');
  });
});
