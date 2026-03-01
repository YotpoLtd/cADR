import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';

const execAsync = promisify(exec);

export interface TestRepoConfig {
  provider?: string;
  analysis_model?: string;
  api_key_env?: string;
  timeout_seconds?: number;
  ignore_patterns?: string[];
}

export interface FileSpec {
  name: string;
  content: string;
  stage?: boolean;  // default true
}

export interface TestRepo {
  dir: string;
  addFiles(files: FileSpec[]): Promise<void>;
  commit(message: string): Promise<void>;
  cleanup(): Promise<void>;
}

const DEFAULT_CONFIG: TestRepoConfig = {
  provider: 'openai',
  analysis_model: 'gpt-4',
  api_key_env: 'TEST_API_KEY',
  timeout_seconds: 30,
};

export async function createTestRepo(options?: {
  config?: TestRepoConfig | false;
  files?: FileSpec[];
}): Promise<TestRepo> {
  const dir = mkdtempSync(path.join(tmpdir(), 'cadr-integ-'));

  await execAsync(`git init`, { cwd: dir });
  await execAsync(`git config user.email "test@test.com"`, { cwd: dir });
  await execAsync(`git config user.name "Test"`, { cwd: dir });
  writeFileSync(path.join(dir, 'README.md'), '# Test');
  await execAsync(`git add README.md && git commit -m "initial"`, { cwd: dir });

  if (options?.config !== false) {
    const cfg = { ...DEFAULT_CONFIG, ...options?.config };
    writeFileSync(path.join(dir, 'cadr.yaml'), yaml.dump(cfg));
  }

  const repo: TestRepo = {
    dir,
    async addFiles(files: FileSpec[]) {
      for (const f of files) {
        const filePath = path.join(dir, f.name);
        const fileDir = path.dirname(filePath);
        if (fileDir !== dir) {
          mkdirSync(fileDir, { recursive: true });
        }
        writeFileSync(filePath, f.content);
        if (f.stage !== false) {
          await execAsync(`git add "${f.name}"`, { cwd: dir });
        }
      }
    },
    async commit(message: string) {
      await execAsync(`git commit -m "${message}"`, { cwd: dir });
    },
    async cleanup() {
      await execAsync(`rm -rf "${dir}"`).catch(() => {});
    },
  };

  if (options?.files) {
    await repo.addFiles(options.files);
  }

  return repo;
}
