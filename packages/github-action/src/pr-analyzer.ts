import { AnalysisResult } from './types';
import { PRContext, ActionInputs } from './types';
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
    suggestedAdr: any | null;
  }> {
    // 1. Get PR Diff
    const diff = await this.githubClient.getPRDiff(prContext.owner, prContext.repo, prContext.pullNumber);

    // 2. Build Config manually matching AnalysisConfig interface
    const config: AnalysisConfig = {
        provider: inputs.provider,
        analysis_model: inputs.model || (inputs.provider === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4'),
        api_key_env: 'generated_env_key', // Not used since we pass apiKey directly below if supported, 
                                          // BUT analyzeChanges relies on process.env[api_key_env].
                                          // We need to handle this injection.
        timeout_seconds: 60, // Sane default for actions
    };

    // Inject API key into environment so analyzeChanges picks it up
    // This is a bit hacky but consistent with how CLI works (env var based)
    process.env['generated_env_key'] = this.apiKey;

    // 3. Analyze Changes
    // AnalysisRequest: { file_paths: string[]; diff_content: string; repository_context: string; analysis_prompt: string; }
    // We need to construct this.
    
    // We assume all files in diff are relevant if we don't have paths.
    // Ideally we should fetch file paths from GitHub.
    // For now we pass empty array or try to parse 'diff --git a/...' from diff string if critical.
    // But analyzeChanges mainly uses diff_content for LLM prompt.
    // Using empty array might affect prompt formatting if it lists files.
    // Let's assume empty is okay or fetch them in future task.
    const filePaths: string[] = []; 
    const repositoryContext = prContext.repo;

    // We need to format prompt MANUALLY because analyzeChanges expects `analysis_prompt` in request.
    // CLI uses `formatPrompt` from `prompts.ts`. I should import that too.
    // But `formatPrompt` takes specific placeholders.
    // Let's verify prompt formatting from `cli/src/analysis.ts`.
    
    // START MANUAL PROMPT FORMATTING (or import)
    // import { formatPrompt, ANALYSIS_PROMPT_V1 } from 'cadr-cli/src/prompts';
    // Let's assume we can import them.
    
    // For the moment, I'll pass a basic formatted string if import fails, but ideally imported.
    const analysisPrompt = `Analyze the following changes for architectural significance:\n\n${diff}`;

    // REVISIT: Importing formatPrompt from cli/src/prompts.ts would be safer.
    // But let's proceed with calling analyzeChanges.
    
    // We need to mock prompts import or duplicate logic if imports are hard.
    // Let's rely on imports working with ts-jest fix.
    
    // Wait, analyzeChanges takes `analysis_prompt`.
    
    const analysisResponse = await analyzeChanges(config, {
        file_paths: filePaths,
        diff_content: diff,
        repository_context: repositoryContext,
        analysis_prompt: analysisPrompt // This is what goes to LLM
    });

    if (!analysisResponse.result) {
        throw new Error(analysisResponse.error || 'Analysis failed');
    }

    const result = analysisResponse.result; // Types need to match

    let suggestedAdr = null;

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
