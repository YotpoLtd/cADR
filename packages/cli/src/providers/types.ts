import { AnalysisConfig } from '../config';

export interface ProviderCallOptions {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export interface LLMProvider {
  readonly name: AnalysisConfig['provider'];
  analyze(prompt: string, options: ProviderCallOptions): Promise<string | undefined>;
}
