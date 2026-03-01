import { AnalysisResult } from 'cadr-cli/src/llm';

export interface ActionInputs {
  apiKey: string;
  provider: 'openai' | 'gemini';
  model?: string;
  configPath: string;
  adrDirectory: string;
  failOnError: boolean;
}

export interface PRContext {
  owner: string;
  repo: string;
  pullNumber: number;
  headSha: string;
  baseSha: string;
  headRef: string;
  baseRef: string;
  title: string;
  author: string;
}

export { AnalysisResult };

export interface SuggestedADR {
  number: number;
  title: string;
  filename: string;
  path: string;
  content: string;
  commitMessage: string;
}

export interface ReviewComment {
  id?: number;
  body: string;
  createdAt?: string;
  updatedAt?: string;
  isUpdate: boolean;
}

export interface ActionOutputs {
  adrSuggested: boolean;
  adrPath?: string;
  analysisReason?: string;
  isSignificant: boolean;
}
