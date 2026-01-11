# Standard Operating Procedures (SOP)

This document defines the mandatory workflow for all AI agents interacting with this repository. We follow the **Research-Plan-Implement (RPI)** pattern to ensure robustness and quality.

## RFC 2119 Keywords
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://tools.ietf.org/html/rfc2119).

---

## 1. Research Phase
The Research phase is the foundation of any change.

- **R1**: Agents MUST scan the codebase for existing patterns, related files, and potential side effects before proposing changes.
- **R2**: Agents SHOULD check for existing documentation or ADRs (Architecture Decision Records) in `specs/`.
- **R3**: Agents SHOULD document identified edge cases and constraints.
- **R4**: Researcher agents MUST NOT modify code; they are limited to read-only operations.

## 2. Planning Phase
Planning ensures that changes are deliberate and understood.

- **P1**: Agents MUST update or create an `implementation_plan.md` artifact before starting implementation.
- **P2**: The plan SHOULD clearly outline the files to be modified and the logic to be implemented.
- **P3**: Architect agents SHOULD obtain user approval on the plan before proceeding.

## 3. Implementation Phase (The Robust Loop)
Implementation MUST be followed by verification.

- **I1**: Developer agents MUST follow the **Robust Loop** rule for every significant change.
- **I2**: **Robust Loop**: After modification, agents MUST Run `yarn build`, `yarn lint`, and `yarn test` (relevant to the change).
- **I3**: Agents MUST NOT declare a task "done" if any step of the Robust Loop fails.
- **I4**: Agents MUST update relevant documentation (READMEs, JSDocs, etc.) to reflect code changes.
- **I5**: Developer agents MUST NOT bypass security or linting rules unless explicitly authorized.

## 4. Review Phase
Quality control and compliance.

- **RV1**: Reviewer agents MUST verify that the SOP was followed during implementation.
- **RV2**: Reviewer agents SHOULD flag any missing tests or documentation updates.
- **RV3**: Reviewer agents SHOULD be read-only.
