jest.mock('../../../packages/cli/src/providers/registry');
jest.mock('../../../packages/cli/src/llm/prompts', () => {
  const actual = jest.requireActual('../../../packages/cli/src/llm/prompts');
  return { ...actual, promptForGeneration: jest.fn() };
});

import { getProvider } from '../../../packages/cli/src/providers/registry';
import { promptForGeneration } from '../../../packages/cli/src/llm/prompts';
import { runAnalysis } from '../../../packages/cli/src/analysis/analysis.orchestrator';
import { createTestRepo } from '../helpers/test-repo';
import { createFakeProvider, NOT_SIGNIFICANT_JSON } from '../helpers/fake-provider';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';

jest.setTimeout(30000);

const mockedGetProvider = getProvider as jest.MockedFunction<typeof getProvider>;
const mockedPromptForGeneration = promptForGeneration as jest.MockedFunction<typeof promptForGeneration>;

let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;
let originalCwd: string;

beforeEach(() => {
  jest.clearAllMocks();
  logSpy = jest.spyOn(console, 'log').mockImplementation();
  errorSpy = jest.spyOn(console, 'error').mockImplementation();
  originalCwd = process.cwd();
  process.env.TEST_API_KEY = 'fake-key';
});

afterEach(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
  process.chdir(originalCwd);
  delete process.env.TEST_API_KEY;
});

function allOutput(): string {
  const log = logSpy.mock.calls.map((c: unknown[]) => c.map(String).join(' ')).join('\n');
  const err = errorSpy.mock.calls.map((c: unknown[]) => c.map(String).join(' ')).join('\n');
  return log + '\n' + err;
}

describe('error-paths module integration', () => {
  describe('Test 1: Not a git repo', () => {
    let noGitDir: string;

    afterEach(async () => {
      if (noGitDir) {
        try {
          rmSync(noGitDir, { recursive: true, force: true });
        } catch {
          // ignore cleanup errors
        }
      }
    });

    it('resolves without throwing and reports a git/repository error', async () => {
      noGitDir = mkdtempSync(path.join(tmpdir(), 'cadr-nogit-'));
      writeFileSync(
        path.join(noGitDir, 'cadr.yaml'),
        'provider: openai\nanalysis_model: gpt-4\napi_key_env: TEST_API_KEY\ntimeout_seconds: 30\n'
      );
      process.chdir(noGitDir);

      await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

      const output = allOutput();
      expect(output).toMatch(/Git|git|repository/i);
    });
  });

  describe('Test 2: Invalid git reference in branch-diff mode', () => {
    it('resolves without throwing and reports a reference/git error', async () => {
      const repo = await createTestRepo();
      process.chdir(repo.dir);

      try {
        await expect(
          runAnalysis({ mode: 'branch-diff', base: 'nonexistent-ref-xyz-abc' })
        ).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/reference|invalid|git/i);
      } finally {
        await repo.cleanup();
      }
    });
  });

  describe('Test 3: Missing config file', () => {
    it('resolves without throwing and reports a configuration/init error', async () => {
      const repo = await createTestRepo({ config: false });
      await repo.addFiles([{ name: 'feature.ts', content: 'export const x = 1;' }]);
      process.chdir(repo.dir);

      try {
        await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/Configuration|config|init/i);
      } finally {
        await repo.cleanup();
      }
    });
  });

  describe('Test 4: Invalid config (bad provider)', () => {
    it('resolves without throwing and reports a configuration/error message', async () => {
      const repo = await createTestRepo({ config: false });
      writeFileSync(
        path.join(repo.dir, 'cadr.yaml'),
        'provider: invalid-provider\nanalysis_model: gpt-4\napi_key_env: TEST_API_KEY\ntimeout_seconds: 30\n'
      );
      await repo.addFiles([{ name: 'feature.ts', content: 'export const x = 1;' }]);
      process.chdir(repo.dir);

      try {
        await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/[Cc]onfiguration|[Ee]rror/);
      } finally {
        await repo.cleanup();
      }
    });
  });

  describe('Test 5: Missing API key env var', () => {
    it('resolves without throwing and reports a missing API key error', async () => {
      const repo = await createTestRepo({
        config: {
          provider: 'openai',
          analysis_model: 'gpt-4',
          api_key_env: 'NONEXISTENT_VAR_XYZ',
          timeout_seconds: 30,
        },
      });
      await repo.addFiles([{ name: 'feature.ts', content: 'export const x = 1;' }]);
      process.chdir(repo.dir);

      // Ensure the env var does NOT exist
      delete process.env.NONEXISTENT_VAR_XYZ;

      mockedGetProvider.mockReturnValue(createFakeProvider());
      mockedPromptForGeneration.mockResolvedValue(false);

      try {
        await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/API key|NONEXISTENT_VAR_XYZ|environment/i);
      } finally {
        await repo.cleanup();
      }
    });
  });

  describe('Test 6: LLM returns unparseable response', () => {
    it('resolves without throwing and reports a parse/failed error', async () => {
      const fakeProvider = createFakeProvider({
        analysisResponse: 'I cannot analyze this. Please clarify.',
      });
      mockedGetProvider.mockReturnValue(fakeProvider);
      mockedPromptForGeneration.mockResolvedValue(false);

      const repo = await createTestRepo();
      await repo.addFiles([{ name: 'feature.ts', content: 'export const x = 1;' }]);
      process.chdir(repo.dir);

      try {
        await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/parse|failed|Analysis failed/i);
      } finally {
        await repo.cleanup();
      }
    });
  });

  describe('Test 7: LLM throws 401 error', () => {
    it('resolves without throwing and reports an API key/authentication error', async () => {
      const err401 = Object.assign(new Error('Unauthorized'), { status: 401 });
      const fakeProvider = createFakeProvider({ shouldThrow: err401 });
      mockedGetProvider.mockReturnValue(fakeProvider);
      mockedPromptForGeneration.mockResolvedValue(false);

      const repo = await createTestRepo();
      await repo.addFiles([{ name: 'feature.ts', content: 'export const x = 1;' }]);
      process.chdir(repo.dir);

      try {
        await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/API key|Invalid|authentication|key/i);
      } finally {
        await repo.cleanup();
      }
    });
  });

  describe('Test 8: LLM throws timeout error', () => {
    it('resolves without throwing and reports a timeout error', async () => {
      const errTimeout = Object.assign(new Error('Request timeout'), { code: 'ETIMEDOUT' });
      const fakeProvider = createFakeProvider({ shouldThrow: errTimeout });
      mockedGetProvider.mockReturnValue(fakeProvider);
      mockedPromptForGeneration.mockResolvedValue(false);

      const repo = await createTestRepo();
      await repo.addFiles([{ name: 'feature.ts', content: 'export const x = 1;' }]);
      process.chdir(repo.dir);

      try {
        await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/timeout/i);
      } finally {
        await repo.cleanup();
      }
    });
  });

  describe('Test 9: LLM throws network error', () => {
    it('resolves without throwing and reports a network/connection error', async () => {
      const errNetwork = Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' });
      const fakeProvider = createFakeProvider({ shouldThrow: errNetwork });
      mockedGetProvider.mockReturnValue(fakeProvider);
      mockedPromptForGeneration.mockResolvedValue(false);

      const repo = await createTestRepo();
      await repo.addFiles([{ name: 'feature.ts', content: 'export const x = 1;' }]);
      process.chdir(repo.dir);

      try {
        await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

        const output = allOutput();
        expect(output).toMatch(/network|Network|connection/i);
      } finally {
        await repo.cleanup();
      }
    });
  });
});
