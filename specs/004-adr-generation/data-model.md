# Data Model: ADR Generation

**Feature**: `004-adr-generation`  
**Date**: 2025-10-21

## Core Entities

### 1. GenerationRequest

Represents the data sent to the LLM for ADR generation.

```typescript
interface GenerationRequest {
  file_paths: string[];        // Staged files that triggered this ADR
  diff_content: string;        // Full git diff for context
  reason: string;              // Why this change is significant (from analysis)
  generation_prompt: string;   // Formatted LLM prompt with MADR template
}
```

**Validation Rules**:
- `file_paths`: Must be non-empty array
- `diff_content`: Must be non-empty string
- `reason`: Must be non-empty string (from analysis phase)
- `generation_prompt`: Must contain MADR template structure

**Lifecycle**:
1. Created after user confirms ADR generation
2. Populated from analysis results and git data
3. Sent to LLM via generateADRContent()
4. Discarded after response received

---

### 2. GenerationResult

Represents the LLM's response containing ADR content.

```typescript
interface GenerationResult {
  content: string;     // Full MADR-formatted markdown content
  title: string;       // Extracted title from first line
  timestamp: string;   // ISO 8601 timestamp of generation
}
```

**Validation Rules**:
- `content`: Must contain MADR required sections
  - Title (# heading)
  - Status (* Status: ...)
  - Date (* Date: ...)
  - Context and Problem Statement (## heading)
  - Decision Outcome (## heading)
- `title`: Extracted from first # heading in content
- `timestamp`: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)

**Extraction Logic**:
```typescript
const titleMatch = content.match(/^#\s+(.+)$/m);
const title = titleMatch ? titleMatch[1].trim() : 'Untitled Decision';
```

**Lifecycle**:
1. Created from LLM response
2. Title extracted via regex
3. Passed to saveADR() for file creation
4. Content written to disk

---

### 3. GenerationResponse

Wrapper for generation result with error handling.

```typescript
interface GenerationResponse {
  result: GenerationResult | null;  // Null if error occurred
  error?: string;                   // Error message if generation failed
}
```

**States**:
- **Success**: `result` is populated, `error` is undefined
- **Failure**: `result` is null, `error` contains message

**Error Scenarios**:
- API authentication failure
- Rate limiting
- Timeout (exceeds configured timeout_seconds)
- Context length exceeded
- Invalid JSON response
- Network error

**Fail-Open Handling**:
All errors result in graceful exit with helpful message, never throwing exceptions.

---

### 4. ADRFile

Represents an ADR file in the filesystem.

```typescript
interface ADRFile {
  number: number;        // Sequential number (1, 2, 3, ...)
  slug: string;          // URL-safe slug from title
  filename: string;      // Complete filename (0001-slug.md)
  filepath: string;      // Full path (docs/adr/0001-slug.md)
  content: string;       // MADR-formatted markdown content
}
```

**Filename Format**: `NNNN-slug.md`
- `NNNN`: Zero-padded 4-digit number (0001-9999)
- `slug`: Lowercase, hyphen-separated, alphanumeric only
- `.md`: Markdown extension

**Example**:
```typescript
{
  number: 4,
  slug: "use-postgresql-for-storage",
  filename: "0004-use-postgresql-for-storage.md",
  filepath: "docs/adr/0004-use-postgresql-for-storage.md",
  content: "# Use PostgreSQL for Storage\n\n* Status: accepted\n..."
}
```

**Validation Rules**:
- `number`: Must be > 0, sequential with existing ADRs
- `slug`: Must match `/^[a-z0-9]+(-[a-z0-9]+)*$/`
- `filename`: Must match `/^\d{4}-[a-z0-9-]+\.md$/`
- `content`: Must be valid MADR-formatted markdown

---

### 5. UserPromptResult

Represents the user's response to the generation prompt.

```typescript
interface UserPromptResult {
  confirmed: boolean;    // true if user wants to generate ADR
  timestamp: string;     // When user responded
}
```

**Confirmation Logic**:
```typescript
const normalized = userInput.trim().toLowerCase();
const confirmed = normalized === '' ||       // ENTER pressed
                  normalized === 'y' ||      // Typed 'y'
                  normalized === 'yes';      // Typed 'yes'
```

**Rejection Values**:
- `'n'`, `'no'`: Explicit rejection
- Any other input: Treated as rejection (safe default)

---

## Entity Relationships

```
Analysis Phase
    ↓
    ├─→ AnalysisResult.is_significant = true
    ├─→ AnalysisResult.reason (string)
    ↓
User Prompt
    ↓
    ├─→ UserPromptResult.confirmed = true
    ↓
Generation Phase
    ├─→ GenerationRequest
    │     ├── file_paths (from git)
    │     ├── diff_content (from git)
    │     ├── reason (from AnalysisResult)
    │     └── generation_prompt (from GENERATION_PROMPT_V1)
    ↓
    ├─→ LLM Call
    ↓
    ├─→ GenerationResponse
    │     └─→ GenerationResult
    │           ├── content (MADR markdown)
    │           ├── title (extracted)
    │           └── timestamp
    ↓
File Creation Phase
    ├─→ ADRFile
    │     ├── number (computed from existing)
    │     ├── slug (from title)
    │     ├── filename (formatted)
    │     ├── filepath (docs/adr/ + filename)
    │     └── content (from GenerationResult)
    ↓
Success Message
```

---

## State Transitions

### ADR Generation Workflow States

```
[ANALYSIS_COMPLETE] 
    ↓ (is_significant = true)
[PROMPT_USER]
    ↓ (confirmed = true)         ↓ (confirmed = false)
[GENERATING]                   [SKIPPED]
    ↓ (success)    ↓ (error)
[SAVING]         [ERROR]
    ↓ (success)    ↓ (error)
[COMPLETE]       [ERROR]
```

**State Descriptions**:
- **ANALYSIS_COMPLETE**: Analysis determined change is significant
- **PROMPT_USER**: Waiting for user confirmation
- **SKIPPED**: User declined generation
- **GENERATING**: LLM call in progress
- **SAVING**: Writing file to disk
- **COMPLETE**: ADR successfully created
- **ERROR**: Any failure (still exits cleanly per fail-open)

---

## Data Flow

### Input Data Sources
1. **From Analysis Phase**:
   - `is_significant: boolean`
   - `reason: string`
   - `file_paths: string[]`
   - `diff_content: string`

2. **From Configuration**:
   - `provider: string` (e.g., "openai")
   - `analysis_model: string` (used for generation)
   - `api_key_env: string`
   - `timeout_seconds: number`

3. **From User**:
   - Confirmation response (ENTER/yes/no)

4. **From Filesystem**:
   - Existing ADR numbers (for next number calculation)
   - Directory existence (docs/adr/)

### Output Data
1. **To Filesystem**:
   - New ADR markdown file in docs/adr/
   - Directory creation if needed

2. **To User**:
   - Success message with filepath
   - Next steps guidance
   - OR error message with helpful context

3. **To Logs**:
   - Structured JSON logs for observability
   - Events: generation.start, generation.success, generation.failure, adr.file_created

---

## Validation Rules Summary

| Entity | Field | Validation |
|--------|-------|------------|
| GenerationRequest | file_paths | Non-empty array |
| GenerationRequest | diff_content | Non-empty string |
| GenerationRequest | reason | Non-empty string |
| GenerationResult | content | Contains MADR sections |
| GenerationResult | title | Non-empty, extracted from # heading |
| ADRFile | number | > 0, sequential |
| ADRFile | slug | Matches `/^[a-z0-9-]+$/` |
| ADRFile | filename | Format: `NNNN-slug.md` |
| ADRFile | content | Valid markdown, MADR structure |

---

**Status**: ✅ Data Model Complete - Ready for Contracts

