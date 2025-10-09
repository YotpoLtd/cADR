import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, ProviderCallOptions } from './types';

export const geminiProvider: LLMProvider = {
  name: 'gemini',
  async analyze(prompt: string, options: ProviderCallOptions): Promise<string | undefined> {
    const genAI = new GoogleGenerativeAI(options.apiKey);
    const model = genAI.getGenerativeModel({
      model: options.model,
      systemInstruction: 'You are an expert software architect analyzing code changes.',
    });

    const generatePromise = model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        const err = new Error('Request timeout') as Error & { code: string };
        err.code = 'ETIMEDOUT';
        reject(err);
      }, options.timeoutMs);
      (generatePromise as unknown as Promise<unknown>).finally(() => clearTimeout(timer));
    });

    const result = (await Promise.race([generatePromise, timeoutPromise])) as Awaited<
      typeof generatePromise
    >;
    const text = result?.response?.text?.();
    return typeof text === 'string' ? text : undefined;
  },
};
