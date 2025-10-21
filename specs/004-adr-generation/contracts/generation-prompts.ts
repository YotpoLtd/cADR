/**
 * Generation Prompts Contract
 * 
 * Defines the interface for LLM prompt templates and formatting
 * for ADR generation following MADR format.
 */

/**
 * Version 1 of the generation prompt template
 * 
 * This prompt instructs the LLM to generate ADR content following
 * the MADR (Markdown Architectural Decision Records) template.
 * 
 * Placeholders:
 * - {file_paths}: List of changed files
 * - {diff_content}: Git diff content
 * - {current_date}: Current date in YYYY-MM-DD format
 * 
 * @constant
 */
export const GENERATION_PROMPT_V1: string;

/**
 * Format generation prompt with actual diff data
 * 
 * Replaces placeholders in the prompt template with actual data
 * from the current git changes.
 * 
 * @param data - Object containing file paths and diff content
 * @returns Formatted prompt ready for LLM
 * 
 * @example
 * const prompt = formatGenerationPrompt({
 *   file_paths: ['src/database.ts', 'src/config.ts'],
 *   diff_content: 'diff --git a/src/database.ts...'
 * });
 * 
 * // prompt now contains the full formatted prompt with:
 * // - file_paths replaced with actual file list
 * // - diff_content replaced with actual diff
 * // - current_date replaced with today's date
 */
export function formatGenerationPrompt(data: {
  file_paths: string[];
  diff_content: string;
}): string;

/**
 * Prompt user for ADR generation confirmation
 * 
 * Displays an interactive prompt asking if the user wants to
 * generate an ADR. Accepts ENTER (empty), "y", or "yes" as confirmation.
 * 
 * @param reason - The reasoning why this change is significant
 * @returns Promise<boolean> - true if user confirms, false otherwise
 * 
 * @example
 * const reason = "Introduces PostgreSQL as primary datastore";
 * const shouldGenerate = await promptForGeneration(reason);
 * 
 * if (shouldGenerate) {
 *   // Proceed with generation
 * } else {
 *   // Skip generation
 * }
 * 
 * @remarks
 * - Uses readline for synchronous user input
 * - Accepts: empty string (ENTER), "y", "yes" (case-insensitive)
 * - Rejects: "n", "no", or any other input
 */
export async function promptForGeneration(reason: string): Promise<boolean>;

