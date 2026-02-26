/**
 * ADR File Management Module
 *
 * Handles creation and management of Architectural Decision Record files.
 * Follows MADR (Markdown Architectural Decision Records) format.
 */

import * as fs from 'fs';
import * as path from 'path';
import { loggerInstance as logger } from '../logger';

export const DEFAULT_ADR_DIR = 'docs/adr';

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getNextADRNumber(adrDir: string): number {
  try {
    if (!fs.existsSync(adrDir)) {
      return 1;
    }

    const files = fs.readdirSync(adrDir);
    const adrNumbers: number[] = [];

    for (const file of files) {
      const match = file.match(/^(\d{4})-/);
      if (match) {
        adrNumbers.push(parseInt(match[1], 10));
      }
    }

    if (adrNumbers.length === 0) {
      return 1;
    }

    return Math.max(...adrNumbers) + 1;
  } catch (error) {
    logger.warn('Failed to scan existing ADRs, defaulting to 1', { error, adrDir });
    return 1;
  }
}

export function ensureADRDirectory(adrDir: string): void {
  if (!fs.existsSync(adrDir)) {
    logger.info('Creating ADR directory', { adrDir });
    fs.mkdirSync(adrDir, { recursive: true });
  }
}

export function generateADRFilename(number: number, title: string): string {
  const paddedNumber = String(number).padStart(4, '0');
  const slug = titleToSlug(title);
  return `${paddedNumber}-${slug}.md`;
}

export function saveADR(
  content: string,
  title: string,
  adrDir: string = DEFAULT_ADR_DIR
): { success: boolean; filePath?: string; error?: string } {
  try {
    ensureADRDirectory(adrDir);

    const adrNumber = getNextADRNumber(adrDir);

    const filename = generateADRFilename(adrNumber, title);
    const filePath = path.join(adrDir, filename);

    if (fs.existsSync(filePath)) {
      logger.warn('ADR file already exists, using alternative name', { filePath });
      const alternativeFilename = generateADRFilename(adrNumber + 1, title);
      const alternativeFilePath = path.join(adrDir, alternativeFilename);

      fs.writeFileSync(alternativeFilePath, content, 'utf-8');
      logger.info('ADR saved successfully', { filePath: alternativeFilePath });

      return { success: true, filePath: alternativeFilePath };
    }

    fs.writeFileSync(filePath, content, 'utf-8');

    logger.info('ADR saved successfully', { filePath, adrNumber });

    return { success: true, filePath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to save ADR', { error, adrDir });
    return { success: false, error: errorMessage };
  }
}
