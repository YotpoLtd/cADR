import { AnalysisConfig } from '../config';

export const DEFAULT_MAX_OUTPUT_TOKENS = 4096;

export interface ProviderCallOptions {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export interface LLMProvider {
  readonly name: AnalysisConfig['provider'];
  analyze(prompt: string, options: ProviderCallOptions): Promise<string | undefined>;
}
