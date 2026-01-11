---
name: documentation-sync
description: Ensuring documentation stays in sync with code logic.
---

# Documentation Sync Skill

Documentation is a living part of the codebase.

## Procedures

### 1. Code-Level Docs
Ensure public APIs, functions, and classes have appropriate comments (e.g., JSDoc).
- Focus on *why* something is done, not just *what*.
- Document unexpected side effects.

### 2. Project-Level Docs
Update READMEs or `DEVELOPMENT.md` if the change affects setup, build, or usage.
- Update version numbers if applicable.
- Add examples for new features.

### 3. Specification Update
If the task originated from a spec in `specs/`, ensure the spec is updated to reflect the completed state or any deviations.

### 4. Cross-References
Check if the change requires updating links or references in other documents (e.g., `AGENTS.md`).
