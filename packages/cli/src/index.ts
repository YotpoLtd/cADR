import { CORE_VERSION, CLI_VERSION, getStagedFiles, loggerInstance, GitError } from '@cadr/core';

// Parse command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose') || args.includes('-v');

export function getWelcomeMessage(): string {
  return `🎉 Hello, cADR!

cADR (Continuous Architectural Decision Records) helps you automatically
capture and document architectural decisions as you code.

Version: ${CLI_VERSION}
Core: ${CORE_VERSION}
Learn more: https://github.com/rbarabash/cADR

Get started by running 'cadr --verbose' to see detailed logs
`;
}

export function displayWelcome(): void {
  // Use process.stdout.write instead of console.log (Constitution: no console.log)
  process.stdout.write(getWelcomeMessage());
}

export async function processStagedFiles(): Promise<void> {
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
    if (isVerbose) {
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
  // Display welcome message first
  displayWelcome();
  
  // Then process staged files
  processStagedFiles().catch((error) => {
    loggerInstance.error('Failed to process staged files', { 
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  });
}
