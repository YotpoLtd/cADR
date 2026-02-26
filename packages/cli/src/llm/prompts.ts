import * as readline from 'readline';

export const ANALYSIS_PROMPT_V1 = `
You are an expert principal engineer and software architect acting as a meticulous code reviewer. Your sole task is to determine if the provided git diff represents an architecturally significant change that warrants an Architectural Decision Record (ADR).

Given the following staged changes:
{file_paths}

Diff content:
{diff_content}

A change is considered architecturally significant if it:
- Introduces a new external dependency, library, or service.
- Adds, removes, or modifies infrastructure components (e.g., databases, caches, queues, Docker services).
- Changes a public API contract, a data schema, or a critical data model.
- Alters authentication, authorization, or other core security patterns.
- Modifies cross-cutting concerns like logging, observability, or CI/CD pipelines.

Respond ONLY with a single, minified JSON object with no preamble, no markdown, and no additional text. The JSON object must adhere to the following schema:
{"is_significant": boolean, "reason": string}

The "reason" should be a concise, one-sentence explanation for your decision, suitable for showing to a developer. If the change is not significant, the reason should be an empty string.
`;

export const GENERATION_PROMPT_V1 = `
You are an expert software architect. Your task is to write a comprehensive Architectural Decision Record (ADR) following the MADR (Markdown Architectural Decision Records) template.

Given the following code changes:
{file_paths}

Diff content:
{diff_content}

Generate an ADR that follows this EXACT structure:

# [Short title of solved problem and solution]

* Status: [proposed | rejected | accepted | deprecated | superseded by [ADR-0005](0005-example.md)]
* Date: {current_date}

## Context and Problem Statement

[Describe the context and problem statement in 2-3 sentences. What is the issue that we're addressing?]

## Decision Drivers

* [decision driver 1, e.g., a force, constraint, requirement]
* [decision driver 2]
* [etc.]

## Considered Options

* [option 1]
* [option 2]
* [option 3]

## Decision Outcome

Chosen option: "[option 1]", because [justification. e.g., only option which meets KO criterion decision driver | which resolves force 1 | etc.].

### Consequences

* Good, because [positive consequence 1]
* Good, because [positive consequence 2]
* Bad, because [negative consequence 1]
* Bad, because [negative consequence 2]

## More Information

[Any additional context, links to related discussions, or implementation notes]

IMPORTANT INSTRUCTIONS:
1. Use the EXACT markdown structure shown above
2. Set Status to "accepted" (since this change is being committed)
3. The title should be concise, action-oriented, and describe the decision made
4. Keep Context and Problem Statement brief but clear (2-4 sentences)
5. List at least 2-3 decision drivers that influenced this choice
6. Include at least 2 considered options (including the chosen one)
7. Be specific about consequences - list both benefits and drawbacks
8. In "More Information", mention any technical details, related files, or future considerations

Respond ONLY with the markdown content of the ADR. Do not include any preamble, explanation, or markdown code fences. Start directly with the # title.
`;

export function formatPrompt(
  template: string,
  data: { file_paths: string[]; diff_content: string }
): string {
  const formattedFilePaths = data.file_paths.length > 0 ? data.file_paths.join('\n') : 'No files';

  return template
    .replace('{file_paths}', formattedFilePaths)
    .replace('{diff_content}', data.diff_content);
}

export function formatGenerationPrompt(data: {
  file_paths: string[];
  diff_content: string;
}): string {
  const formattedFilePaths = data.file_paths.length > 0 ? data.file_paths.join('\n') : 'No files';

  const currentDate = new Date().toISOString().split('T')[0];

  return GENERATION_PROMPT_V1.replace('{file_paths}', formattedFilePaths)
    .replace('{diff_content}', data.diff_content)
    .replace('{current_date}', currentDate);
}

export async function promptForGeneration(reason: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    /* eslint-disable-next-line no-console */
    console.log(`\n💭 ${reason}\n`);

    rl.question(
      '📝 Would you like to generate an ADR for this change? (Press ENTER or type "yes" to confirm, "no" to skip): ',
      (answer) => {
        rl.close();

        const normalized = answer.trim().toLowerCase();

        const confirmed = normalized === '' || normalized === 'y' || normalized === 'yes';

        resolve(confirmed);
      }
    );
  });
}
