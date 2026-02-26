/* eslint-disable no-console */
import { loadConfig, getDefaultConfigPath } from '../config';
import type { DiffOptions } from '../git/index';
import {
  formatPrompt,
  ANALYSIS_PROMPT_V1,
  formatGenerationPrompt,
  promptForGeneration,
} from '../llm/prompts';
import { analyzeChanges, generateADRContent } from '../llm/llm';
import { loggerInstance as logger } from '../logger';
import { saveADR } from '../adr/adr';
import * as path from 'path';
import { createGitStrategy, type GitStrategy } from './strategies/git-strategy';
import { presenter, type AnalysisSummary } from '../presenters/console-presenter';

export interface AnalysisResult {
  is_significant: boolean;
  reason: string;
  confidence?: number;
  timestamp: string;
}

export interface GenerationResult {
  content: string;
  title: string;
  timestamp: string;
}

async function runAnalysisInternal(diffOptions: DiffOptions): Promise<void> {
  const configPath = getDefaultConfigPath();
  const config = await loadConfig(configPath);

  if (!config) {
    presenter.showConfigError();
    return;
  }

  const gitStrategy: GitStrategy = createGitStrategy(diffOptions);

  let changedFiles: string[];
  try {
    changedFiles = await gitStrategy.getFiles();
  } catch (error) {
    const gitError = error as { name?: string; message?: string };
    if (gitError.name === 'GitError') {
      presenter.showGitError(gitError.message || 'Unknown Git error');
    } else {
      presenter.showReadFilesError();
    }
    logger.error('Failed to get changed files', { error, mode: diffOptions.mode });
    return;
  }

  if (changedFiles.length === 0) {
    presenter.showNoChanges(diffOptions);
    return;
  }

  presenter.showAnalyzingFiles(changedFiles, diffOptions);

  let diffContent: string;
  try {
    diffContent = await gitStrategy.getDiff();
  } catch (error) {
    presenter.showReadFilesError();
    logger.error('Failed to get diff', { error, mode: diffOptions.mode });
    return;
  }

  if (!diffContent || diffContent.trim().length === 0) {
    presenter.showNoDiffContent();
    return;
  }

  const repositoryContext = path.basename(process.cwd());
  const prompt = formatPrompt(ANALYSIS_PROMPT_V1, {
    file_paths: changedFiles,
    diff_content: diffContent,
  });

  presenter.showSendingToLLM(diffOptions, config.provider, config.analysis_model);

  const response = await analyzeChanges(config, {
    file_paths: changedFiles,
    diff_content: diffContent,
    repository_context: repositoryContext,
    analysis_prompt: prompt,
  });

  if (!response.result || response.error) {
    presenter.showAnalysisFailed(response.error);
    return;
  }

  const result = response.result;

  presenter.showAnalysisComplete();

  if (result.is_significant) {
    const summary: AnalysisSummary = {
      fileCount: changedFiles.length,
      mode: diffOptions.mode,
      isSignificant: true,
      reason: result.reason,
      confidence: result.confidence,
    };
    presenter.showSignificantResult(summary);

    const shouldGenerate = await promptForGeneration(result.reason);

    if (shouldGenerate) {
      presenter.showGeneratingADR();

      const generationPrompt = formatGenerationPrompt({
        file_paths: changedFiles,
        diff_content: diffContent,
      });

      const generationResponse = await generateADRContent(config, {
        file_paths: changedFiles,
        diff_content: diffContent,
        reason: result.reason,
        generation_prompt: generationPrompt,
      });

      if (!generationResponse.result || generationResponse.error) {
        presenter.showGenerationFailed(generationResponse.error);
        logger.error('ADR generation failed', { error: generationResponse.error });
      } else {
        const saveResult = saveADR(
          generationResponse.result.content,
          generationResponse.result.title
        );

        if (saveResult.success && saveResult.filePath) {
          presenter.showADRSuccess(saveResult.filePath);
          logger.info('ADR generation workflow completed successfully', {
            filePath: saveResult.filePath,
            title: generationResponse.result.title,
          });
        } else {
          presenter.showADRSaveError(saveResult.error);
          logger.error('Failed to save ADR', { error: saveResult.error });
        }
      }
    } else {
      presenter.showSkippingGeneration();
    }
  } else {
    const summary: AnalysisSummary = {
      fileCount: changedFiles.length,
      mode: diffOptions.mode,
      isSignificant: false,
      reason: result.reason,
      confidence: result.confidence,
    };
    presenter.showNotSignificantResult(summary);
  }

  logger.info('Analysis workflow completed successfully', {
    is_significant: result.is_significant,
    file_count: changedFiles.length,
  });
}

export async function runAnalysis(diffOptions: DiffOptions = { mode: 'all' }): Promise<void> {
  try {
    logger.info('Starting analysis workflow');
    await runAnalysisInternal(diffOptions);
  } catch (error) {
    logger.error('Unexpected error in analysis workflow', { error });
    presenter.showUnexpectedError();
  }
}
