import { AnalysisResult, PRContext, ActionInputs, SuggestedADR } from './types';
import { analyzeChanges, generateADRContent } from 'cadr-cli/src/llm';
import { AnalysisConfig } from 'cadr-cli/src/config';
import { GitHubClient } from './github-client';

export class PRAnalyzer {
  constructor(
    private githubClient: GitHubClient,
    private apiKey: string
  ) {}

  async analyze(prContext: PRContext, inputs: ActionInputs): Promise<{
    analysisResult: AnalysisResult;
    suggestedAdr: SuggestedADR | null;
  }> {
    // 1. Get PR Diff
    const diff = await this.githubClient.getPRDiff(prContext.owner, prContext.repo, prContext.pullNumber);

    // 2. Build Config manually matching AnalysisConfig interface
    const config: AnalysisConfig = {
        provider: inputs.provider,
        analysis_model: inputs.model || (inputs.provider === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4'),
        api_key_env: 'generated_env_key',
        timeout_seconds: 60,
    };

    process.env['generated_env_key'] = this.apiKey;
    try {
      return await this._runAnalysis(prContext, inputs, config, diff);
    } finally {
      delete process.env['generated_env_key'];
    }
  }

  private async _runAnalysis(
    prContext: PRContext,
    inputs: ActionInputs,
    config: AnalysisConfig,
    diff: string
  ): Promise<{ analysisResult: AnalysisResult; suggestedAdr: SuggestedADR | null }> {
    const filePaths: string[] = [];
    const repositoryContext = prContext.repo;
    const analysisPrompt = `Analyze the following changes for architectural significance:\n\n${diff}`;

    const analysisResponse = await analyzeChanges(config, {
        file_paths: filePaths,
        diff_content: diff,
        repository_context: repositoryContext,
        analysis_prompt: analysisPrompt // This is what goes to LLM
    });

    if (!analysisResponse.result) {
        throw new Error(analysisResponse.error || 'Analysis failed');
    }

    const result = analysisResponse.result;

    let suggestedAdr: SuggestedADR | null = null;

    if (result.is_significant) {
      // 5. Generate ADR
      
      const existingAdrNumbers = await this.githubClient.getExistingADRs(
        prContext.owner, 
        prContext.repo, 
        prContext.headSha, 
        inputs.adrDirectory
      );
      
      const nextNumber = existingAdrNumbers.length > 0 ? Math.max(...existingAdrNumbers) + 1 : 1;
      
      const generationPrompt = `Generate an ADR for the changes:\n\n${diff}\n\nReason: ${result.reason}`;

      const generationResponse = await generateADRContent(config, {
          file_paths: filePaths,
          diff_content: diff,
          reason: result.reason,
          generation_prompt: generationPrompt
      });

      if (generationResponse.result) {
        
        const title = generationResponse.result.title;
        // Clean title for filename needs adr.ts titleToSlug logic
        const filenameSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filename = `${String(nextNumber).padStart(4, '0')}-${filenameSlug}.md`;
        const path = `${inputs.adrDirectory}/${filename}`;

        suggestedAdr = {
            number: nextNumber,
            title,
            filename,
            path,
            content: generationResponse.result.content,
            commitMessage: `docs: record architectural decision: ${title}`
        };
      }
    }

    return { analysisResult: result, suggestedAdr };
  }
}
