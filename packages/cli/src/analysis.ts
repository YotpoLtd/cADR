/**
 * Analysis Orchestration Module
 * 
 * Coordinates the complete analysis flow: config loading, git operations,
 * prompt formatting, LLM analysis, and result display.
 * Implements fail-open principle per constitution requirements.
 */

import { loadConfig, getDefaultConfigPath } from './config';
import { getChangedFiles, getDiff, DiffOptions, GitError } from './git';
import { formatPrompt, ANALYSIS_PROMPT_V1, formatGenerationPrompt, promptForGeneration } from './prompts';
import { analyzeChanges, generateADRContent } from './llm';
import { loggerInstance as logger } from './logger';
import { saveADR } from './adr';
import * as path from 'path';

/**
 * Run complete analysis workflow
 * 
 * This function orchestrates the entire analysis process:
 * 1. Load configuration
 * 2. Get changed files and diff based on options
 * 3. Format LLM prompt
 * 4. Call LLM for analysis
 * 5. Display results
 * 
 * Follows fail-open principle: always exits cleanly, never throws.
 * 
 * @param diffOptions - Options specifying which changes to analyze (defaults to all uncommitted)
 */
export async function runAnalysis(diffOptions: DiffOptions = { mode: 'all' }): Promise<void> {
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

    // Step 2: Get changed files based on diff options
    let changedFiles: string[];
    try {
      changedFiles = await getChangedFiles(diffOptions);
    } catch (error) {
      if (error instanceof GitError) {
        // eslint-disable-next-line no-console
        console.error(`\n❌ Git Error: ${error.message}\n`);
      } else {
        // eslint-disable-next-line no-console
        console.error('\n❌ Failed to read changed files\n');
      }
      logger.error('Failed to get changed files', { error, mode: diffOptions.mode });
      return;
    }

    // Check if there are changed files
    const modeText = diffOptions.mode === 'staged' ? 'staged' : 
                      diffOptions.mode === 'branch-diff' ? `between ${diffOptions.base || 'origin/main'} and ${diffOptions.head || 'HEAD'}` : 
                      'uncommitted';
    if (changedFiles.length === 0) {
      // eslint-disable-next-line no-console
      console.log(`\nℹ️  No changes to analyze ${diffOptions.mode === 'branch-diff' ? modeText : `(${modeText})`}`);
      if (diffOptions.mode === 'staged') {
        // eslint-disable-next-line no-console
        console.log('💡 Stage some files first:');
        // eslint-disable-next-line no-console
        console.log('   git add <files>');
        // eslint-disable-next-line no-console
        console.log('   cadr analyze --staged\n');
      } else if (diffOptions.mode === 'branch-diff') {
        // eslint-disable-next-line no-console
        console.log('💡 No changes found between specified git references.\n');
      } else {
        // eslint-disable-next-line no-console
        console.log('💡 Make some changes first, then run:');
        // eslint-disable-next-line no-console
        console.log('   cadr analyze\n');
      }
      return;
    }

    // Display files being analyzed
    const fileCountText = diffOptions.mode === 'branch-diff' ? 
      `${changedFiles.length} file${changedFiles.length === 1 ? '' : 's'} changed ${modeText}` :
      `${changedFiles.length} ${modeText} file${changedFiles.length === 1 ? '' : 's'}`;
    // eslint-disable-next-line no-console
    console.log(`\n📝 Analyzing ${fileCountText}:`);
    changedFiles.forEach((file: string) => {
      // eslint-disable-next-line no-console
      console.log(`  • ${file}`);
    });
    // eslint-disable-next-line no-console
    console.log('');

    // Step 3: Get diff content
    let diffContent: string;
    try {
      diffContent = await getDiff(diffOptions);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('\n❌ Failed to read diff content\n');
      logger.error('Failed to get diff', { error, mode: diffOptions.mode });
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
      file_paths: changedFiles,
      diff_content: diffContent,
    });

    // Display analysis start
    const analysisText = diffOptions.mode === 'staged' ? 'staged changes' : 
                          diffOptions.mode === 'branch-diff' ? 'changes' : 
                          'uncommitted changes';
    // eslint-disable-next-line no-console
    console.log(`🔍 Analyzing ${analysisText} for architectural significance...\n`);
    // eslint-disable-next-line no-console
    console.log(`🤖 Sending to ${config.provider} ${config.analysis_model}...\n`);

    // Step 5: Call LLM for analysis
    const response = await analyzeChanges(config, {
      file_paths: changedFiles,
      diff_content: diffContent,
      repository_context: repositoryContext,
      analysis_prompt: prompt,
    });

    // Step 6: Display results
    if (!response.result || response.error) {
      // eslint-disable-next-line no-console
      console.error('\n❌ Analysis failed');
      // eslint-disable-next-line no-console
      console.error(`\n${response.error || 'Unknown error occurred'}\n`);
      return;
    }

    const result = response.result;

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

      // Prompt user for ADR generation
      const shouldGenerate = await promptForGeneration(result.reason);

      if (shouldGenerate) {
        // eslint-disable-next-line no-console
        console.log('\n🧠 Generating ADR draft...\n');

        // Format generation prompt
        const generationPrompt = formatGenerationPrompt({
          file_paths: changedFiles,
          diff_content: diffContent,
        });

        // Call LLM to generate ADR content
        const generationResponse = await generateADRContent(config, {
          file_paths: changedFiles,
          diff_content: diffContent,
          reason: result.reason,
          generation_prompt: generationPrompt,
        });

        if (!generationResponse.result || generationResponse.error) {
          // eslint-disable-next-line no-console
          console.error('\n❌ ADR generation failed');
          // eslint-disable-next-line no-console
          console.error(`\n${generationResponse.error || 'Unknown error occurred'}\n`);
          logger.error('ADR generation failed', { error: generationResponse.error });
        } else {
          // Save ADR to file
          const saveResult = saveADR(
            generationResponse.result.content,
            generationResponse.result.title
          );

          if (saveResult.success && saveResult.filePath) {
            // eslint-disable-next-line no-console
            console.log('✅ Success! Draft ADR created\n');
            // eslint-disable-next-line no-console
            console.log(`📄 File: ${saveResult.filePath}\n`);
            // eslint-disable-next-line no-console
            console.log('💡 Next steps:');
            // eslint-disable-next-line no-console
            console.log('   1. Review and refine the generated ADR');
            // eslint-disable-next-line no-console
            console.log('   2. Commit it alongside your code changes\n');
            
            logger.info('ADR generation workflow completed successfully', {
              filePath: saveResult.filePath,
              title: generationResponse.result.title,
            });
          } else {
            // eslint-disable-next-line no-console
            console.error('\n❌ Failed to save ADR');
            // eslint-disable-next-line no-console
            console.error(`\n${saveResult.error || 'Unknown error occurred'}\n`);
            logger.error('Failed to save ADR', { error: saveResult.error });
          }
        }
      } else {
        // User declined generation
        // eslint-disable-next-line no-console
        console.log('\n📋 Skipping ADR generation');
        // eslint-disable-next-line no-console
        console.log('🎯 Recommendation: Consider documenting this decision manually.\n');
      }
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
      file_count: changedFiles.length,
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

