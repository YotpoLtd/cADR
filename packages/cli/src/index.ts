// Note: For v0.0.1, we inline the core version. Future versions will properly bundle @cadr/core
const CORE_VERSION = '0.0.1';

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
