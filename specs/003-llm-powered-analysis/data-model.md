# Data Model: LLM-Powered Analysis

**Feature**: LLM-Powered Analysis  
**Date**: 2025-10-08  
**Phase**: 1 - Design & Contracts

## Core Entities

### 1. AnalysisConfig

**Purpose**: Represents the `cadr.yaml` configuration file for LLM analysis settings

**Fields**:
```typescript
interface AnalysisConfig {
  provider: "openai";
  analysis_model: string;           // e.g., "gpt-4", "gpt-3.5-turbo"
  api_key_env: string;              // e.g., "OPENAI_API_KEY"
  timeout_seconds: number;          // default: 15
  ignore_patterns?: string[];       // optional file patterns to ignore
}
```

**Validation Rules**:
- `provider` must be "openai" (extensible for future providers)
- `analysis_model` must be non-empty string
- `api_key_env` must be valid environment variable name
- `timeout_seconds` must be positive integer (1-60)
- `ignore_patterns` must be array of valid glob patterns

**State Transitions**:
- **Initial**: Config file doesn't exist
- **Created**: Config file created via `cadr init`
- **Valid**: Config loaded and validated successfully
- **Invalid**: Config has validation errors

### 2. AnalysisRequest

**Purpose**: Represents the data sent to the LLM for architectural significance analysis

**Fields**:
```typescript
interface AnalysisRequest {
  file_paths: string[];            // Staged file paths
  diff_content: string;            // Git diff content
  repository_context: string;      // Repository name/path
  analysis_prompt: string;         // Versioned prompt template
}
```

**Validation Rules**:
- `file_paths` must be non-empty array
- `diff_content` must be non-empty string
- `repository_context` must be non-empty string
- `analysis_prompt` must be valid prompt template

**Creation Process**:
1. Extract staged files using GitModule
2. Generate diff content using `git diff --cached`
3. Get repository context from GitModule
4. Load prompt template from prompts.ts

### 3. AnalysisResult

**Purpose**: Represents the LLM response containing significance determination and reasoning

**Fields**:
```typescript
interface AnalysisResult {
  is_significant: boolean;          // Whether changes are architecturally significant
  reason: string;                  // Explanation of the determination
  confidence?: number;             // Optional confidence score (0-1)
  timestamp: string;              // ISO timestamp of analysis
}
```

**Validation Rules**:
- `is_significant` must be boolean
- `reason` must be non-empty string (max 1000 chars)
- `confidence` must be number between 0 and 1 (if present)
- `timestamp` must be valid ISO string

**Response Parsing**:
- LLM returns JSON: `{"is_significant": boolean, "reason": string}`
- Parse and validate response format
- Add timestamp and optional confidence

### 4. AnalysisError

**Purpose**: Represents various error conditions during analysis

**Fields**:
```typescript
interface AnalysisError {
  type: "api_failure" | "timeout" | "rate_limit" | "invalid_response" | "config_error";
  message: string;                 // User-friendly error message
  details?: string;               // Technical details for logging
  recoverable: boolean;           // Whether operation can be retried
}
```

**Error Types**:
- **api_failure**: OpenAI API returned error
- **timeout**: Request exceeded timeout
- **rate_limit**: API rate limit exceeded
- **invalid_response**: LLM response format invalid
- **config_error**: Configuration validation failed

## Entity Relationships

```
AnalysisConfig (1) → (0..*) AnalysisRequest
AnalysisRequest (1) → (1) AnalysisResult
AnalysisRequest (1) → (0..1) AnalysisError
```

## State Management

### AnalysisConfig Lifecycle
1. **Missing**: No config file exists
2. **Invalid**: Config file has validation errors
3. **Valid**: Config loaded and validated
4. **Active**: Config being used for analysis

### AnalysisRequest Lifecycle
1. **Created**: Request data assembled
2. **Sent**: Request sent to LLM API
3. **Processing**: Waiting for LLM response
4. **Completed**: Response received and parsed
5. **Failed**: Error occurred during processing

## Data Validation

### Configuration Validation
- YAML syntax validation
- Schema validation using yup
- Environment variable existence check
- Model availability verification

### Request Validation
- File path existence check
- Diff content non-empty validation
- Prompt template validation
- API key presence check

### Response Validation
- JSON format validation
- Required field presence
- Data type validation
- Reason length limits

## Persistence

### Configuration Storage
- **Format**: YAML file (`cadr.yaml`)
- **Location**: Repository root
- **Backup**: None (user-managed)
- **Versioning**: Git-tracked

### Analysis Results
- **Format**: In-memory only
- **Persistence**: None (display only)
- **Logging**: Structured logs to stderr
- **Caching**: None (always fresh analysis)

## Security Considerations

### Sensitive Data Handling
- API keys via environment variables only
- No API keys in configuration files
- No sensitive data in logs
- No persistent storage of analysis results

### Input Validation
- File path sanitization
- Diff content size limits
- Prompt injection prevention
- Response format validation

## Performance Characteristics

### Memory Usage
- **Config**: <1KB (small YAML file)
- **Request**: <100KB (diff content + metadata)
- **Response**: <10KB (analysis result)
- **Total**: <200KB per analysis

### Processing Time
- **Config loading**: <100ms
- **Git operations**: <500ms
- **LLM API call**: <15s (timeout)
- **Response parsing**: <50ms
- **Total**: <16s maximum
