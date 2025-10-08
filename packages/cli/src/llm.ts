/**
 * LLM Client Module
 *
 * OpenAI client wrapper for analyzing code changes.
 * Implements fail-open error handling per constitution requirements.
 */

import OpenAI from 'openai';
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
 * Analysis result from LLM
 */
export interface AnalysisResult {
  is_significant: boolean;
  reason: string;
  confidence?: number;
  timestamp: string;
}

/**
 * Analyze staged changes using OpenAI LLM
 *
 * @param config - Analysis configuration with API settings
 * @param request - Analysis request with code changes
 * @returns Promise resolving to analysis result or null on error (fail-open)
 */
export async function analyzeChanges(
  config: AnalysisConfig,
  request: AnalysisRequest
): Promise<AnalysisResult | null> {
  try {
    // Check if API key is available
    const apiKey = process.env[config.api_key_env];
    if (!apiKey) {
      logger.warn('API key not found in environment', {
        api_key_env: config.api_key_env,
      });
      return null;
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
      timeout: config.timeout_seconds * 1000, // Convert to milliseconds
    });

    logger.info('Sending analysis request to OpenAI', {
      model: config.analysis_model,
      file_count: request.file_paths.length,
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

    // Extract response content
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      logger.warn('No response content from OpenAI');
      return null;
    }

    // Parse JSON response
    let parsedResponse: { is_significant: boolean; reason: string; confidence?: number };
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      logger.warn('Failed to parse OpenAI response as JSON', {
        error: parseError,
        response: responseContent,
      });
      return null;
    }

    // Validate response format
    if (
      typeof parsedResponse.is_significant !== 'boolean' ||
      typeof parsedResponse.reason !== 'string' ||
      !parsedResponse.reason
    ) {
      logger.warn('Invalid response format from OpenAI', {
        response: parsedResponse,
      });
      return null;
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

    return result;
  } catch (error) {
    // Fail-open: log error and return null
    const errorObj = error as { status?: number; code?: string; message?: string };

    // Check for specific error types
    if (errorObj.status === 429) {
      logger.warn('OpenAI API rate limit exceeded', { error: errorObj });
    } else if (errorObj.code === 'ETIMEDOUT' || errorObj.message?.includes('timeout')) {
      logger.warn('OpenAI API request timeout', { error: errorObj });
    } else {
      logger.warn('OpenAI API request failed', { error: errorObj });
    }

    return null;
  }
}
