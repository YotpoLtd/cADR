# Usage Guide

Comprehensive guide to using cADR for automated architectural decision documentation.

## Table of Contents

- [Command Overview](#command-overview)
- [Analysis Modes](#analysis-modes)
- [ADR Generation](#adr-generation)
- [Configuration](#configuration)
- [Advanced Usage](#advanced-usage)
- [CI/CD Integration](#cicd-integration)

## Command Overview

cADR provides commands for initialization, analysis, and version display. Run with `--help` for available options.

### Initialize Configuration

Creates a configuration file in your project through interactive prompts.

### Analyze Changes

Analyzes staged or uncommitted changes for architectural significance. If changes are significant, prompts for ADR generation.

## Analysis Modes

cADR supports different modes for analyzing changes:

### Analyze Staged Changes Only

Only analyzes files in the Git staging area.

### Analyze All Uncommitted Changes (Default)

Analyzes all uncommitted changes, including both staged and unstaged files.

### Analyze Between Commits (CI/CD)

Analyzes changes between two Git references. Useful for:

- Pull request validation
- CI/CD pipelines
- Release automation

You can compare branches, commits, or tags.

## ADR Generation

When cADR detects an architecturally significant change, it offers to generate an ADR automatically.

### Interactive Generation

You'll be prompted to confirm ADR generation. Accept to generate or decline to skip.

### Generated ADR Structure

ADRs follow the [MADR (Markdown Architectural Decision Records)](https://adr.github.io/madr/) format:

- **Sequential numbering**: 0001, 0002, 0003, etc.
- **Descriptive filename**: Based on the decision title
- **Auto-created directory**: Created if it doesn't exist

See [ADR_GENERATION.md](./ADR_GENERATION.md) for detailed information.

See [MADR_TEMPLATE.md](./MADR_TEMPLATE.md) for the template format.

## Configuration

The configuration file controls cADR's behavior. Created by init or edited manually.

### Configuration File Location

Place the configuration file in your project root (same directory as `.git/`).

### Configuration Options

#### `provider` (required)

LLM provider to use for analysis and ADR generation.

- **Options**: `openai`, `gemini`

#### `analysis_model` (required)

Model to use for both architectural analysis and ADR generation. Such as:

- `gpt-4` - 8K context window (default)
- `gpt-4-turbo-preview` - 128K context window (recommended for large diffs)
- `gemini-1.5-pro` - 1M+ context window

> 💡 **Tip**: Use models with larger context windows if analyzing large changesets.

#### `api_key_env` (required)

Environment variable name containing your API key.

- **OpenAI**: `OPENAI_API_KEY`
- **Gemini**: `GEMINI_API_KEY`

#### `timeout_seconds` (required)

Request timeout in seconds (1-60).

- **Default**: 15
- **Range**: 1-60 seconds

> 💡 **Tip**: Increase timeout for large diffs or slower models.

#### `ignore_patterns` (optional)

Glob patterns for files to exclude from analysis.

**Pattern syntax:**

- `*.ext` - All files with extension
- `filename` - Specific filename
- `dir/**` - Entire directory recursively
- `**/pattern` - Pattern anywhere in tree

## Advanced Usage

### Dry Run (No ADR Generation)

Analyze changes and see results without generating an ADR by declining when prompted.

### Analyzing Specific File Types

Use `ignore_patterns` to focus on specific files by excluding everything else.

### Multiple Projects

Each project maintains its own configuration and ADR directory.

### Custom ADR Directory

By default, ADRs are created in `docs/adr/`. To use a different location, move or symlink the directory as needed.

## CI/CD Integration

cADR can be integrated into continuous integration pipelines to check for architectural changes in pull requests.

### GitHub Actions

See the Usage Guide for example workflow configuration.

### GitLab CI

See the Usage Guide for example pipeline configuration.

### Pre-commit Hook

cADR can be added as a pre-commit hook for local validation.

## Troubleshooting

### Analysis Times Out

Increase timeout in configuration.

### "Too many tokens" Error

Use a model with larger context window or add more files to ignore patterns.

### API Key Not Found

Verify environment variable is set.

### No Configuration File

Run init to create configuration file.

## Best Practices

1. **Run frequently**: Analyze changes regularly to catch architectural decisions early
2. **Review generated ADRs**: Always review and refine AI-generated content
3. **Commit ADRs with code**: Keep ADRs in sync with the code changes they document
4. **Use ignore patterns**: Focus analysis on relevant files
5. **Adjust timeout**: Increase for large changesets or slower connections
6. **Choose appropriate models**: Use larger context windows for big diffs

## Next Steps

- Learn about [ADR Generation](./ADR_GENERATION.md)
- See [MADR Template Format](./MADR_TEMPLATE.md)
- Read [Contributing Guide](../CONTRIBUTING.md)

## Need Help?

- 🐛 [Report Issues](https://github.com/YotpoLtd/cADR/issues)
- 💬 [Discussions](https://github.com/YotpoLtd/cADR/discussions)
- 📖 [Main README](../README.md)

