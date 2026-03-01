# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the cADR project.

Yes, there is some irony here: cADR is a tool that automatically generates ADRs from
code changes, yet we maintain our own hand-written ADRs. We believe that foundational
architectural decisions deserve deliberate, human-authored documentation -- the kind of
decisions that predate the code itself and cannot be inferred from a diff.

## Format

We use the [MADR](https://adr.github.io/madr/) (Markdown Architectural Decision Records)
format. See [docs/MADR_TEMPLATE.md](../MADR_TEMPLATE.md) for the full template reference.

## Index

- [0001 - Use MADR Format](0001-use-madr-format.md)
- [0002 - Monorepo with Yarn Workspaces](0002-monorepo-with-yarn-workspaces.md)
- [0003 - Fail-Open Error Strategy](0003-fail-open-error-strategy.md)
- [0004 - Provider-Agnostic LLM Abstraction](0004-provider-agnostic-llm-abstraction.md)

## Adding a New ADR

1. Copy the MADR template structure.
2. Use the next sequential number (e.g., `0005-your-title.md`).
3. Fill in all sections and update this index.
