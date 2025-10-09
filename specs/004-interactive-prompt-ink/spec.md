# Feature Specification: Interactive Prompt with Ink

**Feature Branch**: `004-interactive-prompt-ink`  
**Created**: 2025-01-09  
**Status**: Draft  
**Input**: User Story #4 from USER_STORIES.md: "As Alex the developer, when cadr detects a significant change, I want to be presented with an interactive prompt asking if I'd like to create an ADR, so that I am in control of the decision-making process."

## Execution Flow (main)

```
1. Parse user description from Input
   → ✅ Description: "Interactive prompt for ADR creation confirmation with dark, polished Ink UI"
2. Extract key concepts from description
   → Actors: Developer using cadr CLI  
   → Actions: Display interactive prompt, handle keyboard input, confirm/skip ADR creation
   → Data: Analysis result (is_significant, reason), user decision (create/skip)
   → Constraints: Ink + React for UI, dark theme, TTY detection, CI/non-TTY fallback
3. For each unclear aspect:
   → ✅ User confirmed: dark theme, best-practice keyboard navigation, any needed dependencies
4. Fill User Scenarios & Testing section
   → ✅ Clear user flows for TTY and non-TTY contexts
5. Generate Functional Requirements
   → ✅ All requirements testable and measurable
6. Identify Key Entities
   → ✅ Prompt UI component, user interaction flow
7. Run Review Checklist
   → ✅ No implementation details in user-facing sections
   → ✅ Focus on user experience (clean, fast, accessible prompt)
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

**As Alex the developer**, when `cadr analyze` determines my changes are architecturally significant, I want to be presented with a clean, intuitive prompt that asks if I'd like to create an ADR, **so that I have full control over when ADRs are created and can make the decision quickly without leaving my terminal workflow.**

The prompt should feel fast, polished, and consistent with modern CLI conventions (similar to tools like [Gemini CLI](https://github.com/google-gemini/gemini-cli), Copilot CLI, or other high-quality terminal applications).

### Visual Experience Goals

Users expect a terminal experience that:
- **Pops visually**: Dark theme with subtle color highlights (cyan/green for selections)
- **Is immediately clear**: Shows what the system detected and what actions are available
- **Feels responsive**: Keyboard shortcuts work intuitively (arrows, y/n, Enter, Esc)
- **Doesn't clutter**: Minimal text, clear hierarchy, clean spacing
- **Works everywhere**: Gracefully falls back to simple text output in CI or when piped

### Acceptance Scenarios

#### Scenario 1: Interactive TTY - Significant Change Detected
**Given** Alex has uncommitted changes in a Git repository  
**And** the terminal supports interactive display (TTY)  
**When** Alex runs `cadr analyze`  
**And** the LLM determines the changes are architecturally significant  
**Then** an interactive Ink UI prompt appears with:
- Title: "Architecturally Significant Change Detected"
- The reason from the LLM analysis
- Two clear options: "Create ADR" and "Skip"
- Default selection: "Skip" (safe default)
- Visual indicator showing which option is selected (e.g., arrow or highlight)
- Instructions for keyboard controls at the bottom

**And** Alex can interact with the prompt using:
- Arrow keys (←/→) to switch between options
- Enter key to confirm the selected option
- y key to immediately create ADR (shortcut)
- n/Esc/q keys to immediately skip (shortcut)

**And** after Alex makes a choice, the prompt cleanly exits and shows appropriate next steps

#### Scenario 2: CI/Non-TTY Environment - Significant Change Detected
**Given** Alex has committed changes in a Git repository  
**And** the environment is CI or non-interactive (no TTY)  
**When** a `cadr analyze` command runs (e.g., in GitHub Actions)  
**And** the LLM determines changes are architecturally significant  
**Then** the system outputs a clean text summary:
- "Architecturally Significant Change Detected"
- The reason from the LLM
- A helpful tip: "Run in an interactive terminal to create an ADR"

**And** no interactive prompt is shown (would hang CI)  
**And** the process exits cleanly with code 0 (fail-open principle)

#### Scenario 3: Interactive TTY - Non-Significant Change
**Given** Alex has uncommitted changes in a Git repository  
**And** the terminal supports interactive display (TTY)  
**When** Alex runs `cadr analyze`  
**And** the LLM determines the changes are NOT architecturally significant  
**Then** no Ink prompt appears  
**And** the system displays the standard non-significant result message  
**And** the process exits cleanly

#### Scenario 4: User Selects "Create ADR"
**Given** the interactive Ink prompt is displayed  
**When** Alex presses the right arrow to highlight "Create ADR"  
**And** Alex presses Enter (or types 'y')  
**Then** the prompt closes  
**And** a message appears: "Creating ADR draft..."  
**And** (Story #5 will handle actual generation; for Story #4, this is a placeholder)  
**And** the user returns to their terminal prompt

#### Scenario 5: User Selects "Skip"
**Given** the interactive Ink prompt is displayed  
**When** Alex leaves "Skip" selected (default) or presses left arrow  
**And** Alex presses Enter (or types 'n', 'Esc', or 'q')  
**Then** the prompt closes  
**And** a message appears: "Skipped ADR creation."  
**And** the user returns to their terminal prompt

### Edge Cases

- **What happens when the terminal window is very narrow?**  
  The Ink UI should gracefully wrap or truncate text to fit the available width. Test with terminal widths from 40-200 characters.

- **What happens if the reason string is extremely long?**  
  The Ink UI should truncate or wrap the reason text sensibly, possibly with ellipsis, to avoid breaking the layout.

- **What happens if a user mashes keys rapidly?**  
  The input handler should debounce or handle input gracefully so only one action is taken.

- **What happens if Ink fails to render?**  
  Fall back to non-interactive text output (same as CI mode) and log a warning.

- **What happens in environments with limited color support?**  
  Ink handles this automatically; test in terminals with 16-color and 256-color support.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST detect if the current environment supports interactive terminal display (TTY)
- **FR-002**: System MUST display an Ink-based interactive prompt when:
  - `cadr analyze` determines `is_significant = true`
  - AND the terminal supports TTY
  - AND the process is not running in CI
- **FR-003**: The interactive prompt MUST display:
  - A clear title indicating a significant change was detected
  - The reason provided by the LLM analysis
  - Two action options: "Create ADR" and "Skip"
  - Visual indication of the currently selected option
  - Brief keyboard control instructions
- **FR-004**: Users MUST be able to navigate the prompt using:
  - Left/right arrow keys to switch between options
  - Enter key to confirm the selected option
  - 'y' key as a shortcut to create ADR
  - 'n', 'Esc', or 'q' keys as shortcuts to skip
- **FR-005**: The default selected option MUST be "Skip" (safe default)
- **FR-006**: The prompt MUST use a dark theme with:
  - Subtle color highlights for the selected option (cyan or similar)
  - Clear visual hierarchy (title, content, actions, instructions)
  - Minimal clutter and clean spacing
- **FR-007**: When the user chooses "Create ADR", the system MUST:
  - Close the prompt cleanly
  - Display a confirmation message
  - (Placeholder for Story #5: invoke ADR generation)
- **FR-008**: When the user chooses "Skip", the system MUST:
  - Close the prompt cleanly
  - Display a confirmation message
  - Return the user to their terminal prompt
- **FR-009**: In non-TTY environments (CI, piped output), the system MUST:
  - NOT display an interactive prompt
  - Output a clean text summary of the significant change
  - Include a tip to run interactively to create an ADR
  - Exit cleanly with code 0
- **FR-010**: The system MUST handle prompt rendering failures gracefully by falling back to text output
- **FR-011**: All existing commands (`init`, `analyze` with no significance) MUST remain unchanged
- **FR-012**: The interactive prompt MUST unmount cleanly and restore the terminal to its previous state

### Non-Functional Requirements

- **NFR-001**: Prompt rendering MUST feel instant (< 100ms from decision to display)
- **NFR-002**: Keyboard input MUST be responsive (< 50ms latency from keypress to visual update)
- **NFR-003**: The UI MUST be visually consistent with modern CLI best practices (inspired by Gemini CLI, GitHub Copilot CLI)
- **NFR-004**: The UI MUST be readable in both light and dark terminal themes (though optimized for dark)
- **NFR-005**: The prompt MUST work in terminals with widths from 60 to 200 characters
- **NFR-006**: Text truncation or wrapping MUST occur gracefully without breaking layout

### Key Entities _(optional for UX-focused features, but included for clarity)_

- **Prompt State**: The current selection (create/skip) and whether the prompt is active
- **User Decision**: Boolean result from the prompt (true = create ADR, false = skip)
- **Analysis Result**: Input data to the prompt (reason string, significance flag)

---

## Success Criteria _(mandatory)_

The feature is considered complete when:

1. **Interactive Experience**: When `cadr analyze` detects a significant change in a TTY environment, an Ink prompt appears with all required elements (title, reason, options, controls)
2. **Dark Theme**: The prompt uses a dark, minimal design with cyan or green highlights for selections
3. **Keyboard Navigation**: All specified keys work correctly (arrows, Enter, y/n/Esc/q)
4. **Default Selection**: "Skip" is the default selected option when the prompt first appears
5. **Clean Exit**: The prompt unmounts cleanly and returns the user to their terminal prompt
6. **Non-TTY Fallback**: In CI or piped contexts, a clean text summary is printed instead of a prompt
7. **No Regressions**: All existing commands work as before (init, analyze for non-significant changes)
8. **Testing Coverage**: Unit tests for prompt logic, integration tests for TTY and non-TTY scenarios
9. **Documentation**: README updated with a brief note about the new interactive experience

---

## Design Inspiration

This feature draws inspiration from modern, high-quality terminal applications:

- **[Gemini CLI](https://github.com/google-gemini/gemini-cli)**: Polished Ink-based UI, clean spacing, intuitive navigation
- **[GitHub Copilot CLI](https://githubnext.com/projects/copilot-cli)**: Clear prompts, simple choices, fast interactions
- **[ink-select-input](https://github.com/vadimdemedes/ink-select-input)**: Best-practice keyboard navigation patterns

The goal is to make `cadr` feel like a modern, professional tool that respects the user's workflow.

---

## Out of Scope

- **ADR Generation**: Implementing the actual ADR generation logic (that's Story #5)
- **Multiple Choices**: This prompt only offers two options (create or skip)
- **Form Input**: No free-text input or complex forms in this story
- **Customization**: No user-configurable themes or prompts in this version
- **Redesigning `init`**: The `init` command remains unchanged; future work could port it to Ink for consistency

---

## Dependencies and Assumptions

### Dependencies
- **Ink**: React renderer for terminal UIs
- **React**: Required peer dependency for Ink
- **ink-spinner**: (optional) For future loading states
- **ink-select-input**: (optional) For menu component; can use custom implementation

### Assumptions
- Node.js 20+ is the minimum supported version (from existing package.json)
- TypeScript supports TSX compilation (will add `jsx` config)
- Ink works reliably in all major terminal emulators (macOS Terminal, iTerm2, Windows Terminal, Linux terminals)
- TTY detection via `process.stdout.isTTY` is reliable enough for our use case
- CI environments typically set `CI=true` or lack TTY

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) in user-facing sections
- [x] Focused on user value and UX goals
- [x] Written for non-technical stakeholders to understand the value
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain (user answered all questions)
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded (no ADR generation, no init redesign)
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted (Ink, dark theme, keyboard nav, TTY detection)
- [x] Ambiguities marked and resolved (user provided answers)
- [x] User scenarios defined (TTY, non-TTY, create, skip)
- [x] Requirements generated (FR-001 through FR-012, NFR-001 through NFR-006)
- [x] Entities identified (prompt state, user decision, analysis result)
- [x] Review checklist passed

---

## References

- **Ink Documentation**: [vadimdemedes/ink](https://github.com/vadimdemedes/ink)
- **Gemini CLI** (inspiration): [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- **User Story #4**: docs/USER_STORIES.md
- **Related Stories**: Story #3 (LLM Analysis - provides input), Story #5 (ADR Generation - uses output)

