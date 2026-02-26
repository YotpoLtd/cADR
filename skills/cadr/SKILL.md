---
name: cadr
description: Automatically capture and document architectural decisions in the current workspace
---
# cADR
Continuous Architectural Decision Records.

## When to Use
Use this skill after you have completed major architectural, structural, or design-related tasks for the user. These tasks might involve adding new components, changing data flow, defining new interfaces, introducing new dependencies, or deprecating systems, among other significant technical changes.
Do NOT use this for minor bug fixes or small refactoring. 

## Steps
1. **Preparation**: Ensure all relevant architectural changes have been completed in the current workspace. cADR defaults to analyzing all uncommitted changes (both staged and unstaged files).
2. **Configuration**: If `cadr.yaml` is not present at the root of the project, you must first initialize configuration by running `cadr init` (or `npx cadr-cli init`). Ensure it includes appropriate `ignore_patterns` to skip irrelevant files (like `node_modules` or `.test.ts`).
3. **Execution**: Once the environment is ready or `cadr.yaml` is present, execute the analysis:
   ```bash
   npx cadr-cli analyze
   ```
   *(Note: By default `cadr analyze` acts interactively. As an agent, run this in an environment where it does not wait for a prompt, or ensure you pipe automated approvals if specifically required, though cADR standard usage might automatically proceed to analyze)*
4. **Outcome Processing**: The CLI will use LLMs to detect architecturally significant changes and generate a formal Markdown Architectural Decision Record (MADR) in the project (typically into `docs/adr/`).
5. **Review**: Check the resulting `.md` file to ensure the extracted problem statement, decision drivers, options, and consequences accurately reflect what you built for the user. Refine the Markdown document directly if any context or nuance is missing.

## Best Practices for Agents
- **Isolate Changes**: It's best practice to run cADR when the workspace only contains the specific architectural change you want to record, to prevent noise from polluting the LLM analysis.
- **Handling Large Diffs**: If the changes are massive, ensure `cadr.yaml` has `timeout_seconds` increased (e.g. 30 or 60), to avoid LLM timeout issues.
- **Don't Run on EVERY commit**: Only rely on this skill for structural shifts (e.g. creating new services, changing databases, introducing new patterns) rather than standard isolated feature tickets.
