/**
 * Analyze Command
 * 
 * Triggers LLM-powered analysis of code changes.
 * Thin wrapper around analysis orchestration module.
 */

import { runAnalysis } from '../analysis';
import { DiffOptions } from '../git';
import { loggerInstance as logger } from '../logger';

/**
 * Execute the analyze command
 * Analyzes code changes for architectural significance
 * 
 * @param args - Command line arguments (e.g., ['--staged'], ['--all'])
 */
export async function analyzeCommand(args: string[] = []): Promise<void> {
  try {
    // Parse command line flags to determine diff options
    const diffOptions: DiffOptions = { mode: 'all' }; // Default to all uncommitted
    
    // Check for --base flag (implies branch-diff mode)
    const baseIndex = args.indexOf('--base');
    if (baseIndex !== -1 && baseIndex + 1 < args.length) {
      diffOptions.mode = 'branch-diff';
      diffOptions.base = args[baseIndex + 1];
      
      // Check for optional --head flag
      const headIndex = args.indexOf('--head');
      if (headIndex !== -1 && headIndex + 1 < args.length) {
        diffOptions.head = args[headIndex + 1];
      }
    } else if (args.includes('--staged')) {
      diffOptions.mode = 'staged';
    } else if (args.includes('--all')) {
      diffOptions.mode = 'all';
    }
    
    logger.info('Analyze command started', { 
      mode: diffOptions.mode,
      base: diffOptions.base,
      head: diffOptions.head
    });
    await runAnalysis(diffOptions);
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

