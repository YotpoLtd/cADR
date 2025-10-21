# Feature Specification: ADR Generation

**Feature Branch**: `004-adr-generation`  
**Created**: 2025-10-21  
**Status**: Draft  
**Input**: User description: "As Alex the developer, after detecting an architecturally significant change, I want cadr to prompt me to generate an ADR, and upon confirmation, automatically create a draft ADR file following the MADR template format. The system should use the same LLM model for generation, create the docs/adr/ directory if it doesn't exist, auto-generate the ADR title and filename based on the change context, prompt for user confirmation (ENTER/yes), and manually create the ADR file without requiring external tools like adr-tools."

## Execution Flow (main)

```
1. Parse user description from Input
   → ✅ Description: "Automated ADR file generation for architecturally significant changes"
2. Extract key concepts from description
   → Actors: Developer using cadr CLI after analysis phase
   → Actions: Prompt user, generate ADR content, create markdown file
   → Data: LLM-generated ADR content, file paths, ADR metadata
   → Constraints: MADR format, same model as analysis, user confirmation required
3. For each unclear aspect:
   → ✅ No critical ambiguities for this well-defined feature
4. Fill User Scenarios & Testing section
   → ✅ Clear user flow defined below
5. Generate Functional Requirements
   → ✅ All requirements testable and measurable
6. Identify Key Entities
   → ✅ ADR content, file management, prompt entities identified
7. Run Review Checklist
   → ✅ No implementation details included
   → ✅ Focus on user value (automated documentation creation)
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

## User Scenarios & Testing _(mandatory)_

### Primary User Story

**As Alex the developer**, after detecting an architecturally significant change, I want `cadr` to **automatically generate a draft ADR file**, so that architectural decisions are documented at the moment they're made without manual effort.

This feature enables automatic creation of well-structured ADR documentation, reducing friction in the documentation process and ensuring decisions are captured immediately.

### Acceptance Scenarios

1. **Given** cadr has detected an architecturally significant change, **When** the analysis completes, **Then** the system prompts the user to generate an ADR with clear options to confirm or skip

2. **Given** a user confirms ADR generation (presses ENTER or types "yes"), **When** the generation process starts, **Then** the system calls the LLM to generate ADR content following the MADR template

3. **Given** the LLM has generated ADR content, **When** the content is received, **Then** the system automatically creates the `docs/adr/` directory if it doesn't exist

4. **Given** ADR content is ready to save, **When** determining the filename, **Then** the system automatically generates a numbered filename (e.g., 0001-title-slug.md) based on existing ADRs

5. **Given** the ADR file is created successfully, **When** the process completes, **Then** the system displays the file path and next steps to the user

6. **Given** a user declines ADR generation (types "no"), **When** the prompt is answered, **Then** the system skips generation and displays a reminder message

### Edge Cases

- **What happens when the LLM generation call fails?**
  → The system logs an error, displays a helpful message, and exits gracefully (fail-open principle)

- **What happens when the docs/adr/ directory cannot be created?**
  → The system displays an error with the specific permission or filesystem issue

- **What happens when an ADR file with the same name already exists?**
  → The system increments the number and uses the next available number

- **What happens when the LLM generates invalid or incomplete content?**
  → The system detects missing sections and either retries or saves what's available with a warning

- **What happens when the diff is too large for the LLM context?**
  → The system displays a clear error message suggesting to stage fewer files

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST prompt the user for ADR generation after detecting an architecturally significant change, with options to confirm (ENTER/yes) or decline (no)

- **FR-002**: The system MUST use the same LLM model configured for analysis to generate ADR content

- **FR-003**: The system MUST generate ADR content following the MADR (Markdown Architectural Decision Records) template format

- **FR-004**: The system MUST include the following MADR sections: Title, Status, Date, Context and Problem Statement, Decision Drivers, Considered Options, Decision Outcome, Consequences, More Information

- **FR-005**: The system MUST automatically create the `docs/adr/` directory if it does not exist

- **FR-006**: The system MUST scan existing ADR files to determine the next sequential number (0001, 0002, etc.)

- **FR-007**: The system MUST auto-generate a filename-safe slug from the ADR title for the filename (e.g., "Use PostgreSQL" → "use-postgresql")

- **FR-008**: The system MUST create ADR files with the format: `NNNN-title-slug.md` where NNNN is a zero-padded 4-digit number

- **FR-009**: The system MUST display a success message with the file path after creating the ADR

- **FR-010**: The system MUST provide guidance on next steps (review, refine, commit) after ADR creation

- **FR-011**: The system MUST follow the fail-open principle: if generation fails, log the error and exit gracefully without blocking the user

- **FR-012**: The system MUST handle user cancellation gracefully and display a reminder to document the decision manually

### Key Entities _(include if feature involves data)_

- **Generation Prompt**: The versioned LLM prompt template (v1) that instructs the model to create MADR-formatted content

- **Generation Request**: Data structure containing file paths, diff content, and the reasoning from analysis

- **Generation Result**: The LLM response containing the complete ADR markdown content and extracted title

- **ADR File**: The markdown file stored in `docs/adr/` with a numbered filename following MADR structure

- **User Prompt**: Interactive CLI prompt asking for confirmation to generate the ADR

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs (automated ADR creation)
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded (ADR generation after analysis)
- [x] Dependencies and assumptions identified (requires analysis to detect significance first)

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none found)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Notes for Next Phase (Planning)

When moving to the planning phase, consider:

1. **Generation Prompt Design**: How to create a versioned prompt that produces consistent MADR-formatted output
2. **File Management**: How to implement directory creation, file numbering, and slug generation
3. **User Interaction**: How to implement the confirmation prompt with industry-standard CLI patterns
4. **LLM Integration**: How to extend existing LLM module for generation requests
5. **Error Handling**: How to maintain fail-open principle throughout the generation flow
6. **Testing Strategy**: How to mock LLM responses and test file creation scenarios

This spec establishes the foundation for seamless ADR documentation that completes the core value proposition of cADR.

