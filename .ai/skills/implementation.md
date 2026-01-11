---
name: robust-implementation
description: Guidelines for implementing changes safely and correctly.
---

# Robust Implementation Skill

Implementation is more than just writing code; it's about ensuring it works within the ecosystem.

## Procedures

### 1. Atomic Changes
Make small, logical changes rather than one giant update.
- Use `replace_file_content` for surgical edits.
- Commits/steps should be discrete and testable.

### 2. The Verification Loop
Never assume code works just because it looks correct.
- **Build**: Mandatory for TypeScript/Compiled projects.
- **Lint**: Ensure no style regressions.
- **Test**: Run unit tests for the modified component.

### 3. Tool Standardization
Use standardized MCP operations defined in `.ai/mcp.json` to interact with the environment. This ensures consistency across different agent runs.

### 4. Safety First
Before deleting code, verify it's truly unused. If in doubt, deprecate first.
