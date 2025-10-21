# Research: ADR Generation

**Feature**: `004-adr-generation`  
**Date**: 2025-10-21

## Research Questions

### 1. MADR Template Format

**Decision**: Use MADR (Markdown Architectural Decision Records) v3 template

**Rationale**:
- Industry-standard format (https://adr.github.io/madr/)
- Lightweight and focused on essential sections
- Well-documented with clear structure
- Already adopted by many open-source projects

**Template Structure**:
```markdown
# [Short title of solved problem and solution]

* Status: [proposed | rejected | accepted | deprecated | superseded by ADR-XXXX]
* Date: YYYY-MM-DD

## Context and Problem Statement

[Describe the context and problem statement]

## Decision Drivers

* [driver 1]
* [driver 2]

## Considered Options

* [option 1]
* [option 2]

## Decision Outcome

Chosen option: "[option]", because [justification]

### Consequences

* Good, because [positive consequence]
* Bad, because [negative consequence]

## More Information

[Additional context, links, notes]
```

**Alternatives Considered**:
- **ADR Template by Michael Nygard**: More verbose, includes more sections than needed
- **Custom template**: Reinventing the wheel, less community recognition

---

### 2. CLI Confirmation Prompt Pattern

**Decision**: Use readline with ENTER-to-confirm pattern (empty input = yes)

**Rationale**:
- Industry standard (git, npm, etc.)
- Low friction - just press ENTER to confirm
- Clear instructions in prompt text
- Built-in Node.js module (readline)

**Implementation Pattern**:
```typescript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Prompt text (Press ENTER to confirm, "no" to skip): ', (answer) => {
  const normalized = answer.trim().toLowerCase();
  const confirmed = normalized === '' || normalized === 'y' || normalized === 'yes';
  rl.close();
  // proceed based on confirmed
});
```

**Alternatives Considered**:
- **inquirer.js**: Additional dependency, too heavy for simple yes/no
- **prompts package**: Another dependency, readline is sufficient
- **y/n only**: More typing required, ENTER pattern is more ergonomic

---

### 3. Filename Slug Generation

**Decision**: Lowercase with hyphens, alphanumeric only

**Rationale**:
- URL-safe and filesystem-safe across all OS
- Readable and consistent
- Matches existing ADR filename conventions
- Easy to implement with regex

**Algorithm**:
```typescript
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}
```

**Examples**:
- "Use PostgreSQL for Storage" → "use-postgresql-for-storage"
- "API v2.0: New Endpoints!" → "api-v2-0-new-endpoints"
- "Switch to TypeScript" → "switch-to-typescript"

**Alternatives Considered**:
- **Preserve case**: Less consistent, harder to find files
- **Underscores**: Hyphens are more common in modern projects
- **Keep special chars**: Can cause filesystem issues

---

### 4. Sequential File Numbering

**Decision**: Zero-padded 4-digit sequential numbers (0001, 0002, ...)

**Rationale**:
- Consistent with ADR best practices
- Sorts correctly in file explorers
- Allows up to 9999 ADRs (more than sufficient)
- Easy to scan for next number

**Algorithm**:
```typescript
function getNextADRNumber(adrDir: string): number {
  const files = fs.readdirSync(adrDir);
  const numbers = files
    .map(f => f.match(/^(\d{4})-/))
    .filter(m => m !== null)
    .map(m => parseInt(m[1], 10));
  
  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
}

function formatNumber(num: number): string {
  return String(num).padStart(4, '0');
}
```

**Handling Gaps**:
- Use MAX + 1 (don't fill gaps)
- Preserves history even if ADRs are deleted
- Simpler logic, no need to check for gaps

**Alternatives Considered**:
- **Date-based**: Less intuitive ordering, harder to reference
- **UUID**: Not human-readable, defeats the purpose
- **3-digit padding**: May not scale (though 999 ADRs is likely enough)

---

### 5. Directory Structure

**Decision**: Single `docs/adr/` directory at repository root

**Rationale**:
- Standard location for documentation
- Single source of truth for all ADRs
- Easy to find and browse
- Matches most ADR tooling conventions

**Auto-creation Strategy**:
```typescript
fs.mkdirSync(adrDir, { recursive: true });
```

The `recursive: true` flag creates parent directories if needed.

**Alternatives Considered**:
- **`.adr/` in root**: Hidden directory, less discoverable
- **`adrs/` in root**: Less clear, not standard location
- **Per-module ADRs**: Harder to get full picture of decisions

---

### 6. LLM Generation Strategy

**Decision**: Single LLM call with comprehensive prompt

**Rationale**:
- Same model as analysis (user preference)
- Consistent with existing architecture
- One API call = lower latency and cost
- Prompt includes full MADR template structure

**Prompt Engineering**:
- Include exact MADR template in prompt
- Provide clear instructions for each section
- Request markdown output (no code fences)
- Include examples of good decision records

**Error Handling**:
- Parse title from first line (# Title)
- Validate presence of required sections
- Fall back gracefully if LLM returns incomplete content
- Follow fail-open: warn and continue

**Alternatives Considered**:
- **Multi-step generation**: More complex, more API calls
- **Separate title generation**: Unnecessary additional call
- **Structured output**: Markdown is sufficient and readable

---

## Implementation Notes

### Critical Path
1. Create generation prompt template (GENERATION_PROMPT_V1)
2. Implement ADR file management (adr.ts)
3. Extend LLM module with generation function
4. Add user confirmation prompt
5. Integrate into analysis workflow

### Testing Strategy
- Mock fs operations for file creation tests
- Mock readline for user prompt tests
- Mock OpenAI for generation tests
- Integration test: full flow from analysis → generation → file

### Performance Considerations
- LLM call is the bottleneck (~10-15s)
- File operations are negligible (<100ms)
- User prompt is synchronous (wait for input)
- Total time estimate: 15-20s for full flow

---

## References

- MADR Specification: https://adr.github.io/madr/
- ADR Best Practices: https://github.com/joelparkerhenderson/architecture-decision-record
- Node.js readline: https://nodejs.org/api/readline.html
- File system best practices: https://nodejs.org/api/fs.html

---

**Status**: ✅ Research Complete - Ready for Phase 1 (Design)

