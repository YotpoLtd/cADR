/**
 * LLM Client Contract
 * 
 * Defines the interface for LLM analysis operations.
 * Implemented by OpenAI client wrapper in @cadr/core/src/llm.ts
 */

export interface LLMClient {
  /**
   * Analyze staged changes for architectural significance
   * @param request - Analysis request with file paths and diff content
   * @returns Promise resolving to analysis result or null on error
   */
  analyze(request: AnalysisRequest): Promise<AnalysisResult | null>;
}

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

/**
 * OpenAI-specific configuration
 */
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  timeout: number;
}

/**
 * Error types for LLM operations
 */
export type LLMErrorType = 
  | "api_failure" 
  | "timeout" 
  | "rate_limit" 
  | "invalid_response" 
  | "config_error";

export interface LLMError {
  type: LLMErrorType;
  message: string;
  details?: string;
  recoverable: boolean;
}
