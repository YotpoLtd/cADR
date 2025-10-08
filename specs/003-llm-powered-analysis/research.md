# Research: LLM-Powered Analysis

**Feature**: LLM-Powered Analysis  
**Date**: 2025-10-08  
**Phase**: 0 - Outline & Research

## Research Tasks

### 1. OpenAI SDK Integration

**Task**: Research OpenAI SDK for Node.js integration patterns and best practices

**Decision**: Use `openai` npm package (official OpenAI SDK)

**Rationale**: 
- Official OpenAI SDK with TypeScript support
- Built-in retry logic and error handling
- Active maintenance and community support
- Clean API for chat completions

**Alternatives considered**:
- LangChain: Overkill for simple OpenAI integration
- Direct HTTP calls: More error-prone, no built-in retry logic

**Implementation notes**:
- Use `ChatCompletion` API for analysis requests
- Configure timeout (15s default) per constitution
- Environment variable for API key: `OPENAI_API_KEY`

### 2. YAML Configuration Management

**Task**: Research YAML parsing and validation libraries for Node.js

**Decision**: Use `js-yaml` for parsing and `yup` for validation

**Rationale**:
- `js-yaml`: Lightweight, well-maintained YAML parser
- `yup`: TypeScript-first validation with excellent error messages
- Minimal dependencies, fast parsing

**Alternatives considered**:
- `yaml`: Similar functionality but less TypeScript support
- Custom validation: Too much maintenance overhead

**Configuration schema**:
```yaml
provider: "openai"
analysis_model: "gpt-4"
api_key_env: "OPENAI_API_KEY"
timeout_seconds: 15
```

### 3. Git Diff Extraction

**Task**: Research Git diff extraction patterns for staged files

**Decision**: Use existing `@cadr/core/src/git.ts` module with extensions

**Rationale**:
- Leverage existing GitModule implementation
- Add `getStagedDiff()` method for staged file analysis
- Maintain consistency with existing Git operations

**Implementation approach**:
- Extend GitModule with staged diff functionality
- Use `git diff --cached` for staged changes
- Include file paths and diff content in LLM request

### 4. Error Handling Patterns

**Task**: Research fail-open error handling patterns for CLI tools

**Decision**: Structured error handling with pino logger and graceful degradation

**Rationale**:
- Follow constitution's fail-open principle
- Structured logging for debugging
- User-friendly error messages
- No retries to avoid blocking workflow

**Error categories**:
- API failures: Log WARN, display helpful message
- Missing configuration: Display setup instructions
- Rate limiting: Display rate limit message
- Network timeouts: Display timeout message

### 5. Testing Strategy for LLM Integration

**Task**: Research mocking strategies for OpenAI API calls in tests

**Decision**: Mock OpenAI client with jest.mock() and custom test utilities

**Rationale**:
- Jest mocking provides full control over API responses
- Test both success and failure scenarios
- No real API calls in test suite
- Fast test execution

**Test scenarios**:
- Successful analysis with significant changes
- Successful analysis with non-significant changes
- API failure scenarios
- Rate limiting scenarios
- Invalid response format handling

## Technical Decisions Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| LLM Provider | OpenAI SDK | Official SDK, TypeScript support |
| Configuration | js-yaml + yup | Lightweight, validated parsing |
| Git Operations | Extend existing GitModule | Consistency, reuse |
| Error Handling | Structured logging + graceful degradation | Fail-open principle |
| Testing | Jest mocking | Full control, fast execution |

## Dependencies to Add

```json
{
  "openai": "^4.0.0",
  "js-yaml": "^4.1.0", 
  "yup": "^1.0.0"
}
```

## Integration Points

1. **Core Module**: `@cadr/core/src/llm.ts` - OpenAI client wrapper
2. **Analysis Module**: `@cadr/core/src/analysis.ts` - Orchestration logic
3. **Config Module**: `@cadr/core/src/config.ts` - YAML handling
4. **CLI Commands**: `cadr init` and `cadr --analyze` commands
5. **Git Integration**: Extend existing GitModule for staged diff

## Performance Considerations

- **LLM API timeout**: 15 seconds (constitution requirement)
- **Config loading**: <2 seconds for YAML parsing and validation
- **Git operations**: <1 second for staged diff extraction
- **Memory usage**: Minimal - no persistent storage required

## Security Considerations

- API keys via environment variables only
- No sensitive data in configuration files
- Structured logging excludes sensitive information
- Fail-open ensures no workflow blocking
