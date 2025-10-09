import { getStagedFiles, GitError } from './git';
import { loggerInstance } from './logger';
import { initCommand } from './commands/init';
import { analyzeCommand } from './commands/analyze';

// Version constants
const CORE_VERSION = '0.0.1';
const CLI_VERSION = '0.0.1';

export function showHelp(): void {
  const help = `
cADR - Continuous Architectural Decision Records
Version: ${CLI_VERSION}

USAGE
  cadr [command] [options]

COMMANDS
  init              Create a cadr.yaml configuration file
  analyze           Analyze staged changes and generate ADRs
  status            Show staged files (default when no command)
  help              Show this help message

OPTIONS
  -h, --help        Show help message
  -v, --version     Show version information
  --verbose         Enable verbose logging

EXAMPLES
  cadr init                    # Initialize configuration
  cadr analyze                 # Analyze staged files
  cadr status                  # Show current staged files
  cadr --verbose status        # Show staged files with debug logs

LEARN MORE
  GitHub: https://github.com/YotpoLtd/cADR
  Docs:   https://github.com/YotpoLtd/cADR#readme
`;
  process.stdout.write(help);
}

export function showVersion(): void {
  process.stdout.write(`cADR version ${CLI_VERSION} (core: ${CORE_VERSION})\n`);
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
  const command = args[0];
  const isVerbose = args.includes('--verbose') || args.includes('-v');
  
  // Handle commands
  (async () => {
    // Help flags
    if (!command || command === 'help' || args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }
    
    // Version flag
    if (args.includes('--version')) {
      showVersion();
      return;
    }
    
    // Commands
    switch (command) {
      case 'init':
        await initCommand();
        break;
        
      case 'analyze':
        await analyzeCommand();
        break;
        
      case 'status':
        await processStagedFiles(isVerbose);
        break;
        
      default:
        // Unknown command - show error and help
        process.stdout.write(`\n❌ Unknown command: ${command}\n`);
        showHelp();
        process.exit(1);
    }
  })().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Error:', error.message || error);
    process.exit(1);
  });
}