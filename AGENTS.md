# Agent Orchestration Guide

This repository uses a structured AI context layer to ensure high-quality, consistent contributions from AI agents.

## Core Philosophy: RPI Pattern

We adhere to the **Research-Plan-Implement (RPI)** pattern. No code implementation should start without a research phase and an approved plan.

- **Research**: Understand the context.
- **Plan**: Define the solution.
- **Implement**: Execute with verification.

## Architecture

The AI context layer is organized as follows:

- **[.ai/SOP.md](.ai/SOP.md)**: The "Constitution" of the repository. Defines mandatory behaviors.
- **[.ai/agents/](.ai/agents/)**: Defines specific roles and tool constraints.
    - [Researcher](.ai/agents/researcher.md)
    - [Architect](.ai/agents/architect.md)
    - [Developer](.ai/agents/developer.md)
    - [Reviewer](.ai/agents/reviewer.md)
- **[.ai/skills/](.ai/skills/)**: Modular "how-to" guides for common operations.
    - [Codebase Research](.ai/skills/research.md)
    - [Robust Implementation](.ai/skills/implementation.md)
    - [Documentation Sync](.ai/skills/documentation.md)
    - [PR Creation](.ai/skills/pr-creation.md)
- **[.ai/rules/](.ai/rules/)**: Global rules that apply to all tasks.
    - [Robust Loop](.ai/rules/robust-loop.md)

## Standard Operations (MCP)

To ensure consistency, agents must use the following standard commands (defined in [.ai/mcp.json](.ai/mcp.json)):

- `yarn build`: Compile the project.
- `yarn lint`: Check for style and logic errors.
- `yarn test`: Run the test suite.

## Integration with Specify

We leverage the `specify` framework for ADR-driven development. New features should be defined in `specs/` before implementation.

---

*This document is maintained by the AI context layer. Any changes to the AI workflow should be reflected here.*
