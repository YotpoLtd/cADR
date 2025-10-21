/**
 * ADR Manager Contract
 * 
 * Defines the interface for ADR file management operations.
 * This contract specifies how ADR files are created, numbered, and saved.
 */

/**
 * Convert a title to a filename-safe slug
 * 
 * @param title - The ADR title (e.g., "Use PostgreSQL for Storage")
 * @returns Lowercase, hyphen-separated slug (e.g., "use-postgresql-for-storage")
 * 
 * @example
 * titleToSlug("Use PostgreSQL for Storage") // "use-postgresql-for-storage"
 * titleToSlug("API v2.0: New Endpoints!") // "api-v2-0-new-endpoints"
 */
export function titleToSlug(title: string): string;

/**
 * Get the next sequential ADR number
 * 
 * Scans the ADR directory for existing files and returns the next available number.
 * If no ADRs exist, returns 1.
 * 
 * @param adrDir - Path to ADR directory (e.g., "docs/adr")
 * @returns Next ADR number (1-based)
 * 
 * @example
 * // If docs/adr/ contains 0001-first.md and 0002-second.md
 * getNextADRNumber("docs/adr") // Returns: 3
 * 
 * // If docs/adr/ is empty or doesn't exist
 * getNextADRNumber("docs/adr") // Returns: 1
 */
export function getNextADRNumber(adrDir: string): number;

/**
 * Ensure ADR directory exists, create if needed
 * 
 * Creates the directory structure recursively if it doesn't exist.
 * Safe to call multiple times - idempotent operation.
 * 
 * @param adrDir - Path to ADR directory to ensure exists
 * 
 * @example
 * ensureADRDirectory("docs/adr")
 * // Creates docs/ and docs/adr/ if they don't exist
 */
export function ensureADRDirectory(adrDir: string): void;

/**
 * Generate ADR filename from number and title
 * 
 * @param number - ADR number (will be zero-padded to 4 digits)
 * @param title - ADR title (will be converted to slug)
 * @returns Filename in format: NNNN-title-slug.md
 * 
 * @example
 * generateADRFilename(1, "Use PostgreSQL") 
 * // Returns: "0001-use-postgresql.md"
 * 
 * generateADRFilename(42, "Switch to TypeScript")
 * // Returns: "0042-switch-to-typescript.md"
 */
export function generateADRFilename(number: number, title: string): string;

/**
 * Save ADR content to file
 * 
 * This is the main orchestrator function that:
 * 1. Ensures directory exists
 * 2. Gets next ADR number
 * 3. Generates filename
 * 4. Writes content to disk
 * 
 * @param content - Full MADR-formatted markdown content
 * @param title - ADR title (for filename generation)
 * @param adrDir - Directory to save in (defaults to "docs/adr")
 * @returns Result object with success status and filepath or error
 * 
 * @example
 * const result = saveADR(
 *   "# Use PostgreSQL\n\n* Status: accepted\n...",
 *   "Use PostgreSQL",
 *   "docs/adr"
 * );
 * 
 * if (result.success) {
 *   console.log(`ADR saved to: ${result.filePath}`);
 * } else {
 *   console.error(`Error: ${result.error}`);
 * }
 */
export function saveADR(
  content: string,
  title: string,
  adrDir?: string
): {
  success: boolean;
  filePath?: string;
  error?: string;
};

/**
 * Default ADR directory path
 */
export const DEFAULT_ADR_DIR: string;

