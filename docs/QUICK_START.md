# Quick Start Guide

Get cADR up and running in 5 minutes.

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** installed ([Download](https://nodejs.org/))
- ✅ **Git 2.x+** installed ([Download](https://git-scm.com/))
- ✅ **API Key** from [OpenAI](https://platform.openai.com/api-keys) or [Google AI Studio](https://aistudio.google.com/app/apikey)

## Installation

See [GITHUB_PACKAGES.md](./GITHUB_PACKAGES.md) for complete installation and authentication instructions.

## Setup Your API Key

Set the appropriate environment variable for your chosen LLM provider. Add to your shell profile for persistence.

## Initialize Your Project

Navigate to your Git repository and run the interactive setup which will create a `cadr.yaml` configuration file.

## Your First Analysis

1. **Make changes** to your codebase
2. **Stage them** with git
3. **Run analysis** using the analyze command
4. **Review results** and optionally generate an ADR

When cADR detects an architecturally significant change, you'll be prompted to generate an ADR.

## What's Next?

- **Review Generated ADRs**: Check the ADR directory for any generated documents
- **Commit ADRs with Code**: Include ADR files in your commits
- **Customize Configuration**: Edit your configuration file to adjust settings
- **Learn More**:
  - [Detailed Usage Guide](./USAGE.md)
  - [ADR Generation Explained](./ADR_GENERATION.md)
  - [Configuration Reference](./USAGE.md#configuration)

## Common Issues

### Command not found

Ensure the global npm bin directory is in your PATH.

### Invalid API Key

Verify your API key environment variable is correctly set.

### No staged files found

Stage your changes with git before running analysis.

## Need Help?

- 📖 [Full Documentation](./USAGE.md)
- 🐛 [Report Issues](https://github.com/YotpoLtd/cADR/issues)
- 💬 [Ask Questions](https://github.com/YotpoLtd/cADR/discussions)

