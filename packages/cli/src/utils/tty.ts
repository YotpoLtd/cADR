export interface TTYEnvironment {
  isTTY: boolean;
  isCI: boolean;
  shouldShowPrompt: boolean;
}

export function detectTTY(): TTYEnvironment {
  const isTTY = process.stdout.isTTY ?? false;
  const isCI = process.env.CI === 'true' || process.env.CI === '1';
  const shouldShowPrompt = isTTY && !isCI;
  
  return { isTTY, isCI, shouldShowPrompt };
}