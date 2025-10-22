# MADR Template Format

This document describes the MADR (Markdown Architectural Decision Records) template format used by cADR.

## About MADR

[MADR](https://adr.github.io/madr/) is a lean template for documenting architectural decisions in Markdown. It provides a structured format that's:

- **Easy to read**: Plain Markdown
- **Version controllable**: Lives with your code
- **Searchable**: Text-based format
- **Standardized**: Widely adopted format

## Template Sections

### Title

A clear, concise description of the decision. Use imperative mood ("Use", "Adopt", "Implement").

**Good examples:**

- Use JWT for Authentication
- Adopt Microservices Architecture
- Implement GraphQL API

**Avoid:**

- Authentication (too vague)
- JWT vs Sessions (shows options, not decision)

### Status

Current state of the decision:

- **proposed**: Under consideration
- **accepted**: Decision approved and implemented
- **rejected**: Considered but not chosen
- **deprecated**: No longer recommended
- **superseded**: Replaced by another ADR

### Date

Date when the decision was made or last updated (YYYY-MM-DD format).

### Technical Story (Optional)

Link to related tickets, issues, or additional context.

### Context and Problem Statement

Explains:

- Current situation
- Problem that needs solving
- Constraints or requirements
- Why a decision is needed

### Decision Drivers

Key factors influencing the decision:

- Technical requirements
- Business constraints
- Team expertise
- Performance needs
- Cost considerations

### Considered Options

Alternatives that were evaluated. Shows due diligence and provides future context.

### Decision Outcome

The chosen approach with:

- Clear justification
- Expected benefits
- Accepted trade-offs

Includes positive and negative consequences.

### Pros and Cons of the Options (Optional)

Detailed comparison of all considered options. Helps future readers understand the full context.

### Links (Optional)

References to:

- Related ADRs
- External documentation
- RFCs or specifications
- Internal documentation

## File Naming Convention

Format: `NNNN-title-with-dashes.md`

- **NNNN**: 4-digit sequential number (0001, 0002, etc.)
- **title**: Lowercase, hyphen-separated
- **.md**: Markdown extension

## Best Practices

### 1. Be Concise but Complete

Include enough information for future readers to understand the decision, but avoid unnecessary detail.

### 2. Focus on "Why", Not "How"

ADRs document decisions and rationale, not implementation details (that goes in code/docs).

### 3. Write for the Future

Assume readers don't have your current context. Explain background and constraints.

### 4. Document Alternatives

Show what options were considered. This helps avoid revisiting rejected approaches.

### 5. Be Honest About Trade-offs

List both positive and negative consequences. Every decision has trade-offs.

### 6. Keep It Version Controlled

ADRs live in your repository, versioned alongside the code they describe.

### 7. Update When Needed

If circumstances change, update the ADR or create a superseding one.

## Resources

- **[MADR Project](https://adr.github.io/madr/)** - Official MADR documentation
- **[ADR GitHub Organization](https://adr.github.io/)** - Tools and examples
- **[Michael Nygard's Original Post](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)** - Origin of ADRs
- **[ADR Tools](https://github.com/npryce/adr-tools)** - Command-line tools for managing ADRs

## Related Documentation

- [ADR Generation Process](./ADR_GENERATION.md)
- [Usage Guide](./USAGE.md)
- [Quick Start](./QUICK_START.md)

