/**
 * Contract: AnalysisPrompt Component
 * 
 * Purpose: Interactive Ink UI for confirming ADR creation after detecting
 *          architecturally significant changes.
 * 
 * Story: #4 - Interactive Prompt
 * Date: 2025-01-09
 */

/**
 * Props for the Prompt React component
 */
export interface AnalysisPromptProps {
  /**
   * Reason from LLM analysis explaining why the change is significant.
   * Can be empty string (per ANALYSIS_PROMPT_V1 spec).
   */
  reason: string;

  /**
   * Callback invoked when user makes a decision.
   * @param createAdr - true if user wants to create ADR, false to skip
   */
  onSubmit: (createAdr: boolean) => void;
}

/**
 * High-level async wrapper for the prompt component.
 * 
 * This function renders the Ink prompt, waits for user decision,
 * and cleanly unmounts the component before returning.
 * 
 * @param reason - LLM analysis reason text
 * @returns Promise resolving to true (create ADR) or false (skip)
 * 
 * @example
 * ```typescript
 * import { promptForAdr } from './ui/AnalysisPrompt';
 * 
 * if (result.is_significant) {
 *   const shouldCreate = await promptForAdr(result.reason);
 *   
 *   if (shouldCreate) {
 *     console.log('📝 Creating ADR draft...');
 *     // Story #5 will implement generation
 *   } else {
 *     console.log('✅ Skipped ADR creation.\n');
 *   }
 * }
 * ```
 * 
 * @throws Never - follows fail-open principle. Render failures return false (skip).
 */
export function promptForAdr(reason: string): Promise<boolean>;

/**
 * Behavior Specifications:
 * 
 * 1. RENDERING
 *    - Renders dark-themed Ink UI with title, reason, options, controls
 *    - Default selection: "Skip" (safe default)
 *    - Visual indicator (▶ or highlight) shows selected option
 *    - Keyboard instructions displayed at bottom
 * 
 * 2. KEYBOARD HANDLING
 *    - Left/Right arrows: Toggle selection between "Create ADR" and "Skip"
 *    - Enter: Confirm currently selected option
 *    - 'y' key: Instant "Create ADR" (bypass selection)
 *    - 'n', 'Esc', 'q' keys: Instant "Skip" (bypass selection)
 *    - Ctrl+C: Exit via Ink's built-in handler (exits process with code 130)
 * 
 * 3. UNMOUNTING
 *    - Prompt unmounts immediately after user decision
 *    - Terminal state restored to pre-prompt state
 *    - No lingering UI artifacts
 * 
 * 4. ERROR HANDLING
 *    - If Ink render fails: log warning, return false (skip)
 *    - If terminal incompatible: fall back to returning false
 *    - Never throws errors (fail-open principle)
 * 
 * 5. LOGGING
 *    - Log "prompt.shown" event with reason when rendered
 *    - Log "prompt.decision" event with choice and timestamp when decided
 *    - Log "prompt.error" event if render fails
 *    - All logs to stderr via pino (structured JSON)
 * 
 * 6. PERFORMANCE
 *    - Render time: < 100ms target
 *    - Input latency: < 50ms target
 *    - Memory: Minimal (single component, cleaned up on unmount)
 */

/**
 * Internal state interface (not exported, for documentation only)
 * This interface documents the expected component state structure
 * but is not used directly in the contract implementation.
 */
// interface PromptState {
//   selection: 'create' | 'skip';
//   isActive: boolean;
//   reason: string;
// }

/**
 * Contract Tests (to be implemented):
 * 
 * packages/cli/src/ui/AnalysisPrompt.test.tsx:
 * 
 * ✓ renders with default selection on "Skip"
 * ✓ displays the reason text passed as prop
 * ✓ toggles selection when left/right arrow pressed
 * ✓ calls onSubmit(true) when 'y' key pressed
 * ✓ calls onSubmit(false) when 'n' key pressed
 * ✓ calls onSubmit(false) when Esc key pressed
 * ✓ calls onSubmit(false) when 'q' key pressed
 * ✓ calls onSubmit(true) when "Create ADR" selected and Enter pressed
 * ✓ calls onSubmit(false) when "Skip" selected and Enter pressed
 * ✓ unmounts cleanly after decision
 * ✓ handles empty reason string gracefully
 * ✓ handles very long reason strings (wrapping/truncation)
 */

