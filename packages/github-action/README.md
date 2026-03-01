# cADR GitHub Action

Automatically analyze pull requests for architectural decisions using LLMs and suggest ADRs via review comments.

## Usage

Add this to your `.github/workflows/cadr.yml`:

```yaml
name: cADR Analysis

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  pull-requests: write
  contents: read

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: YotpoLtd/cADR/packages/github-action@v1
        with:
          api_key: ${{ secrets.OPENAI_API_KEY }}
          provider: openai
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `api_key` | LLM API Key (OpenAI or Gemini) | Yes | |
| `provider` | `openai` or `gemini` | No | `openai` |
| `model` | Specific model to use (e.g. `gpt-4`, `gemini-1.5-pro`) | No | provider default |
| `config_path` | Path to `cadr.yaml` | No | `cadr.yaml` |
| `adr_directory` | Directory to save ADRs | No | `docs/adr` |
| `fail_on_error` | Fail build on error | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `is_significant` | `true` if changes are architecturally significant |
| `analysis_reason` | Reasoning for significance |
| `adr_suggested` | `true` if an ADR draft was suggested in comments |
| `adr_path` | Path of the suggested ADR |

## Development

1. Install dependencies: `npm install`
2. Build action: `npm run build`
3. Run tests: `npm test`
