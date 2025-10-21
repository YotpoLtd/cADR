/**
 * LLM Generation Contract
 * 
 * Defines the interface for LLM-powered ADR content generation.
 * Extends the existing LLM client with generation capabilities.
 */

import { AnalysisConfig } from './config-manager';

/**
 * Generation request data structure
 */
export interface GenerationRequest {
  /** List of files that triggered this ADR */
  file_paths: string[];
  
  /** Full git diff content */
  diff_content: string;
  
  /** Reasoning from analysis phase */
  reason: string;
  
  /** Formatted LLM prompt with MADR template */
  generation_prompt: string;
}

/**
 * Generation result from LLM
 */
export interface GenerationResult {
  /** Full MADR-formatted markdown content */
  content: string;
  
  /** Extracted title from first line */
  title: string;
  
  /** ISO 8601 timestamp of generation */
  timestamp: string;
}

/**
 * Generation response including potential errors
 */
export interface GenerationResponse {
  /** Result object, null if error occurred */
  result: GenerationResult | null;
  
  /** Error message if generation failed */
  error?: string;
}

/**
 * Generate ADR content using LLM
 * 
 * Sends a generation request to the configured LLM and returns
 * MADR-formatted content. Follows fail-open principle.
 * 
 * @param config - Analysis configuration (provider, model, API key)
 * @param request - Generation request with diff and context
 * @returns Promise resolving to generation response with result or error
 * 
 * @example
 * const response = await generateADRContent(config, {
 *   file_paths: ['src/database.ts'],
 *   diff_content: 'diff --git a/src/database.ts...',
 *   reason: 'Introduces PostgreSQL as primary datastore',
 *   generation_prompt: formatGenerationPrompt(...)
 * });
 * 
 * if (response.result) {
 *   console.log(response.result.title);
 *   console.log(response.result.content);
 * } else {
 *   console.error(response.error);
 * }
 * 
 * @remarks
 * - Uses the same model as analysis (config.analysis_model)
 * - Respects configured timeout (config.timeout_seconds)
 * - Always returns a response, never throws (fail-open)
 * - Logs structured events for observability
 */
export async function generateADRContent(
  config: AnalysisConfig,
  request: GenerationRequest
): Promise<GenerationResponse>;

