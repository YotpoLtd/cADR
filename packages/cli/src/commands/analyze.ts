/**
 * Analyze Command
 * 
 * Triggers LLM-powered analysis of staged code changes.
 * Thin wrapper around analysis orchestration module.
 */

import { runAnalysis } from '../analysis';
import { loggerInstance as logger } from '../logger';

/**
 * Execute the analyze command
 * Analyzes staged changes for architectural significance
 */
export async function analyzeCommand(): Promise<void> {
  try {
    logger.info('Analyze command started');
    await runAnalysis();
    logger.info('Analyze command completed');
  } catch (error) {
    // Fail-open: log error but don't throw
    logger.error('Analyze command failed', { error });
    // eslint-disable-next-line no-console
    console.error('\n❌ Analysis command failed');
    // eslint-disable-next-line no-console
    console.error('Please check the logs for more details.\n');
  }
}

