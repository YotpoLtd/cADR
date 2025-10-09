import { detectTTY } from './tty';

// Type for mocking process.stdout.isTTY in tests
interface MockableWriteStream {
  isTTY?: boolean;
}

describe('TTY Detection', () => {
  let originalTTY: boolean | undefined;
  let originalCI: string | undefined;

  beforeEach(() => {
    // Store original values
    originalTTY = process.stdout.isTTY;
    originalCI = process.env.CI;
  });

  afterEach(() => {
    // Restore original values
    (process.stdout as MockableWriteStream).isTTY = originalTTY;
    if (originalCI !== undefined) {
      process.env.CI = originalCI;
    } else {
      delete process.env.CI;
    }
  });

  describe('isTTY detection', () => {
    test('returns isTTY=true when process.stdout.isTTY is true', () => {
      (process.stdout as MockableWriteStream).isTTY = true;
      delete process.env.CI;

      const result = detectTTY();
      expect(result.isTTY).toBe(true);
    });

    test('returns isTTY=false when process.stdout.isTTY is false', () => {
      (process.stdout as MockableWriteStream).isTTY = false;
      delete process.env.CI;

      const result = detectTTY();
      expect(result.isTTY).toBe(false);
    });

    test('returns isTTY=false when process.stdout.isTTY is undefined', () => {
      (process.stdout as MockableWriteStream).isTTY = undefined;
      delete process.env.CI;

      const result = detectTTY();
      expect(result.isTTY).toBe(false);
    });
  });

  describe('CI detection', () => {
    test('returns isCI=true when process.env.CI is "true"', () => {
      (process.stdout as MockableWriteStream).isTTY = true;
      process.env.CI = 'true';

      const result = detectTTY();
      expect(result.isCI).toBe(true);
    });

    test('returns isCI=true when process.env.CI is "1"', () => {
      (process.stdout as MockableWriteStream).isTTY = true;
      process.env.CI = '1';

      const result = detectTTY();
      expect(result.isCI).toBe(true);
    });

    test('returns isCI=false when process.env.CI is undefined', () => {
      (process.stdout as MockableWriteStream).isTTY = true;
      delete process.env.CI;

      const result = detectTTY();
      expect(result.isCI).toBe(false);
    });

    test('returns isCI=false when process.env.CI is other values', () => {
      (process.stdout as MockableWriteStream).isTTY = true;
      process.env.CI = 'false';

      const result = detectTTY();
      expect(result.isCI).toBe(false);
    });
  });

  describe('shouldShowPrompt logic', () => {
    test('returns shouldShowPrompt=true when isTTY=true and isCI=false', () => {
      (process.stdout as MockableWriteStream).isTTY = true;
      delete process.env.CI;

      const result = detectTTY();
      expect(result.shouldShowPrompt).toBe(true);
      expect(result.isTTY).toBe(true);
      expect(result.isCI).toBe(false);
    });

    test('returns shouldShowPrompt=false when isTTY=false', () => {
      (process.stdout as MockableWriteStream).isTTY = false;
      delete process.env.CI;

      const result = detectTTY();
      expect(result.shouldShowPrompt).toBe(false);
    });

    test('returns shouldShowPrompt=false when isCI=true (even if isTTY=true)', () => {
      (process.stdout as MockableWriteStream).isTTY = true;
      process.env.CI = 'true';

      const result = detectTTY();
      expect(result.shouldShowPrompt).toBe(false);
      expect(result.isTTY).toBe(true);
      expect(result.isCI).toBe(true);
    });

    test('returns shouldShowPrompt=false when both isTTY=false and isCI=true', () => {
      (process.stdout as MockableWriteStream).isTTY = false;
      process.env.CI = 'true';

      const result = detectTTY();
      expect(result.shouldShowPrompt).toBe(false);
    });
  });
});