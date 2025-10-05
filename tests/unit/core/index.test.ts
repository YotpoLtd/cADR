import { CORE_VERSION } from '../../../packages/core/src/index';

describe('Core Package', () => {
  test('exports CORE_VERSION constant', () => {
    expect(CORE_VERSION).toBe('0.0.1');
  });

  test('CORE_VERSION is a string', () => {
    expect(typeof CORE_VERSION).toBe('string');
  });

  test('CORE_VERSION matches semantic version pattern', () => {
    expect(CORE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

