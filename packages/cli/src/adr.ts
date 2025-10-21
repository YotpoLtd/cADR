/**
 * ADR File Management Module
 * 
 * Handles creation and management of Architectural Decision Record files.
 * Follows MADR (Markdown Architectural Decision Records) format.
 */

import * as fs from 'fs';
import * as path from 'path';
import { loggerInstance as logger } from './logger';

/**
 * Default ADR directory relative to project root
 */
export const DEFAULT_ADR_DIR = 'docs/adr';

/**
 * Convert a title to a filename-safe slug
 * Example: "Use PostgreSQL for Storage" -> "use-postgresql-for-storage"
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get the next ADR number by scanning existing ADR files
 * 
 * @param adrDir - Directory containing ADR files
 * @returns Next available ADR number (e.g., 1, 2, 3...)
 */
export function getNextADRNumber(adrDir: string): number {
  try {
    if (!fs.existsSync(adrDir)) {
      return 1; // First ADR
    }

    const files = fs.readdirSync(adrDir);
    const adrNumbers: number[] = [];

    // Extract numbers from existing ADR files (format: 0001-title.md)
    for (const file of files) {
      const match = file.match(/^(\d{4})-/);
      if (match) {
        adrNumbers.push(parseInt(match[1], 10));
      }
    }

    if (adrNumbers.length === 0) {
      return 1;
    }

    // Return next number after the highest existing number
    return Math.max(...adrNumbers) + 1;
  } catch (error) {
    logger.warn('Failed to scan existing ADRs, defaulting to 1', { error, adrDir });
    return 1;
  }
}

/**
 * Ensure ADR directory exists, create if it doesn't
 * 
 * @param adrDir - Directory path to ensure exists
 */
export function ensureADRDirectory(adrDir: string): void {
  if (!fs.existsSync(adrDir)) {
    logger.info('Creating ADR directory', { adrDir });
    fs.mkdirSync(adrDir, { recursive: true });
  }
}

/**
 * Generate ADR filename from number and title
 * 
 * @param number - ADR number (will be zero-padded to 4 digits)
 * @param title - ADR title (will be converted to slug)
 * @returns Filename like "0001-use-postgresql-for-storage.md"
 */
export function generateADRFilename(number: number, title: string): string {
  const paddedNumber = String(number).padStart(4, '0');
  const slug = titleToSlug(title);
  return `${paddedNumber}-${slug}.md`;
}

/**
 * Save ADR content to file
 * 
 * @param content - Full markdown content of the ADR
 * @param title - Title extracted from ADR content
 * @param adrDir - Directory to save ADR in (defaults to docs/adr)
 * @returns Object with success status, file path, and any error
 */
export function saveADR(
  content: string,
  title: string,
  adrDir: string = DEFAULT_ADR_DIR
): { success: boolean; filePath?: string; error?: string } {
  try {
    // Ensure directory exists
    ensureADRDirectory(adrDir);

    // Get next ADR number
    const adrNumber = getNextADRNumber(adrDir);

    // Generate filename
    const filename = generateADRFilename(adrNumber, title);
    const filePath = path.join(adrDir, filename);

    // Check if file already exists (shouldn't happen, but safety check)
    if (fs.existsSync(filePath)) {
      logger.warn('ADR file already exists, using alternative name', { filePath });
      const alternativeFilename = generateADRFilename(adrNumber + 1, title);
      const alternativeFilePath = path.join(adrDir, alternativeFilename);
      
      fs.writeFileSync(alternativeFilePath, content, 'utf-8');
      logger.info('ADR saved successfully', { filePath: alternativeFilePath });
      
      return { success: true, filePath: alternativeFilePath };
    }

    // Write ADR content to file
    fs.writeFileSync(filePath, content, 'utf-8');

    logger.info('ADR saved successfully', { filePath, adrNumber });

    return { success: true, filePath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to save ADR', { error, adrDir });
    return { success: false, error: errorMessage };
  }
}

