/**
 * Analysis Orchestration Module
 * 
 * Coordinates the complete analysis flow: config loading, git operations,
 * prompt formatting, LLM analysis, and result display.
 * Implements fail-open principle per constitution requirements.
 */

import { loadConfig, getDefaultConfigPath } from './config';
import { getStagedFiles, getStagedDiff, GitError } from './git';
import { formatPrompt, ANALYSIS_PROMPT_V1 } from './prompts';
import { analyzeChanges } from './llm';
import { loggerInstance as logger } from './logger';
import * as path from 'path';

/**
 * Run complete analysis workflow
 * 
 * This function orchestrates the entire analysis process:
 * 1. Load configuration
 * 2. Get staged files and diff
 * 3. Format LLM prompt
 * 4. Call LLM for analysis
 * 5. Display results
 * 
 * Follows fail-open principle: always exits cleanly, never throws.
 */
export async function runAnalysis(): Promise<void> {
  try {
    logger.info('Starting analysis workflow');

    // Step 1: Load configuration
    const configPath = getDefaultConfigPath();
    const config = await loadConfig(configPath);

    if (!config) {
      // eslint-disable-next-line no-console
      console.error('\n❌ Configuration Error');
      // eslint-disable-next-line no-console
      console.error('Configuration file not found or invalid.');
      // eslint-disable-next-line no-console
      console.error('\n💡 Run `cadr init` to create a configuration file.\n');
      return;
    }

    // Step 2: Get staged files
    let stagedFiles: string[];
    try {
      stagedFiles = await getStagedFiles();
    } catch (error) {
      if (error instanceof GitError) {
        // eslint-disable-next-line no-console
        console.error(`\n❌ Git Error: ${error.message}\n`);
      } else {
        // eslint-disable-next-line no-console
        console.error('\n❌ Failed to read staged files\n');
      }
      logger.error('Failed to get staged files', { error });
      return;
    }

    // Check if there are staged files
    if (stagedFiles.length === 0) {
      // eslint-disable-next-line no-console
      console.log('\nℹ️  No staged changes to analyze');
      // eslint-disable-next-line no-console
      console.log('💡 Stage some files first:');
      // eslint-disable-next-line no-console
      console.log('   git add <files>');
      // eslint-disable-next-line no-console
      console.log('   cadr --analyze\n');
      return;
    }

    // Step 3: Get diff content
    let diffContent: string;
    try {
      diffContent = await getStagedDiff();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('\n❌ Failed to read diff content\n');
      logger.error('Failed to get staged diff', { error });
      return;
    }

    // Check if diff is empty
    if (!diffContent || diffContent.trim().length === 0) {
      // eslint-disable-next-line no-console
      console.log('\nℹ️  No diff content found\n');
      return;
    }

    // Step 4: Format prompt
    const repositoryContext = path.basename(process.cwd());
    const prompt = formatPrompt(ANALYSIS_PROMPT_V1, {
      file_paths: stagedFiles,
      diff_content: diffContent,
    });

    // Display analysis start
    // eslint-disable-next-line no-console
    console.log('\n🔍 Analyzing staged changes for architectural significance...\n');
    // eslint-disable-next-line no-console
    console.log(`📁 Files (${stagedFiles.length}):`);
    stagedFiles.forEach((file) => {
      // eslint-disable-next-line no-console
      console.log(`   ${file}`);
    });
    // eslint-disable-next-line no-console
    console.log(`\n🤖 Sending to ${config.provider} ${config.analysis_model}...\n`);

    // Step 5: Call LLM for analysis
    const result = await analyzeChanges(config, {
      file_paths: stagedFiles,
      diff_content: diffContent,
      repository_context: repositoryContext,
      analysis_prompt: prompt,
    });

    // Step 6: Display results
    if (!result) {
      // eslint-disable-next-line no-console
      console.warn('\n⚠️  Analysis failed');
      // eslint-disable-next-line no-console
      console.warn('The LLM analysis could not be completed.');
      // eslint-disable-next-line no-console
      console.warn('This could be due to:');
      // eslint-disable-next-line no-console
      console.warn('  - API key not set or invalid');
      // eslint-disable-next-line no-console
      console.warn('  - Rate limiting');
      // eslint-disable-next-line no-console
      console.warn('  - Network timeout');
      // eslint-disable-next-line no-console
      console.warn('  - Service unavailable\n');
      return;
    }

    // Display analysis result
    // eslint-disable-next-line no-console
    console.log('✅ Analysis Complete\n');

    if (result.is_significant) {
      // eslint-disable-next-line no-console
      console.log('📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT');
      // eslint-disable-next-line no-console
      console.log(`💭 Reasoning: ${result.reason}\n`);
      if (result.confidence) {
        // eslint-disable-next-line no-console
        console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(0)}%\n`);
      }
      // eslint-disable-next-line no-console
      console.log('🎯 Recommendation: Consider creating an ADR to document');
      // eslint-disable-next-line no-console
      console.log('   this architectural decision and its implications.\n');
    } else {
      // eslint-disable-next-line no-console
      console.log('📊 Result: ℹ️  NOT ARCHITECTURALLY SIGNIFICANT');
      // eslint-disable-next-line no-console
      console.log(`💭 Reasoning: ${result.reason}\n`);
      if (result.confidence) {
        // eslint-disable-next-line no-console
        console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(0)}%\n`);
      }
      // eslint-disable-next-line no-console
      console.log('✅ No ADR needed for these changes.\n');
    }

    logger.info('Analysis workflow completed successfully', {
      is_significant: result.is_significant,
      file_count: stagedFiles.length,
    });
  } catch (error) {
    // Final catch-all for any unexpected errors (fail-open)
    logger.error('Unexpected error in analysis workflow', { error });
    // eslint-disable-next-line no-console
    console.error('\n❌ An unexpected error occurred');
    // eslint-disable-next-line no-console
    console.error('Please check the logs for more details.\n');
  }
}

