import { CORE_VERSION } from '@cadr/core';

export function getWelcomeMessage(): string {
  const version = '0.0.1';

  return `🎉 Hello, cADR!

cADR (Continuous Architectural Decision Records) helps you automatically
capture and document architectural decisions as you code.

Version: ${version}
Core: ${CORE_VERSION}
Learn more: https://github.com/rbarabash/cADR

Get started by running 'cadr --help' (coming in future versions!)
`;
}

export function displayWelcome(): void {
  // Use process.stdout.write instead of console.log (Constitution: no console.log)
  process.stdout.write(getWelcomeMessage());
}
