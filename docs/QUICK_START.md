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

### For OpenAI

```bash
export OPENAI_API_KEY="sk-your-api-key-here"
```

### For Gemini

```bash
export GEMINI_API_KEY="your-api-key-here"
```

To make this permanent, add the export command to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.).

## Initialize Your Project

Navigate to your Git repository and run the interactive setup:

```bash
cd /path/to/your/repo
cadr init
```

**Example Output:**

```text
🎉 Welcome to cADR - Continuous Architectural Decision Records!

Let's set up your configuration.

? Select your LLM provider: OpenAI
? Enter the model name (e.g., gpt-4): gpt-4
? Enter the environment variable name for your API key: OPENAI_API_KEY
? Enter timeout in seconds (1-60): 15
? Add ignore patterns? (Use glob patterns like *.test.ts, node_modules/**): node_modules/**, *.test.ts, dist/**

✅ Configuration saved to cadr.yaml

📋 Configuration Summary:
   Provider: openai
   Model: gpt-4
   API Key Env: OPENAI_API_KEY
   Timeout: 15s
   Ignore Patterns: node_modules/**, *.test.ts, dist/**

🎉 Ready to analyze!
Next steps:
   1. Stage your changes: git add <files>
   2. Run analysis: cadr analyze
```

This creates a `cadr.yaml` file in your project root:

```yaml
provider: openai
analysis_model: gpt-4
api_key_env: OPENAI_API_KEY
timeout_seconds: 15
ignore_patterns:
  - node_modules/**
  - "*.test.ts"
  - dist/**
```

## Your First Analysis

### Step 1: Make Some Changes

Make changes to your codebase that might be architecturally significant (e.g., adding a new dependency, changing a data model, or modifying infrastructure).

### Step 2: Run Analysis

You can analyze changes in different ways:

#### Analyze All Uncommitted Changes (Default)

```bash
cadr analyze
```

**Example Output:**

```text
📝 Analyzing 3 uncommitted files:
  • src/database/schema.ts
  • src/config/redis.ts
  • package.json

🔍 Analyzing uncommitted changes for architectural significance...

🤖 Sending to openai gpt-4...

✅ Analysis Complete

📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: This change introduces Redis as a new caching layer dependency, modifies the database schema to include cache keys, and updates infrastructure configuration - all of which represent significant architectural decisions.

🎯 Confidence: 92%


💭 This change introduces Redis as a new caching layer dependency, modifies the database schema to include cache keys, and updates infrastructure configuration - all of which represent significant architectural decisions.

📝 Would you like to generate an ADR for this change? (Press ENTER or type "yes" to confirm, "no" to skip): 
```

If you press ENTER or type "yes":

```text
🧠 Generating ADR draft...

✅ Success! Draft ADR created

📄 File: docs/adr/0001-add-redis-caching-layer.md

💡 Next steps:
   1. Review and refine the generated ADR
   2. Commit it alongside your code changes
```

#### Analyze Only Staged Changes

```bash
git add src/database/schema.ts
cadr analyze --staged
```

**Example Output:**

```text
📝 Analyzing 1 staged file:
  • src/database/schema.ts

🔍 Analyzing staged changes for architectural significance...

🤖 Sending to openai gpt-4...

✅ Analysis Complete

📊 Result: ℹ️  NOT ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: This change only adds a new field to an internal data structure without affecting external interfaces, dependencies, or architectural patterns.

🎯 Confidence: 88%

✅ No ADR needed for these changes.
```

#### Analyze Changes in CI/CD (Between Commits)

```bash
# Compare current HEAD to main branch
cadr analyze --base origin/main

# Compare specific branches
cadr analyze --base origin/main --head feature-branch
```

**Example Output:**

```text
📝 Analyzing 5 files changed between origin/main and HEAD:
  • src/auth/middleware.ts
  • src/auth/jwt.ts
  • package.json
  • docker-compose.yml
  • src/config/security.ts

🔍 Analyzing changes for architectural significance...

🤖 Sending to openai gpt-4...

✅ Analysis Complete

📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: This change modifies the authentication mechanism by switching from session-based auth to JWT tokens, introduces new security middleware, and adds authentication infrastructure components.

🎯 Confidence: 95%


💭 This change modifies the authentication mechanism by switching from session-based auth to JWT tokens, introduces new security middleware, and adds authentication infrastructure components.

📝 Would you like to generate an ADR for this change? (Press ENTER or type "yes" to confirm, "no" to skip): yes

🧠 Generating ADR draft...

✅ Success! Draft ADR created

📄 File: docs/adr/0002-migrate-to-jwt-authentication.md

💡 Next steps:
   1. Review and refine the generated ADR
   2. Commit it alongside your code changes
```

