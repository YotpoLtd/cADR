/**
 * Module-level integration tests for ADR generation workflow.
 *
 * Mocks: providers/registry and promptForGeneration only.
 * Everything else is real — including adr.ts which actually writes files to a temp repo.
 */

jest.mock('../../../packages/cli/src/providers/registry');
jest.mock('../../../packages/cli/src/llm/prompts', () => {
  const actual = jest.requireActual('../../../packages/cli/src/llm/prompts');
  return { ...actual, promptForGeneration: jest.fn() };
});

import { getProvider } from '../../../packages/cli/src/providers/registry';
import { promptForGeneration } from '../../../packages/cli/src/llm/prompts';
import { runAnalysis } from '../../../packages/cli/src/analysis/analysis.orchestrator';
import { createTestRepo, type TestRepo } from '../helpers/test-repo';
import {
  createFakeProvider,
  SIGNIFICANT_JSON,
  VALID_ADR_MARKDOWN,
} from '../helpers/fake-provider';
import { existsSync, readdirSync, mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';

jest.setTimeout(30000);

const mockedGetProvider = getProvider as jest.MockedFunction<typeof getProvider>;
const mockedPromptForGeneration = promptForGeneration as jest.Mock;

describe('ADR Generation — module-level integration', () => {
  let repo: TestRepo;
  let originalCwd: string;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    logSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();

    originalCwd = process.cwd();
    process.env.TEST_API_KEY = 'fake-key';

    repo = await createTestRepo({
      files: [
        {
          name: 'database.ts',
          content: `import { Pool } from 'pg';\nexport class DatabaseConnection {\n  private pool: Pool;\n  constructor() {\n    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });\n  }\n  async query(sql: string) { return this.pool.query(sql); }\n}\n`,
          stage: true,
        },
      ],
    });

    process.chdir(repo.dir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    delete process.env.TEST_API_KEY;

    logSpy.mockRestore();
    errorSpy.mockRestore();

    await repo.cleanup();
  });

  function allOutput(): string {
    const log = logSpy.mock.calls.map((c: unknown[]) => c.map(String).join(' ')).join('\n');
    const err = errorSpy.mock.calls.map((c: unknown[]) => c.map(String).join(' ')).join('\n');
    return log + '\n' + err;
  }

  test('Test 1: Full flow — significant change leads to ADR file being saved', async () => {
    const fakeProvider = createFakeProvider({
      analysisResponse: SIGNIFICANT_JSON,
      generationResponse: VALID_ADR_MARKDOWN,
    });
    mockedGetProvider.mockReturnValue(fakeProvider);
    mockedPromptForGeneration.mockResolvedValue(true);

    await runAnalysis({ mode: 'all' });

    const adrDir = path.join(repo.dir, 'docs', 'adr');
    expect(existsSync(adrDir)).toBe(true);

    const files = readdirSync(adrDir);
    const adrFiles = files.filter((f) => /^0001-.+\.md$/.test(f));
    expect(adrFiles).toHaveLength(1);

    const fileContent = require('fs').readFileSync(path.join(adrDir, adrFiles[0]), 'utf-8');
    expect(fileContent).toContain('PostgreSQL');

    const output = allOutput();
    expect(output.toLowerCase()).toMatch(/success|docs\/adr|adr\/0001/i);
  });

  test('Test 2: Sequential numbering — existing ADR 0001 means next ADR is 0002', async () => {
    const existingAdrDir = path.join(repo.dir, 'docs', 'adr');
    mkdirSync(existingAdrDir, { recursive: true });
    writeFileSync(
      path.join(existingAdrDir, '0001-existing-decision.md'),
      '# Existing Decision\n\n* Status: accepted\n'
    );

    const fakeProvider = createFakeProvider({
      analysisResponse: SIGNIFICANT_JSON,
      generationResponse: VALID_ADR_MARKDOWN,
    });
    mockedGetProvider.mockReturnValue(fakeProvider);
    mockedPromptForGeneration.mockResolvedValue(true);

    await runAnalysis({ mode: 'all' });

    const files = readdirSync(existingAdrDir);
    const nextAdrFiles = files.filter((f) => /^0002-.+\.md$/.test(f));
    expect(nextAdrFiles).toHaveLength(1);
  });

  test('Test 3: Generation failure — LLM error on second call resolves without throwing and logs error', async () => {
    const fakeProvider = createFakeProvider({
      analysisResponse: SIGNIFICANT_JSON,
      shouldThrow: new Error('LLM timeout'),
      throwOnCall: 2,
    });
    mockedGetProvider.mockReturnValue(fakeProvider);
    mockedPromptForGeneration.mockResolvedValue(true);

    await expect(runAnalysis({ mode: 'all' })).resolves.toBeUndefined();

    const output = allOutput();
    expect(output.toLowerCase()).toMatch(/fail|generation/i);

    const adrDir = path.join(repo.dir, 'docs', 'adr');
    if (existsSync(adrDir)) {
      const files = readdirSync(adrDir);
      expect(files).toHaveLength(0);
    } else {
      expect(existsSync(adrDir)).toBe(false);
    }
  });

  test('Test 4: User declines generation — logs skipping message and no ADR file created', async () => {
    const fakeProvider = createFakeProvider({
      analysisResponse: SIGNIFICANT_JSON,
    });
    mockedGetProvider.mockReturnValue(fakeProvider);
    mockedPromptForGeneration.mockResolvedValue(false);

    await runAnalysis({ mode: 'all' });

    const output = allOutput();
    expect(output).toContain('Skipping');

    const adrDir = path.join(repo.dir, 'docs', 'adr');
    if (existsSync(adrDir)) {
      const files = readdirSync(adrDir);
      expect(files).toHaveLength(0);
    } else {
      expect(existsSync(adrDir)).toBe(false);
    }
  });
});
