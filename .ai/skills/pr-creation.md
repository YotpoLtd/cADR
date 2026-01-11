---
name: pr-creation
description: Standardized steps for creating a Pull Request.
---

# PR Creation Skill

This skill defines the standard workflow for creating a Pull Request in this repository.

## Prerequisites
- All code changes are complete.
- The **Robust Loop** has been executed successfully (`yarn build`, `yarn lint`, `yarn test`).

## Procedure

### 1. Branch Creation
Create a new branch following the naming convention:
```bash
git checkout -b <type>/<short-description>
```
- `<type>`: One of `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- `<short-description>`: A short, kebab-case description.

**Example**: `git checkout -b feat/ai-context-layer`

### 2. Stage and Commit
Stage the relevant files and commit using [Conventional Commits](https://www.conventionalcommits.org/):
```bash
git add <files>
git commit -m "<type>: <description>"
```

**Example**: `git commit -m "feat: implement vendor-neutral AI context layer"`

### 3. Push Branch
Push the branch to the remote:
```bash
git push -u origin <branch-name>
```

### 4. Create Pull Request
Use the GitHub CLI to create a PR:
```bash
gh pr create --title "<type>: <description>" --body-file <path-to-body-file>
```

Alternatively, create the body inline:
```bash
gh pr create --title "<type>: <description>" --body "## Summary
<summary>

## Type of Change
- [x] \`<type>\`

## Changes Made
- <change 1>
- <change 2>

## Verification
- [x] \`yarn build\` passes
- [x] \`yarn lint\` passes
- [x] \`yarn test\` passes
"
```

### 5. Verify the PR
After creation, open the PR URL in the browser and verify:
- Title and description are correct.
- CI checks are running.

## Template Reference
The PR body SHOULD follow the template defined in [`.github/PULL_REQUEST_TEMPLATE.md`](/.github/PULL_REQUEST_TEMPLATE.md).

## Integration with MCP
This skill uses the following operations from `.ai/mcp.json`:
- `build`: `yarn build`
- `lint`: `yarn lint`
- `test`: `yarn test`
