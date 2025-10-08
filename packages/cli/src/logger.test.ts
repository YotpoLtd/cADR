import { Logger, loggerInstance } from './logger';

describe('LoggerModule', () => {
  // Suppress Pino logs during tests
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger class', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger();
    });

    it('should create logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should log info message without context', () => {
      // Just verify the method doesn't throw
      expect(() => logger.info('Test info message')).not.toThrow();
    });

    it('should log info message with context', () => {
      // Just verify the method doesn't throw
      expect(() => logger.info('Test info message', { userId: 123, action: 'test' })).not.toThrow();
    });

    it('should log warn message without context', () => {
      // Just verify the method doesn't throw
      expect(() => logger.warn('Test warning message')).not.toThrow();
    });

    it('should log warn message with context', () => {
      // Just verify the method doesn't throw
      expect(() => logger.warn('Test warning message', { warning: 'deprecated' })).not.toThrow();
    });

    it('should log error message without context', () => {
      // Just verify the method doesn't throw
      expect(() => logger.error('Test error message')).not.toThrow();
    });

    it('should log error message with context', () => {
      // Just verify the method doesn't throw
      expect(() => logger.error('Test error message', { error: 'validation failed' })).not.toThrow();
    });
  });

  describe('loggerInstance singleton', () => {
    it('should be an instance of Logger', () => {
      expect(loggerInstance).toBeDefined();
      expect(typeof loggerInstance.info).toBe('function');
      expect(typeof loggerInstance.warn).toBe('function');
      expect(typeof loggerInstance.error).toBe('function');
    });

    it('should log messages without throwing', () => {
      expect(() => loggerInstance.info('Singleton test message')).not.toThrow();
      expect(() => loggerInstance.warn('Warning message')).not.toThrow();
      expect(() => loggerInstance.error('Error message')).not.toThrow();
    });
  });

  describe('Pino logger functionality', () => {
    it('should use Pino for structured logging', () => {
      expect(() => loggerInstance.info('Pino test message', { test: true })).not.toThrow();
      expect(() => loggerInstance.warn('Pino warning', { level: 'warning' })).not.toThrow();
      expect(() => loggerInstance.error('Pino error', { error: 'test error' })).not.toThrow();
    });

    it('should handle various data types in context', () => {
      expect(() => loggerInstance.info('String context', { message: 'test' })).not.toThrow();
      expect(() => loggerInstance.info('Number context', { count: 42 })).not.toThrow();
      expect(() => loggerInstance.info('Boolean context', { enabled: true })).not.toThrow();
      expect(() => loggerInstance.info('Object context', { data: { nested: 'value' } })).not.toThrow();
      expect(() => loggerInstance.info('Array context', { items: [1, 2, 3] })).not.toThrow();
    });
  });
});
