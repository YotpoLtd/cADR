# Quickstart: LLM-Powered Analysis

**Feature**: LLM-Powered Analysis  
**Date**: 2025-10-08  
**Phase**: 1 - Design & Contracts

## Prerequisites

- Node.js 20+ installed
- Git repository with staged changes
- OpenAI API key (get from https://platform.openai.com/api-keys)

## Setup

### 1. Install cADR CLI

```bash
# Using GitHub Packages (recommended)
npm install -g @yotpoltd/cadr-cli --registry=https://npm.pkg.github.com

# Or configure npm to use GitHub Packages for @yotpoltd scope
echo "@yotpoltd:registry=https://npm.pkg.github.com" >> ~/.npmrc
npm install -g @yotpoltd/cadr-cli
```

### 2. Set up OpenAI API Key

```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Initialize Configuration

```bash
cadr init
```

**Interactive prompts**:
- Provider: `openai`
- Model: `gpt-4` (or `gpt-3.5-turbo` for faster/cheaper)
- API Key Environment Variable: `OPENAI_API_KEY`
- Timeout (seconds): `15`
- Ignore patterns: `*.md,package-lock.json` (optional)

This creates `cadr.yaml`:
```yaml
provider: openai
analysis_model: gpt-4
api_key_env: OPENAI_API_KEY
timeout_seconds: 15
ignore_patterns:
  - "*.md"
  - "package-lock.json"
```

## Usage

### Analyze Staged Changes

```bash
# Stage some changes
git add src/components/UserAuth.tsx
git add src/services/auth.ts

# Analyze for architectural significance
cadr --analyze
```

**Expected output**:
```
🔍 Analyzing staged changes for architectural significance...

📁 Files: src/components/UserAuth.tsx, src/services/auth.ts
🤖 Sending to OpenAI GPT-4...

✅ Analysis Complete
📊 Result: ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: The changes introduce a new authentication system with JWT tokens, 
   affecting user session management and security architecture. This represents 
   a fundamental change to how users authenticate and maintain sessions.

🎯 Recommendation: Consider creating an ADR to document the authentication 
   architecture decision and its implications.
```

### Non-Significant Changes

```bash
# Stage minor changes
git add README.md
git add package.json

cadr --analyze
```

**Expected output**:
```
🔍 Analyzing staged changes for architectural significance...

📁 Files: README.md, package.json
🤖 Sending to OpenAI GPT-4...

✅ Analysis Complete
📊 Result: NOT ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: These changes are documentation updates and dependency version 
   bumps. They don't affect the system architecture, data flow, or core 
   business logic.

✅ No ADR needed for these changes.
```

## Error Scenarios

### Missing API Key

```bash
unset OPENAI_API_KEY
cadr --analyze
```

**Expected output**:
```
❌ Configuration Error: OPENAI_API_KEY environment variable not found
💡 Please set your OpenAI API key:
   export OPENAI_API_KEY="your-api-key-here"
   
   Get your API key from: https://platform.openai.com/api-keys
```

### API Rate Limit

```bash
cadr --analyze
```

**Expected output**:
```
⚠️  API Rate Limit: OpenAI API rate limit exceeded
💡 Please wait a few minutes before trying again.
   Consider upgrading your OpenAI plan for higher rate limits.
```

### No Staged Changes

```bash
# No staged changes
cadr --analyze
```

**Expected output**:
```
ℹ️  No staged changes to analyze
💡 Stage some files first:
   git add <files>
   cadr --analyze
```

## Configuration Management

### Update Configuration

Edit `cadr.yaml` directly:
```yaml
provider: openai
analysis_model: gpt-3.5-turbo  # Switch to faster model
api_key_env: OPENAI_API_KEY
timeout_seconds: 30  # Increase timeout
ignore_patterns:
  - "*.md"
  - "package-lock.json"
  - "*.test.ts"  # Ignore test files
```

### Validate Configuration

```bash
cadr --validate-config
```

**Expected output**:
```
✅ Configuration valid
📋 Provider: openai
🤖 Model: gpt-3.5-turbo
⏱️  Timeout: 30s
🚫 Ignore patterns: *.md, package-lock.json, *.test.ts
```

## Integration Examples

### Git Hook Integration

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Run cADR analysis before commit
cadr --analyze
```

### CI/CD Integration

```yaml
# .github/workflows/analysis.yml
name: Architecture Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install cADR
        run: npm install -g @yotpoltd/cadr-cli
      - name: Analyze changes
        run: cadr --analyze
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Troubleshooting

### Common Issues

1. **"Command not found: cadr"**
   - Ensure cADR is installed globally: `npm list -g @yotpoltd/cadr-cli`
   - Check PATH includes npm global bin directory

2. **"Configuration file not found"**
   - Run `cadr init` to create initial configuration
   - Ensure you're in a Git repository

3. **"API key not found"**
   - Set `OPENAI_API_KEY` environment variable
   - Verify API key is valid at https://platform.openai.com/api-keys

4. **"Analysis timeout"**
   - Increase `timeout_seconds` in `cadr.yaml`
   - Check network connectivity
   - Consider using faster model (gpt-3.5-turbo)

### Debug Mode

```bash
# Enable debug logging
DEBUG=cadr:* cadr --analyze
```

### Log Files

Check structured logs in stderr for detailed information:
```bash
cadr --analyze 2> analysis.log
cat analysis.log
```

## Next Steps

After successful analysis:

1. **If significant**: Create ADR documenting the architectural decision
2. **If not significant**: Continue with normal development workflow
3. **Review analysis**: Consider the LLM's reasoning for future reference

## Support

- **Documentation**: [GitHub Repository](https://github.com/YotpoLtd/cADR)
- **Issues**: [GitHub Issues](https://github.com/YotpoLtd/cADR/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YotpoLtd/cADR/discussions)
