import { getProvider } from '../providers';
import { AnalysisConfig } from '../config';
import { loggerInstance as logger } from '../logger';

export interface AnalysisRequest {
  file_paths: string[];
  diff_content: string;
  repository_context: string;
  analysis_prompt: string;
}

export interface AnalysisResult {
  is_significant: boolean;
  reason: string;
  confidence?: number;
  timestamp: string;
}

export interface AnalysisResponse {
  result: AnalysisResult | null;
  error?: string;
}

export interface GenerationRequest {
  file_paths: string[];
  diff_content: string;
  reason: string;
  generation_prompt: string;
}

export interface GenerationResult {
  content: string;
  title: string;
  timestamp: string;
}

export interface GenerationResponse {
  result: GenerationResult | null;
  error?: string;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function analyzeChanges(
  config: AnalysisConfig,
  request: AnalysisRequest
): Promise<AnalysisResponse> {
  try {
    const apiKey = process.env[config.api_key_env];
    if (!apiKey) {
      logger.warn('API key not found in environment', {
        api_key_env: config.api_key_env,
      });
      return {
        result: null,
        error: `API key not found: ${config.api_key_env} environment variable is not set`,
      };
    }

    const estimatedTokens = estimateTokens(request.analysis_prompt);

    logger.info('Sending analysis request to LLM', {
      provider: config.provider,
      model: config.analysis_model,
      file_count: request.file_paths.length,
      estimated_tokens: estimatedTokens,
    });

    if (estimatedTokens > 7000) {
      logger.warn('High token count detected', {
        estimated_tokens: estimatedTokens,
        provider: config.provider,
        model: config.analysis_model,
      });
    }

    const provider = getProvider(config.provider);
    const responseContent = await provider.analyze(request.analysis_prompt, {
      apiKey,
      model: config.analysis_model,
      timeoutMs: config.timeout_seconds * 1000,
    });

    if (!responseContent) {
      logger.warn('No response content from LLM', { provider: config.provider });
      return {
        result: null,
        error: 'No response content from LLM',
      };
    }

    let parsedResponse: { is_significant: boolean; reason: string; confidence?: number };
    try {
      let jsonContent = responseContent.trim();

      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }

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
        error: `Failed to parse LLM response as JSON. Response was:\n${responseContent.substring(0, 200)}...`,
      };
    }

    if (
      typeof parsedResponse.is_significant !== 'boolean' ||
      typeof parsedResponse.reason !== 'string'
    ) {
      logger.warn('Invalid response format from LLM', {
        response: parsedResponse,
      });
      return {
        result: null,
        error: `Invalid response format from LLM. Expected {is_significant: boolean, reason: string}, got: ${JSON.stringify(parsedResponse).substring(0, 150)}...`,
      };
    }

    if (parsedResponse.is_significant && !parsedResponse.reason) {
      logger.warn('Missing reason for significant change', {
        response: parsedResponse,
      });
      return {
        result: null,
        error: 'LLM indicated significant change but provided no reason',
      };
    }

    const result: AnalysisResult = {
      is_significant: parsedResponse.is_significant,
      reason: parsedResponse.reason,
      timestamp: new Date().toISOString(),
    };

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
    const errorObj = error as { status?: number; code?: string; message?: string };
    let errorMessage: string;

    if (errorObj.status === 401) {
      errorMessage = 'Invalid API key - please check your API key configuration';
      logger.warn('LLM API authentication failed', { error: errorObj });
    } else if (errorObj.status === 400 && errorObj.message?.includes('maximum context length')) {
      const tokenMatch = errorObj.message.match(/(\d+)\s+tokens/g);
      errorMessage =
        'Diff too large for model context window. Try:\n' +
        '  • Stage fewer files at once\n' +
        '  • Use a model with larger context window in cadr.yaml\n' +
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

export async function generateADRContent(
  config: AnalysisConfig,
  request: GenerationRequest
): Promise<GenerationResponse> {
  try {
    const apiKey = process.env[config.api_key_env];
    if (!apiKey) {
      logger.warn('API key not found in environment for generation', {
        api_key_env: config.api_key_env,
      });
      return {
        result: null,
        error: `API key not found: ${config.api_key_env} environment variable is not set`,
      };
    }

    logger.info('Sending generation request to LLM', {
      provider: config.provider,
      model: config.analysis_model,
      file_count: request.file_paths.length,
    });

    const provider = getProvider(config.provider);
    const responseContent = await provider.analyze(request.generation_prompt, {
      apiKey,
      model: config.analysis_model,
      timeoutMs: config.timeout_seconds * 1000,
    });

    if (!responseContent) {
      logger.warn('No response content from LLM for generation', {
        provider: config.provider,
      });
      return {
        result: null,
        error: 'No response content from LLM',
      };
    }

    let cleanedContent = responseContent.trim();

    const codeBlockMatch = cleanedContent.match(/```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      cleanedContent = codeBlockMatch[1].trim();
    }

    const titleMatch = cleanedContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Decision';

    const result: GenerationResult = {
      content: cleanedContent,
      title,
      timestamp: new Date().toISOString(),
    };

    logger.info('ADR generation completed successfully', {
      title,
      content_length: cleanedContent.length,
    });

    return { result, error: undefined };
  } catch (error) {
    const errorObj = error as { status?: number; code?: string; message?: string };
    let errorMessage: string;

    if (errorObj.status === 401) {
      errorMessage = 'Invalid API key - please check your API key configuration';
      logger.warn('LLM API authentication failed during generation', { error: errorObj });
    } else if (errorObj.status === 400 && errorObj.message?.includes('maximum context length')) {
      errorMessage = 'Diff too large for model context window';
      logger.warn('LLM context length exceeded during generation', { error: errorObj });
    } else if (errorObj.status === 429) {
      errorMessage = 'Rate limit exceeded - please try again later';
      logger.warn('LLM API rate limit exceeded during generation', { error: errorObj });
    } else if (errorObj.code === 'ETIMEDOUT' || errorObj.message?.includes('timeout')) {
      errorMessage = `Request timeout (${config.timeout_seconds}s)`;
      logger.warn('LLM API request timeout during generation', { error: errorObj });
    } else {
      errorMessage = `API error: ${errorObj.message || 'Unknown error occurred'}`;
      logger.warn('LLM API request failed during generation', { error: errorObj });
    }

    return { result: null, error: errorMessage };
  }
}