### Step 3: Review the Generated ADR

Open the generated ADR file (e.g., `docs/adr/0001-add-redis-caching-layer.md`) to review and refine the content:

```markdown
# Add Redis Caching Layer

* Status: accepted
* Date: 2025-10-22

## Context and Problem Statement

The application requires a caching solution to improve response times and reduce database load for frequently accessed data. The current architecture lacks a dedicated caching layer.

## Decision Drivers

* Need to reduce database query load
* Requirement for sub-millisecond data access times
* Support for distributed caching across multiple instances
* Easy integration with existing Node.js stack

## Considered Options

* Redis (in-memory data store)
* Memcached (distributed memory caching)
* In-process memory caching (node-cache)

## Decision Outcome

Chosen option: "Redis (in-memory data store)", because it provides the best combination of performance, features (pub/sub, data structures), and community support for our use case.

### Consequences

* Good, because Redis provides sub-millisecond latency for cache operations
* Good, because Redis supports advanced data structures beyond simple key-value pairs
* Good, because extensive Node.js client library support and documentation
* Bad, because introduces another infrastructure dependency to manage
* Bad, because requires additional monitoring and operational overhead

## More Information

Implementation includes Redis configuration in docker-compose.yml and schema updates to track cache keys. Redis client library added via package.json with connection pooling enabled.
```

### Step 4: Commit Your Changes

```bash
git add docs/adr/0001-add-redis-caching-layer.md
git add src/ package.json
git commit -m "Add Redis caching layer with ADR"
```

## Additional Commands

### Show Help

```bash
cadr --help
```

**Output:**

```text
cADR - Continuous Architectural Decision Records
Version: 0.0.1

USAGE
  cadr [command] [options]

COMMANDS
  init              Create a cadr.yaml configuration file
  analyze           Analyze code changes and generate ADRs (default)
  help              Show this help message

ANALYZE OPTIONS
  --all             Analyze all uncommitted changes (staged + unstaged) [default]
  --staged          Analyze only staged changes
  --base <ref>      Base git reference for CI/CD (e.g., origin/main)
  --head <ref>      Head git reference for CI/CD (default: HEAD)

GLOBAL OPTIONS
  -h, --help        Show help message
  -v, --version     Show version information
  --verbose         Enable verbose logging

EXAMPLES
  # Local development
  cadr                                # Analyze all uncommitted files (default)
  cadr analyze                        # Analyze all uncommitted files
  cadr analyze --staged               # Analyze only staged files
  cadr analyze --all                  # Analyze all uncommitted files (explicit)
  
  # CI/CD (Pull Requests)
  cadr analyze --base origin/main     # Compare current HEAD to main
  cadr analyze --base origin/main --head feature-branch
  cadr analyze --base HEAD~1          # Compare to previous commit
  
  # Other commands
  cadr init                           # Initialize configuration
  cadr --verbose analyze              # Analyze with debug logs

LEARN MORE
  GitHub: https://github.com/YotpoLtd/cADR
  Docs:   https://github.com/YotpoLtd/cADR#readme
```

### Check Version

```bash
cadr --version
```

**Output:**

```text
cADR version 0.0.1 (core: 0.0.1)
```

### Verbose Logging

Enable detailed logging for debugging:

```bash
cadr --verbose analyze
```

This shows additional debug information during the analysis process.

## What's Next?

- **Review Generated ADRs**: Check the ADR directory for any generated documents
- **Commit ADRs with Code**: Include ADR files in your commits
- **Customize Configuration**: Edit your configuration file to adjust settings
- **Learn More**:
  - [Detailed Usage Guide](./USAGE.md)
  - [ADR Generation Explained](./ADR_GENERATION.md)
  - [Configuration Reference](./USAGE.md#configuration)

## Need Help?

- 📖 [Full Documentation](./USAGE.md)
- 🐛 [Report Issues](https://github.com/YotpoLtd/cADR/issues)
- 💬 [Ask Questions](https://github.com/YotpoLtd/cADR/discussions)
