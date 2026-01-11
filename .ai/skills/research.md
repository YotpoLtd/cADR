---
name: codebase-research
description: Strategies for deep exploration and context gathering.
---

# Codebase Research Skill

Effective research is the key to preventing regressions and understanding constraints.

## Procedures

### 1. Initial Scan
Identify the core files involved in the task.
- Use `find_by_name` to locate files.
- Use `grep_search` to find usages of key functions or classes.

### 2. Dependency Mapping
Understand how the target files interact with the rest of the system.
- Trace imports and exports.
- Look for configuration files (e.g., `package.json`, `cadr.yaml`) that might be affected.

### 3. Pattern Recognition
Identify the "standard way" things are done in this repo.
- Compare similar features.
- Review recent PRs or commits for context.

### 4. Edge Case Discovery
Look for potential pitfalls.
- Check error handling blocks.
- Look for "TODO" or "FIXME" comments in related areas.
