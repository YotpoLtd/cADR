# cADR - Continuous Architectural Decision Records

[![Test](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml/badge.svg)](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/cadr-cli.svg)](https://www.npmjs.com/package/cadr-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Automatically capture and document architectural decisions as you code.

Stop losing track of important architectural decisions. cADR analyzes your code changes with LLMs and generates comprehensive ADRs automatically, keeping your documentation in sync with your code.

## ✨ Why cADR?

- **Never miss a decision**: Automatically detects architecturally significant changes
- **Stay in flow**: Works with your existing Git workflow, never blocks commits
- **AI-powered documentation**: Generates comprehensive ADRs in MADR format
- **Smart and fast**: Analyzes only what matters with configurable ignore patterns

## 🚀 Quick Start

See the **[Quick Start Guide](./docs/QUICK_START.md)** for detailed setup instructions.

## 🎯 Key Features

- 🤖 **LLM-Powered Analysis** - OpenAI and Gemini integration to detect architecturally significant changes
- 📝 **Automated ADR Generation** - Generates comprehensive Markdown ADRs following the MADR template format
- ⚡ **Git Integration** - Analyzes staged changes, uncommitted changes, or commit ranges
- 🛡️ **Fail-Open Design** - Never blocks your workflow, always exits gracefully
- 📊 **Structured Logging** - Comprehensive observability
- 🎯 **Smart Detection** - Configurable ignore patterns to focus on what matters
- 📁 **Auto-Organization** - Sequential numbering and automatic directory creation

## 📚 Documentation

### For Users

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in 5 minutes
- **[Usage Guide](./docs/USAGE.md)** - Detailed command reference and configuration
- **[ADR Generation](./docs/ADR_GENERATION.md)** - How automatic ADR creation works
- **[MADR Template](./docs/MADR_TEMPLATE.md)** - ADR format reference

### For Contributors

- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to cADR
- **[Development Setup](./DEVELOPMENT.md)** - Set up your local dev environment
- **[Testing Guide](./TESTING.md)** - Running and writing tests

## 📦 Installation

See [GITHUB_PACKAGES.md](./docs/GITHUB_PACKAGES.md) for authentication and installation details.

## 🔧 Configuration

The tool is configured via `cadr.yaml` in your project root. See the [Usage Guide](./docs/USAGE.md#configuration) for configuration options.

**Supported Providers:**
- OpenAI: `gpt-4`, `gpt-4-turbo-preview`, `gpt-4-1106-preview`
- Gemini: `gemini-1.5-pro`

## 🏗️ What Gets Generated?

When cADR detects an architecturally significant change, it generates a comprehensive ADR including:

- **Context and Problem Statement** - Why the decision was needed
- **Decision Drivers** - Key factors influencing the choice
- **Considered Options** - Alternative approaches evaluated
- **Decision Outcome** - The chosen approach and detailed rationale
- **Consequences** - Both positive and negative impacts

Generated ADRs follow the [MADR (Markdown Architectural Decision Records)](https://adr.github.io/madr/) format with sequential numbering.

📖 **[Learn More About ADR Generation →](./docs/ADR_GENERATION.md)**

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation:

1. Read the [Contributing Guide](./CONTRIBUTING.md)
2. Set up your [Development Environment](./DEVELOPMENT.md)
3. Check out the [Testing Guide](./TESTING.md)
4. Submit a Pull Request

## 🆘 Support & Community

- 📖 [Documentation](./docs) - Comprehensive guides and references
- 🐛 [Report Issues](https://github.com/YotpoLtd/cADR/issues) - Found a bug?
- 💬 [Discussions](https://github.com/YotpoLtd/cADR/discussions) - Questions and ideas
- 🔄 [Changelog](./CHANGELOG.md) - What's new in each release

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[Quick Start](./docs/QUICK_START.md)** • **[Usage Guide](./docs/USAGE.md)** • **[Contributing](./CONTRIBUTING.md)** • **[Development](./DEVELOPMENT.md)**

Made with ❤️ by the cADR team

</div>
