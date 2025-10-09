/**
 * Prompts Module
 * 
 * Contains versioned prompt templates for LLM analysis.
 * Follows the constitution requirement for versioned prompts.
 */

/**
 * Version 1 of the analysis prompt template.
 * 
 * This prompt is designed to analyze code changes for architectural significance.
 * It uses specific criteria for determining significance and enforces strict JSON output.
 */
export const ANALYSIS_PROMPT_V1 = `
You are an expert principal engineer and software architect acting as a meticulous code reviewer. Your sole task is to determine if the provided git diff represents an architecturally significant change that warrants an Architectural Decision Record (ADR).

Given the following staged changes:
{file_paths}

Diff content:
{diff_content}

A change is considered architecturally significant if it:
- Introduces a new external dependency, library, or service.
- Adds, removes, or modifies infrastructure components (e.g., databases, caches, queues, Docker services).
- Changes a public API contract, a data schema, or a critical data model.
- Alters authentication, authorization, or other core security patterns.
- Modifies cross-cutting concerns like logging, observability, or CI/CD pipelines.

Respond ONLY with a single, minified JSON object with no preamble, no markdown, and no additional text. The JSON object must adhere to the following schema:
{"is_significant": boolean, "reason": string}

The "reason" should be a concise, one-sentence explanation for your decision, suitable for showing to a developer. If the change is not significant, the reason should be an empty string.
`;

/**
 * Formats a prompt template by replacing placeholders with actual data.
 * 
 * @param template - The prompt template with placeholders
 * @param data - Object containing file_paths and diff_content
 * @returns Formatted prompt with placeholders replaced
 */
export function formatPrompt(
  template: string, 
  data: { file_paths: string[], diff_content: string }
): string {
  // Format file paths as a readable list
  const formattedFilePaths = data.file_paths.length > 0 
    ? data.file_paths.join('\n')
    : 'No files';

  // Replace placeholders with actual data
  return template
    .replace('{file_paths}', formattedFilePaths)
    .replace('{diff_content}', data.diff_content);
}
