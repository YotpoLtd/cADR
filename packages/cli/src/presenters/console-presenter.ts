/* eslint-disable no-console */
export interface AnalysisSummary {
  fileCount: number;
  mode: string;
  isSignificant: boolean;
  reason: string;
  confidence?: number;
  filePath?: string;
  title?: string;
}

export interface DiffOptions {
  mode: 'staged' | 'all' | 'branch-diff';
  base?: string;
  head?: string;
}

export class ConsolePresenter {
  showConfigError(): void {
    console.error('\n❌ Configuration Error');
    console.error('Configuration file not found or invalid.');
    console.error('\n💡 Run `cadr init` to create a configuration file.\n');
  }

  showGitError(message: string): void {
    console.error(`\n❌ Git Error: ${message}\n`);
  }

  showReadFilesError(): void {
    console.error('\n❌ Failed to read changed files\n');
  }

  showDiffReadError(): void {
    console.error('\n❌ Failed to read diff content\n');
  }

  showNoChanges(options: DiffOptions): void {
    const modeText =
      options.mode === 'staged'
        ? 'staged'
        : options.mode === 'branch-diff'
          ? `between ${options.base || 'origin/main'} and ${options.head || 'HEAD'}`
          : 'uncommitted';

    console.log(
      `\nℹ️  No changes to analyze ${options.mode === 'branch-diff' ? modeText : `(${modeText})`}`
    );

    if (options.mode === 'staged') {
      console.log('💡 Stage some files first:');
      console.log('   git add <files>');
      console.log('   cadr analyze --staged\n');
    } else if (options.mode === 'branch-diff') {
      console.log('💡 No changes found between specified git references.\n');
    } else {
      console.log('💡 Make some changes first, then run:');
      console.log('   cadr analyze\n');
    }
  }

  showAnalyzingFiles(files: string[], options: DiffOptions): void {
    const modeText =
      options.mode === 'staged'
        ? 'staged'
        : options.mode === 'branch-diff'
          ? `between ${options.base || 'origin/main'} and ${options.head || 'HEAD'}`
          : 'uncommitted';

    const fileCountText =
      options.mode === 'branch-diff'
        ? `${files.length} file${files.length === 1 ? '' : 's'} changed ${modeText}`
        : `${files.length} ${modeText} file${files.length === 1 ? '' : 's'}`;

    console.log(`\n📝 Analyzing ${fileCountText}:`);
    files.forEach((file) => {
      console.log(`  • ${file}`);
    });
    console.log('');
  }

  showNoDiffContent(): void {
    console.log('\nℹ️  No diff content found\n');
  }

  showSendingToLLM(options: DiffOptions, provider: string, model: string): void {
    const analysisText =
      options.mode === 'staged'
        ? 'staged changes'
        : options.mode === 'branch-diff'
          ? 'changes'
          : 'uncommitted changes';

    console.log(`🔍 Analyzing ${analysisText} for architectural significance...\n`);
    console.log(`🤖 Sending to ${provider} ${model}...\n`);
  }

  showAnalysisFailed(error?: string): void {
    console.error('\n❌ Analysis failed');
    console.error(`\n${error || 'Unknown error occurred'}\n`);
  }

  showAnalysisComplete(): void {
    console.log('✅ Analysis Complete\n');
  }

  showSignificantResult(summary: AnalysisSummary): void {
    console.log('📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT');
    console.log(`💭 Reasoning: ${summary.reason}\n`);
    if (summary.confidence) {
      console.log(`🎯 Confidence: ${(summary.confidence * 100).toFixed(0)}%\n`);
    }
  }

  showNotSignificantResult(summary: AnalysisSummary): void {
    console.log('📊 Result: ℹ️  NOT ARCHITECTURALLY SIGNIFICANT');
    console.log(`💭 Reasoning: ${summary.reason}\n`);
    if (summary.confidence) {
      console.log(`🎯 Confidence: ${(summary.confidence * 100).toFixed(0)}%\n`);
    }
    console.log('✅ No ADR needed for these changes.\n');
  }

  showGeneratingADR(): void {
    console.log('\n🧠 Generating ADR draft...\n');
  }

  showGenerationFailed(error?: string): void {
    console.error('\n❌ ADR generation failed');
    console.error(`\n${error || 'Unknown error occurred'}\n`);
  }

  showADRSuccess(filePath: string): void {
    console.log('✅ Success! Draft ADR created\n');
    console.log(`📄 File: ${filePath}\n`);
    console.log('💡 Next steps:');
    console.log('   1. Review and refine the generated ADR');
    console.log('   2. Commit it alongside your code changes\n');
  }

  showADRSaveError(error?: string): void {
    console.error('\n❌ Failed to save ADR');
    console.error(`\n${error || 'Unknown error occurred'}\n`);
  }

  showSkippingGeneration(): void {
    console.log('\n📋 Skipping ADR generation');
    console.log('🎯 Recommendation: Consider documenting this decision manually.\n');
  }

  showUnexpectedError(): void {
    console.error('\n❌ An unexpected error occurred');
    console.error('Please check the logs for more details.\n');
  }
}

export const presenter = new ConsolePresenter();
