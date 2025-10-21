# Quickstart: ADR Generation

**Feature**: `004-adr-generation`  
**Purpose**: Validate that ADR generation works end-to-end after implementation

## Prerequisites

- ✅ cADR CLI installed
- ✅ OpenAI API key configured (`OPENAI_API_KEY` environment variable)
- ✅ Valid `cadr.yaml` configuration file
- ✅ Git repository with staged changes

---

## Scenario 1: Happy Path - Generate ADR for Significant Change

### Setup
```bash
# Ensure you're in a git repository
cd /path/to/your/repo

# Create some architecturally significant changes
echo "import pg from 'pg';" > src/database.ts
git add src/database.ts

# Ensure cadr.yaml exists
cadr init  # If not already configured
```

### Execution
```bash
# Run analysis (will detect significance and prompt for generation)
cadr analyze --staged
```

### Expected Output
```
📝 Analyzing 1 staged file:
  • src/database.ts

🔍 Analyzing staged changes for architectural significance...

🤖 Sending to openai gpt-4-turbo-preview...

✅ Analysis Complete

📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT
💭 Reasoning: Introduces PostgreSQL as the primary datastore, which is a significant architectural decision affecting data persistence strategy.

💭 Introduces PostgreSQL as the primary datastore

📝 Would you like to generate an ADR for this change? (Press ENTER or type "yes" to confirm, "no" to skip): 
```

### User Action
Press **ENTER** (or type "yes")

### Expected Output (Continued)
```
🧠 Generating ADR draft...

✅ Success! Draft ADR created

📄 File: docs/adr/0001-introduce-postgresql-as-primary-datastore.md

💡 Next steps:
   1. Review and refine the generated ADR
   2. Commit it alongside your code changes
```

### Verification
```bash
# Check that the ADR file was created
ls -la docs/adr/
# Expected: 0001-introduce-postgresql-as-primary-datastore.md

# Check the file content
cat docs/adr/0001-introduce-postgresql-as-primary-datastore.md
```

### Expected File Content Structure
```markdown
# Introduce PostgreSQL as Primary Datastore

* Status: accepted
* Date: 2025-10-21

## Context and Problem Statement

[LLM-generated context about the database decision]

## Decision Drivers

* [Driver 1]
* [Driver 2]

## Considered Options

* [Option 1]
* [Option 2]

## Decision Outcome

Chosen option: "[selected option]", because [justification]

### Consequences

* Good, because [positive impact]
* Bad, because [tradeoff]

## More Information

[Additional context]
```

### Cleanup
```bash
# Optional: Remove the generated ADR if this was just a test
rm -rf docs/adr/
git reset HEAD src/database.ts
rm src/database.ts
```

---

## Scenario 2: User Declines Generation

### Setup
Same as Scenario 1

### Execution
```bash
cadr analyze --staged
```

### User Action
Type **"no"** when prompted

### Expected Output
```
💭 Introduces PostgreSQL as the primary datastore

📝 Would you like to generate an ADR for this change? (Press ENTER or type "yes" to confirm, "no" to skip): no

📋 Skipping ADR generation
🎯 Recommendation: Consider documenting this decision manually.
```

### Verification
```bash
# Check that NO ADR file was created
ls docs/adr/ 2>/dev/null || echo "No ADR directory (expected)"
```

---

## Scenario 3: Sequential Numbering

### Purpose
Verify that ADRs are numbered sequentially

### Setup
```bash
# Create first ADR (follow Scenario 1)
# ... generates 0001-first-decision.md

# Now create another change
echo "import redis from 'redis';" > src/cache.ts
git add src/cache.ts
```

### Execution
```bash
cadr analyze --staged
# Confirm generation when prompted (press ENTER)
```

### Verification
```bash
ls -la docs/adr/
# Expected output:
# 0001-introduce-postgresql-as-primary-datastore.md
# 0002-add-redis-caching-layer.md  (or similar)
```

---

## Scenario 4: Error Handling - LLM Failure

### Setup
```bash
# Temporarily break the API key
export OPENAI_API_KEY="invalid-key"
```

### Execution
```bash
# Create and stage a significant change
echo "import kafka from 'kafkajs';" > src/events.ts
git add src/events.ts

cadr analyze --staged
# Confirm generation when prompted
```

### Expected Output
```
🧠 Generating ADR draft...

❌ ADR generation failed

Invalid API key - please check your API key configuration
```

### Verification
```bash
# Application should exit cleanly (exit code 0 - fail-open)
echo $?
# Expected: 0

# No partial/broken ADR files created
ls docs/adr/*.md | grep -c "events" || echo "No broken files (expected)"
```

### Cleanup
```bash
# Restore valid API key
export OPENAI_API_KEY="your-real-key"
```

---

## Scenario 5: Directory Auto-Creation

### Setup
```bash
# Ensure docs/adr/ does NOT exist
rm -rf docs/adr/

# Verify it's gone
ls docs/adr/ 2>&1 | grep "No such file"
```

### Execution
```bash
# Create and analyze a significant change
echo "import graphql from 'graphql';" > src/api.ts
git add src/api.ts

cadr analyze --staged
# Confirm generation (press ENTER)
```

### Verification
```bash
# Check that directory was created automatically
ls -ld docs/adr/
# Expected: drwxr-xr-x ... docs/adr/

# Check that ADR file exists
ls docs/adr/0001-*.md
# Expected: File exists
```

---

## Performance Benchmarks

### Expected Timings
- Analysis phase: 5-10 seconds
- User prompt: (waits for input)
- Generation phase: 10-15 seconds
- File creation: < 100ms
- **Total (excluding user input)**: 15-25 seconds

### Measuring
```bash
time cadr analyze --staged
# (Press ENTER immediately when prompted)
```

---

## Integration Test Checklist

Run through all scenarios in order:

- [ ] Scenario 1: Happy path works, ADR is created with correct format
- [ ] Scenario 2: User can decline, no files created
- [ ] Scenario 3: Sequential numbering works (0001, 0002, ...)
- [ ] Scenario 4: LLM failure handled gracefully, no broken files
- [ ] Scenario 5: Directory created automatically if missing
- [ ] Performance: Total time under 30 seconds (excluding user input)
- [ ] ADR content: Follows MADR template structure
- [ ] Filenames: Match pattern `NNNN-slug.md`
- [ ] Slugs: Lowercase, hyphenated, no special characters

---

## Common Issues & Solutions

### Issue: "No changes to analyze"
**Solution**: Make sure files are staged with `git add <files>`

### Issue: "Configuration file not found"
**Solution**: Run `cadr init` to create `cadr.yaml`

### Issue: "API key not found"
**Solution**: Set environment variable: `export OPENAI_API_KEY="your-key"`

### Issue: Generation times out
**Solution**: Increase timeout in `cadr.yaml`: `timeout_seconds: 30`

### Issue: "Permission denied" when creating directory
**Solution**: Check filesystem permissions for docs/ directory

---

**Status**: ✅ Quickstart Ready - Use after implementation complete

