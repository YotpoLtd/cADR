// Removed unused commander import
import { getStagedFiles, GitError } from './git';
import { loggerInstance } from './logger';
import { initCommand } from './commands/init';
import { analyzeCommand } from './commands/analyze';

// Version constants
const CORE_VERSION = '0.0.1';
const CLI_VERSION = '0.0.1';

export function getWelcomeMessage(): string {
  return `🎉 Hello, cADR!

cADR (Continuous Architectural Decision Records) helps you automatically
capture and document architectural decisions as you code.

Version: ${CLI_VERSION}
Core: ${CORE_VERSION}
Learn more: https://github.com/YotpoLtd/cADR

Get started by running 'cadr --verbose' to see detailed logs
`;
}

export function displayWelcome(): void {
  // Use process.stdout.write instead of console.log (Constitution: no console.log)
  process.stdout.write(getWelcomeMessage());
}

export async function processStagedFiles(verbose = false): Promise<void> {
  try {
    const stagedFiles = await getStagedFiles();
    
    // Display staged files to user
    if (stagedFiles.length > 0) {
      process.stdout.write(`\n📁 Found ${stagedFiles.length} staged file${stagedFiles.length === 1 ? '' : 's'}:\n`);
      stagedFiles.forEach((file: string) => {
        process.stdout.write(`  • ${file}\n`);
      });
    } else {
      process.stdout.write(`\n📁 No staged files found.\n`);
    }
    
    // Only log for debugging when verbose mode is enabled
    if (verbose) {
      loggerInstance.info('Retrieved staged files', {
        staged_files: stagedFiles,
        count: stagedFiles.length
      });
    }
  } catch (error: unknown) {
    if (error instanceof GitError) {
      // Display helpful error message to stdout
      process.stdout.write(`\n❌ ${error.message}\n`);
      process.exit(1);
    } else {
      // Log unexpected errors (always show errors)
      const errorMessage = error instanceof Error ? error.message : String(error);
      loggerInstance.error('Unexpected error occurred', { 
        error: errorMessage
      });
      process.exit(1);
    }
  }
}

// Main execution block - run when module is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Handle commands manually
  (async () => {
    if (args[0] === 'init') {
      await initCommand();
    } else if (args[0] === 'analyze') {
      await analyzeCommand();
    } else if (args.includes('--analyze')) {
      await analyzeCommand();
    } else {
      // Default behavior - display welcome and staged files
      displayWelcome();
      await processStagedFiles(args.includes('--verbose') || args.includes('-v'));
    }
  })().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
}