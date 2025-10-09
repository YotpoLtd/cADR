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
  analyze           Analyze code changes and generate ADRs (default)
  help              Show this help message

ANALYZE OPTIONS
  --all             Analyze all uncommitted changes (staged + unstaged) [default]
  --staged          Analyze only staged changes
  --base <ref>      Base git reference for CI/CD (e.g., origin/main)
  --head <ref>      Head git reference for CI/CD (default: HEAD)

GLOBAL OPTIONS
  -h, --help        Show help message
  -v, --version     Show version information
  --verbose         Enable verbose logging

EXAMPLES
  # Local development
  cadr                                # Analyze all uncommitted files (default)
  cadr analyze                        # Analyze all uncommitted files
  cadr analyze --staged               # Analyze only staged files
  cadr analyze --all                  # Analyze all uncommitted files (explicit)
  
  # CI/CD (Pull Requests)
  cadr analyze --base origin/main     # Compare current HEAD to main
  cadr analyze --base origin/main --head feature-branch
  cadr analyze --base HEAD~1          # Compare to previous commit
  
  # Other commands
  cadr init                           # Initialize configuration
  cadr --verbose analyze              # Analyze with debug logs

LEARN MORE
  GitHub: https://github.com/YotpoLtd/cADR
  Docs:   https://github.com/YotpoLtd/cADR#readme
`;
  process.stdout.write(help);
}

export function showVersion(): void {
  process.stdout.write(`cADR version ${CLI_VERSION} (core: ${CORE_VERSION})\n`);
}


// Main execution block - run when module is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
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
        await analyzeCommand(args);
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