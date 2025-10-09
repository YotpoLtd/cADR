import OpenAI from 'openai';
import { LLMProvider, ProviderCallOptions } from './types';

export const openAIProvider: LLMProvider = {
  name: 'openai',
  async analyze(prompt: string, options: ProviderCallOptions): Promise<string | undefined> {
    const client = new OpenAI({ apiKey: options.apiKey, timeout: options.timeoutMs });
    const completion = await client.chat.completions.create(
      {
        model: options.model,
        messages: [
          { role: 'system', content: 'You are an expert software architect analyzing code changes.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      { timeout: options.timeoutMs }
    );
    return completion.choices[0]?.message?.content ?? undefined;
  },
};
