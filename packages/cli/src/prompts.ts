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
 * It considers patterns, data model changes, API changes, and security implications.
 */
export const ANALYSIS_PROMPT_V1 = `
You are analyzing code changes for architectural significance.

Given the following staged changes:
{file_paths}

Diff content:
{diff_content}

Determine if these changes are architecturally significant.
Consider: new patterns, data model changes, API changes, security implications.

Respond ONLY with valid JSON:
{"is_significant": boolean, "reason": "explanation"}
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
