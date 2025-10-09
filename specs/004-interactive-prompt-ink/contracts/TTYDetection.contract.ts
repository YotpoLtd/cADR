/**
 * Contract: TTY Detection
 * 
 * Purpose: Determine whether the current environment supports interactive
 *          terminal display (TTY) and decide whether to show Ink UI or
 *          fall back to text output.
 * 
 * Story: #4 - Interactive Prompt
 * Date: 2025-01-09
 */

/**
 * Environment detection result
 */
export interface TTYEnvironment {
  /**
   * Whether stdout is a TTY (terminal device).
   * Derived from process.stdout.isTTY.
   */
  isTTY: boolean;

  /**
   * Whether running in a CI environment.
   * Derived from process.env.CI.
   */
  isCI: boolean;

  /**
   * Whether to show the interactive Ink prompt.
   * Computed as: isTTY && !isCI
   * 
   * If true: Render Ink UI
   * If false: Use text fallback
   */
  shouldShowPrompt: boolean;
}

/**
 * Detect TTY environment and determine if interactive prompt should be shown.
 * 
 * This function checks:
 * 1. process.stdout.isTTY - is this a terminal device?
 * 2. process.env.CI - is this a CI environment?
 * 
 * Decision logic:
 * - Show prompt if: TTY is available AND not running in CI
 * - Use fallback if: No TTY OR running in CI
 * 
 * @returns TTYEnvironment object with detection results
 * 
 * @example
 * ```typescript
 * import { detectTTY } from './utils/tty';
 * 
 * const env = detectTTY();
 * 
 * if (env.shouldShowPrompt) {
 *   // Show interactive Ink prompt
 *   const { promptForAdr } = await import('./ui/AnalysisPrompt');
 *   const decision = await promptForAdr(reason);
 * } else {
 *   // Print text fallback
 *   console.log('📊 Result: ✨ ARCHITECTURALLY SIGNIFICANT');
 *   console.log(`💭 Reasoning: ${reason}\n`);
 *   console.log('💡 Tip: Run in an interactive terminal to create an ADR.\n');
 * }
 * ```
 */
export function detectTTY(): TTYEnvironment;

/**
 * Implementation Specification:
 * 
 * function detectTTY(): TTYEnvironment {
 *   const isTTY = process.stdout.isTTY ?? false;
 *   const isCI = process.env.CI === 'true' || process.env.CI === '1';
 *   const shouldShowPrompt = isTTY && !isCI;
 *   
 *   return { isTTY, isCI, shouldShowPrompt };
 * }
 * 
 * Truth Table:
 * 
 * | isTTY | isCI  | shouldShowPrompt | Action            |
 * |-------|-------|------------------|-------------------|
 * | true  | false | true             | Show Ink prompt   |
 * | true  | true  | false            | Text fallback     |
 * | false | false | false            | Text fallback     |
 * | false | true  | false            | Text fallback     |
 */

/**
 * CI Environment Variables Detected:
 * 
 * The following environment variables indicate CI:
 * - CI=true or CI=1 (most CI systems)
 * - GITHUB_ACTIONS=true (GitHub Actions)
 * - GITLAB_CI=true (GitLab CI)
 * - CIRCLECI=true (CircleCI)
 * - JENKINS_HOME (Jenkins)
 * 
 * Decision: Only check process.env.CI for simplicity. All major CI
 *           platforms set this variable.
 */

/**
 * Rationale for Design Choices:
 * 
 * 1. WHY CHECK isTTY?
 *    - Ensures terminal supports interactive display
 *    - Prevents hanging when output is piped (e.g., `cadr analyze | tee log.txt`)
 *    - Ink won't render without TTY
 * 
 * 2. WHY CHECK CI?
 *    - CI environments often have TTY but shouldn't show interactive prompts
 *    - Prevents workflows from hanging waiting for user input
 *    - Ensures fail-open principle in automated environments
 * 
 * 3. WHY COMBINE WITH &&?
 *    - Prompt requires BOTH conditions: TTY available AND not CI
 *    - Fail-safe: When in doubt, use text fallback (safe)
 *    - False positives (show text when prompt would work) are acceptable
 *    - False negatives (show prompt in CI) are unacceptable
 */

/**
 * Contract Tests (to be implemented):
 * 
 * packages/cli/src/utils/tty.test.ts:
 * 
 * ✓ returns isTTY=true when process.stdout.isTTY is true
 * ✓ returns isTTY=false when process.stdout.isTTY is false/undefined
 * ✓ returns isCI=true when process.env.CI is 'true'
 * ✓ returns isCI=true when process.env.CI is '1'
 * ✓ returns isCI=false when process.env.CI is undefined
 * ✓ returns shouldShowPrompt=true when isTTY=true and isCI=false
 * ✓ returns shouldShowPrompt=false when isTTY=false
 * ✓ returns shouldShowPrompt=false when isCI=true (even if isTTY=true)
 * ✓ handles edge case: process.stdout.isTTY is undefined (treats as false)
 */

/**
 * Integration Test Scenarios:
 * 
 * tests/integration/prompt-interaction.test.ts:
 * 
 * ✓ Spawns CLI with CI=true, verifies text fallback used
 * ✓ Spawns CLI without CI, verifies appropriate behavior
 * ✓ Pipes CLI output, verifies no interactive prompt (no TTY)
 * ✓ Verifies logging includes TTY detection results
 */

