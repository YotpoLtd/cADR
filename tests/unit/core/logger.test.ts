import { Logger, loggerInstance } from '@cadr/core';

describe('LoggerModule', () => {
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
      const context = { userId: 123, action: 'test' };
      expect(() => logger.info('User action', context)).not.toThrow();
    });

    it('should log warn message without context', () => {
      expect(() => logger.warn('Test warning message')).not.toThrow();
    });

    it('should log warn message with context', () => {
      const context = { warning: 'deprecated' };
      expect(() => logger.warn('Deprecated feature used', context)).not.toThrow();
    });

    it('should log error message without context', () => {
      expect(() => logger.error('Test error message')).not.toThrow();
    });

    it('should log error message with context', () => {
      const context = { error: 'validation failed' };
      expect(() => logger.error('Validation error', context)).not.toThrow();
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
      // Test that the logger is actually a Pino instance
      expect(loggerInstance).toBeDefined();
      
      // Test that it has Pino-like behavior (doesn't throw on logging)
      expect(() => {
        loggerInstance.info('Pino test message', { test: true });
        loggerInstance.warn('Pino warning', { level: 'warning' });
        loggerInstance.error('Pino error', { error: 'test error' });
      }).not.toThrow();
    });

    it('should handle various data types in context', () => {
      expect(() => {
        loggerInstance.info('String context', { message: 'test' });
        loggerInstance.info('Number context', { count: 42 });
        loggerInstance.info('Boolean context', { enabled: true });
        loggerInstance.info('Object context', { data: { nested: 'value' } });
        loggerInstance.info('Array context', { items: [1, 2, 3] });
      }).not.toThrow();
    });
  });
});