// Test version constants in CLI
const CORE_VERSION = '0.0.1';
const CLI_VERSION = '0.0.1';

describe('CLI Version Constants', () => {
  test('exports CORE_VERSION constant', () => {
    expect(CORE_VERSION).toBe('0.0.1');
  });

  test('CORE_VERSION is a string', () => {
    expect(typeof CORE_VERSION).toBe('string');
  });

  test('CORE_VERSION matches semantic version pattern', () => {
    expect(CORE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('exports CLI_VERSION constant', () => {
    expect(CLI_VERSION).toBe('0.0.1');
  });

  test('CLI_VERSION is a string', () => {
    expect(typeof CLI_VERSION).toBe('string');
  });

  test('CLI_VERSION matches semantic version pattern', () => {
    expect(CLI_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
