# Feature Specification: Internal Plumbing - Git Integration and Structured Logging

**Feature Branch**: `002-internal-plumbing`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User Story #2 from USER_STORIES.md

## Execution Flow (main)
```
1. Parse user description from Input
   → ✅ Description: "Internal Plumbing - Read staged files and log"
2. Extract key concepts from description
   → Actors: Developer using cadr CLI
   → Actions: Read staged files, output structured logs
   → Data: Staged file paths, JSON log output
   → Constraints: Must integrate with Git, must output JSON to stderr
3. For each unclear aspect:
   → ✅ No critical ambiguities for this foundational feature
4. Fill User Scenarios & Testing section
   → ✅ Clear user flow defined below
5. Generate Functional Requirements
   → ✅ All requirements testable and measurable
6. Identify Key Entities
   → ⚠️  No data entities for this feature (removed section)
7. Run Review Checklist
   → ✅ No implementation details included
   → ✅ Focus on user value (prove Git interaction and logging capability)
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
**As a developer**, I want `cadr` to read the list of staged files and print them using our structured logger, **so that we prove the application can interact with Git and produce its core output.**

This foundational story establishes:
- Git repository interaction capability
- Structured logging infrastructure
- Core module architecture for future features
- Error handling patterns for external dependencies

### Acceptance Scenarios

1. **Given** a developer is in a Git repository with staged files, **When** they run `cadr`, **Then** the tool displays the welcome message and logs the staged file paths as structured JSON to stderr

2. **Given** a developer is in a Git repository with no staged files, **When** they run `cadr`, **Then** the tool displays the welcome message and logs an empty array of staged files

3. **Given** a developer is not in a Git repository, **When** they run `cadr`, **Then** the tool displays a helpful error message and exits gracefully

4. **Given** a developer's system doesn't have Git installed, **When** they run `cadr`, **Then** the tool displays a helpful error message and exits gracefully

### Edge Cases

- **What happens when Git is installed but the repository is corrupted?**
  → The tool should detect the corruption and display a helpful error message

- **What happens when the user doesn't have permission to read the Git repository?**
  → The tool should display a permission error message and exit gracefully

- **What happens when there are many staged files (performance)?**
  → The tool should handle large numbers of staged files without significant performance impact

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `@cadr/core` library MUST contain a `GitModule` that can retrieve staged file paths from the current Git repository

- **FR-002**: The `@cadr/core` library MUST contain a `LoggerModule` that outputs structured JSON logs to stderr

- **FR-003**: The `cadr-cli` entrypoint MUST successfully integrate both GitModule and LoggerModule

- **FR-004**: The GitModule MUST handle the following error scenarios gracefully:
  - Not in a Git repository
  - Git not installed on the system
  - No staged files (return empty array)
  - Git repository corruption
  - Permission errors

- **FR-005**: The LoggerModule MUST output valid JSON with the following structure:
  - `timestamp`: ISO 8601 timestamp
  - `level`: Log level (info, warn, error)
  - `message`: Human-readable message
  - `context`: Optional context object

- **FR-006**: The CLI MUST display the welcome message first, then process staged files

- **FR-007**: The CLI MUST exit with code 0 on successful execution

- **FR-008**: The CLI MUST exit with code 1 on error scenarios with helpful error messages

- **FR-009**: Unit tests MUST be written for both GitModule and LoggerModule with mocked external dependencies

- **FR-010**: Integration tests MUST verify the complete flow from CLI to Git to Logger output

### Success Criteria

This feature is successful when:
1. ✅ A developer can run `cadr` in a Git repository and see staged files logged as JSON
2. ✅ The tool handles all error scenarios gracefully with helpful messages
3. ✅ All unit and integration tests pass with >80% coverage
4. ✅ The code passes peer review with all DoD criteria met

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs (prove Git interaction and logging)
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded (Git integration + structured logging)
- [x] Dependencies and assumptions identified (Git prerequisite)

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none found)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified (none for this feature)
- [x] Review checklist passed

---

## Notes for Next Phase (Planning)

When moving to the planning phase, consider:

1. **Git Integration**: How to shell out to git commands safely and handle errors
2. **Logging Library**: Which structured logging library to use (Pino chosen)
3. **Error Handling**: How to provide helpful error messages for different failure modes
4. **Testing Strategy**: How to mock Git commands and capture stderr output
5. **Module Architecture**: How to structure GitModule and LoggerModule for reusability

This spec establishes the foundational plumbing that all future features will build upon.
