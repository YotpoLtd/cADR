/**
 * LLM Client Module
 *
 * OpenAI client wrapper for analyzing code changes.
 * Implements fail-open error handling per constitution requirements.
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisConfig } from './config';
import { loggerInstance as logger } from './logger';

/**
 * Analysis request data structure
 */
export interface AnalysisRequest {
  file_paths: string[];
  diff_content: string;
  repository_context: string;
  analysis_prompt: string;
}

/**
 * Rough token estimation (1 token ≈ 4 characters for English text)
 * This is a conservative estimate
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Analysis result from LLM
 */
export interface AnalysisResult {
  is_significant: boolean;
  reason: string;
  confidence?: number;
  timestamp: string;
}

/**
 * Analysis response including potential errors
 */
export interface AnalysisResponse {
  result: AnalysisResult | null;
  error?: string;
}

/**
 * Analyze staged changes using OpenAI LLM
 *
 * @param config - Analysis configuration with API settings
 * @param request - Analysis request with code changes
 * @returns Promise resolving to analysis response with result or error
 */
export async function analyzeChanges(
  config: AnalysisConfig,
  request: AnalysisRequest
): Promise<AnalysisResponse> {
  try {
    // Check if API key is available
    const apiKey = process.env[config.api_key_env];
    if (!apiKey) {
      logger.warn('API key not found in environment', {
        api_key_env: config.api_key_env,
      });
      return {
        result: null,
        error: `API key not found: ${config.api_key_env} environment variable is not set`
      };
    }

    // Estimate tokens for logging and validation
    const estimatedTokens = estimateTokens(request.analysis_prompt);
    
    logger.info('Sending analysis request to LLM', {
      provider: config.provider,
      model: config.analysis_model,
      file_count: request.file_paths.length,
      estimated_tokens: estimatedTokens,
    });
    
    // Warn if token estimate is high (most models have 8k-32k limits)
    if (estimatedTokens > 7000) {
      logger.warn('High token count detected', {
        estimated_tokens: estimatedTokens,
        provider: config.provider,
        model: config.analysis_model,
      });
    }

    let responseContent: string | undefined;
    if (config.provider === 'openai') {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey,
        timeout: config.timeout_seconds * 1000, // Convert to milliseconds
      });
      // Call OpenAI Chat Completion API
      const completion = await openai.chat.completions.create(
        {
          model: config.analysis_model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert software architect analyzing code changes.',
            },
            {
              role: 'user',
              content: request.analysis_prompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 500,
        },
        {
          timeout: config.timeout_seconds * 1000,
        }
      );
      responseContent = completion.choices[0]?.message?.content;
    } else if (config.provider === 'gemini') {
      // Initialize Google Generative AI (Gemini) client
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: config.analysis_model,
        systemInstruction: 'You are an expert software architect analyzing code changes.'
      });

      // Gemini SDK does not support per-call timeout directly; apply manual timeout
      const timeoutMs = config.timeout_seconds * 1000;
      const generatePromise = model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: request.analysis_prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) => {
        const t = setTimeout(() => {
          const err = new Error('Request timeout') as Error & { code: string };
          err.code = 'ETIMEDOUT';
          reject(err);
        }, timeoutMs);
        // No need to expose handle; resolved generatePromise will clear below
        (generatePromise as unknown as Promise<unknown>).finally(() => clearTimeout(t));
      });

      const result = await Promise.race([generatePromise, timeoutPromise]) as Awaited<typeof generatePromise>;
      const text = result?.response?.text?.();
      responseContent = typeof text === 'string' ? text : undefined;
    } else {
      // Unknown provider guard (should not happen due to schema)
      return { result: null, error: `Unsupported provider: ${String((config as any).provider)}` };
    }

    if (!responseContent) {
      logger.warn('No response content from LLM', { provider: config.provider });
      return {
        result: null,
        error: 'No response content from LLM'
      };
    }

    // Parse JSON response - handle markdown-wrapped JSON
    let parsedResponse: { is_significant: boolean; reason: string; confidence?: number };
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonContent = responseContent.trim();
      
      // Remove markdown code block if present: ```json ... ``` or ``` ... ```
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }
      
      // Try to find JSON object if there's surrounding text
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      parsedResponse = JSON.parse(jsonContent);
    } catch (parseError) {
      logger.warn('Failed to parse LLM response as JSON', {
        error: parseError,
        response: responseContent,
      });
      return {
        result: null,
        error: `Failed to parse LLM response as JSON. Response was:\n${responseContent.substring(0, 200)}...`
      };
    }

    // Validate response format
    if (
      typeof parsedResponse.is_significant !== 'boolean' ||
      typeof parsedResponse.reason !== 'string'
    ) {
      logger.warn('Invalid response format from LLM', {
        response: parsedResponse,
      });
      return {
        result: null,
        error: `Invalid response format from LLM. Expected {is_significant: boolean, reason: string}, got: ${JSON.stringify(parsedResponse).substring(0, 150)}...`
      };
    }
    
    // Reason is required when is_significant is true, but can be empty when false
    if (parsedResponse.is_significant && !parsedResponse.reason) {
      logger.warn('Missing reason for significant change', {
        response: parsedResponse,
      });
      return {
        result: null,
        error: 'LLM indicated significant change but provided no reason'
      };
    }

    // Build result with timestamp
    const result: AnalysisResult = {
      is_significant: parsedResponse.is_significant,
      reason: parsedResponse.reason,
      timestamp: new Date().toISOString(),
    };

    // Include confidence if provided
    if (
      typeof parsedResponse.confidence === 'number' &&
      parsedResponse.confidence >= 0 &&
      parsedResponse.confidence <= 1
    ) {
      result.confidence = parsedResponse.confidence;
    }

    logger.info('Analysis completed successfully', {
      is_significant: result.is_significant,
      has_confidence: result.confidence !== undefined,
    });

    return { result, error: undefined };
  } catch (error) {
    // Fail-open: log error and return descriptive error message
    const errorObj = error as { status?: number; code?: string; message?: string };
    let errorMessage: string;

    // Check for specific error types and provide helpful messages
    if (errorObj.status === 401) {
      errorMessage = 'Invalid API key - please check your API key configuration';
      logger.warn('LLM API authentication failed', { error: errorObj });
    } else if (errorObj.status === 400 && errorObj.message?.includes('maximum context length')) {
      // Extract token counts from error message if available
      const tokenMatch = errorObj.message.match(/(\d+)\s+tokens/g);
      errorMessage = 'Diff too large for model context window. Try:\n' +
        '  • Stage fewer files at once\n' +
        '  • Use gpt-4-turbo (128k context) in cadr.yaml:\n' +
        '    analysis_model: gpt-4-turbo-preview\n' +
        '  • Add ignore patterns to filter large files';
      logger.warn('LLM context length exceeded', { 
        error: errorObj,
        tokens: tokenMatch,
      });
    } else if (errorObj.status === 429) {
      errorMessage = 'Rate limit exceeded - please try again later or check your API quota';
      logger.warn('LLM API rate limit exceeded', { error: errorObj });
    } else if (errorObj.code === 'ETIMEDOUT' || errorObj.message?.includes('timeout')) {
      errorMessage = `Request timeout (${config.timeout_seconds}s) - the LLM took too long to respond`;
      logger.warn('LLM API request timeout', { error: errorObj });
    } else if (errorObj.code === 'ENOTFOUND' || errorObj.message?.includes('ENOTFOUND')) {
      errorMessage = 'Network error - unable to reach LLM API (check internet connection)';
      logger.warn('LLM API network error', { error: errorObj });
    } else {
      errorMessage = `API error: ${errorObj.message || 'Unknown error occurred'}`;
      logger.warn('LLM API request failed', { error: errorObj });
    }

    return { result: null, error: errorMessage };
  }
}
