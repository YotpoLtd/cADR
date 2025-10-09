# cADR - Continuous Architectural Decision Records

[![Test](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml/badge.svg)](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml)
[![npm version](https://badge.fury.io/js/cadr-cli.svg)](https://www.npmjs.com/package/cadr-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically capture and document architectural decisions as you code.

## Features

- 🤖 **LLM-Powered Analysis** - OpenAI and Gemini integration to detect architecturally significant changes
- 📝 **Smart Detection** - Analyzes git diffs to identify architectural decisions
- ⚡ **Git Integration** - Works with your existing git workflow
- 🔧 **Easy Setup** - Interactive configuration with `cadr init`
- 🛡️ **Fail-Open** - Never blocks your workflow, always exits gracefully
- 📊 **Structured Logging** - Comprehensive observability with pino

## Installation

### Via npx (no install required)

```bash
# Using GitHub Packages
npx @yotpoltd/cadr-cli@latest --registry=https://npm.pkg.github.com
```

### Global installation

```bash
# Using GitHub Packages (recommended)
npm install -g @yotpoltd/cadr-cli --registry=https://npm.pkg.github.com

# Or configure npm to use GitHub Packages for @yotpoltd scope
echo "@yotpoltd:registry=https://npm.pkg.github.com" >> ~/.npmrc
npm install -g @yotpoltd/cadr-cli
```

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed
- **Git 2.x+** installed
- **OpenAI API key** (get one from [OpenAI API keys](https://platform.openai.com/api-keys)) or **Google AI Studio API key** (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Step 1: Install cADR

Install globally via npm using GitHub Packages:

```bash
npm install -g @yotpoltd/cadr-cli --registry=https://npm.pkg.github.com
```

Or configure npm once to always use GitHub Packages for the `@yotpoltd` scope:

```bash
echo "@yotpoltd:registry=https://npm.pkg.github.com" >> ~/.npmrc
npm install -g @yotpoltd/cadr-cli
```

### Step 2: Set Your API Key

Export your API key as an environment variable:

```bash
# OpenAI
export OPENAI_API_KEY="sk-your-actual-api-key-here"

# or Google Gemini
export GEMINI_API_KEY="your-google-api-key-here"
```

💡 **Tip**: Add this to your `~/.bashrc`, `~/.zshrc`, or equivalent to persist across sessions.

### Step 3: Initialize Configuration

Navigate to your Git repository and run:

```bash
cd /path/to/your/project
cadr init
```

This will interactively prompt you for:

- **Provider**: `openai` (default) or `gemini`
- **Model**: e.g., `gpt-4` (OpenAI) or `gemini-1.5-pro` (Gemini)
- **API Key Environment Variable**: `OPENAI_API_KEY` (OpenAI) or `GEMINI_API_KEY` (Gemini)
- **Timeout**: `15` seconds (default)
- **Ignore Patterns**: Files to exclude from analysis (e.g., `*.md`, `package-lock.json`)

This creates a `cadr.yaml` file in your project root.

### Step 4: Make and Stage Changes

Make some code changes and stage them with git:

```bash
# Example: Add a new authentication feature
git add src/auth/login.ts src/auth/session.ts
```

### Step 5: Analyze for Architectural Significance

Run the analysis:

```bash
cadr --analyze
```

**Example output for significant changes:**

```text
📝 Analyzing 2 staged files:
  • src/auth/login.ts
  • src/auth/session.ts

🔍 Analyzing staged changes for architectural significance...

🤖 Sending to openai gpt-4...

✅ Analysis Complete

📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: Introduces new authentication system with JWT tokens, 
   affecting user session management and security architecture. This 
   represents a fundamental change to how users authenticate.

🎯 Recommendation: Consider creating an ADR to document
   this architectural decision and its implications.
```

**Example output for non-significant changes:**

```text
📝 Analyzing 2 staged files:
  • README.md
  • package.json

🔍 Analyzing staged changes for architectural significance...

🤖 Sending to openai gpt-4...

✅ Analysis Complete

📊 Result: ℹ️  NOT ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: These changes are documentation updates and dependency 
   version bumps. They don't affect the system architecture, data 
   flow, or core business logic.

✅ No ADR needed for these changes.
```

### What's Next?

- **Continue your workflow**: cADR never blocks your commits - it only provides insights
- **Review the analysis**: Consider the LLM's reasoning for your architectural decisions
- **Document significant changes**: When flagged as significant, create an ADR documenting the decision
- **Customize configuration**: Edit `cadr.yaml` to adjust the model, timeout, or ignore patterns

## Usage

### Initialize Configuration

```bash
cadr init
```

Creates a `cadr.yaml` file with your LLM configuration.

### Analyze Staged Changes

```bash
# Stage your changes
git add src/auth.ts src/user.ts

# Run analysis
cadr --analyze
```

The LLM analyzes your changes and determines if they are architecturally significant.

## Configuration

The `cadr.yaml` file configures the LLM analysis:

```yaml
# OpenAI example
provider: openai
analysis_model: gpt-4              # or gpt-4-turbo-preview for 128k context
api_key_env: OPENAI_API_KEY
timeout_seconds: 15
ignore_patterns:
  - "*.md"
  - "package-lock.json"
  - "yarn.lock"

# Gemini example
# provider: gemini
# analysis_model: gemini-1.5-pro
# api_key_env: GEMINI_API_KEY
# timeout_seconds: 15
# ignore_patterns:
#   - "*.md"
#   - "package-lock.json"
#   - "yarn.lock"
```

### Configuration Options

- **`provider`**: LLM provider (`openai` or `gemini`)
- **`analysis_model`**: Model to use
  - `gpt-4`: 8k context window (default)
  - `gpt-4-turbo-preview`: 128k context window (recommended for large diffs)
  - `gpt-4-1106-preview`: 128k context window
  - `gemini-1.5-pro`: 1.5 Pro model (Gemini)
- **`api_key_env`**: Environment variable containing your API key
- **`timeout_seconds`**: Request timeout (1-60 seconds)
- **`ignore_patterns`**: Files to exclude from analysis (glob patterns)

## Development

### Development Prerequisites

- Node.js 20+
- Yarn 1.22+ (package manager)
- Git 2.x+ (for Git integration features)

### Setup

```bash
# Clone the repository
git clone https://github.com/YotpoLtd/cADR.git
cd cADR

# Install dependencies
yarn install

# Build packages
yarn build

# Run tests
yarn test
```

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, commit conventions, and release process.

### Running Tests

```bash
# Run all tests (unit + integration)
npm test

# Run tests with coverage report
npm test -- --coverage

# Run only integration tests
npm test -- --testPathPattern="integration"

# Run only unit tests
npm test -- --testPathPattern="packages"

# Run specific test file
npm test -- path/to/test.test.ts

# Watch mode for development
npm test -- --watch
```

#### Coverage Reports

Coverage reports are automatically generated when running `npm test -- --coverage`:

- **HTML Report**: Open `coverage/lcov-report/index.html` in a browser for detailed, file-by-file coverage
- **Terminal Summary**: Shows overall percentages after test run
- **JSON Summary**: `coverage/coverage-summary.json` contains machine-readable data

Coverage includes **both unit and integration tests** - integration tests often provide the majority of meaningful coverage since they test real code paths.

**Viewing Coverage by Test Type:**
```bash
# See what coverage integration tests provide
npm test -- --coverage --testPathPattern="integration"

# See what coverage unit tests provide  
npm test -- --coverage --testPathPattern="packages"

# Compare the two
chmod +x scripts/coverage-comparison.sh
./scripts/coverage-comparison.sh
```

Coverage artifacts are also uploaded to GitHub Actions (30-day retention).

### GitHub Packages

This project uses GitHub Packages for distribution. See [docs/GITHUB_PACKAGES.md](./docs/GITHUB_PACKAGES.md) for detailed configuration instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
