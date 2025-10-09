import { LLMProvider } from './types';
import { openAIProvider } from './openai';
import { geminiProvider } from './gemini';

export function getProvider(name: 'openai' | 'gemini'): LLMProvider {
  switch (name) {
    case 'openai':
      return openAIProvider;
    case 'gemini':
      return geminiProvider;
    default:
      throw new Error(`Unsupported provider: ${name as string}`);
  }
}

export type { LLMProvider } from './types';
