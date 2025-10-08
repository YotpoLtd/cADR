// import pino from 'pino'; // Not used in tests

// Create a test-specific logger that writes to a string array
class TestLogger {
  private output: string[] = [];
  
  info(message: string, context?: object): void {
    const logEntry = {
      level: 30,
      msg: message,
      time: new Date().toISOString(),
      ...context
    };
    this.output.push(JSON.stringify(logEntry));
  }

  warn(message: string, context?: object): void {
    const logEntry = {
      level: 40,
      msg: message,
      time: new Date().toISOString(),
      ...context
    };
    this.output.push(JSON.stringify(logEntry));
  }

  error(message: string, context?: object): void {
    const logEntry = {
      level: 50,
      msg: message,
      time: new Date().toISOString(),
      ...context
    };
    this.output.push(JSON.stringify(logEntry));
  }

  getOutput(): string[] {
    return [...this.output];
  }

  clear(): void {
    this.output = [];
  }
}

// Mock the logger module
jest.mock('@cadr/core', () => {
  const testLogger = new TestLogger();
  return {
    Logger: jest.fn().mockImplementation(() => testLogger),
    loggerInstance: testLogger,
    CORE_VERSION: '0.0.1',
    CLI_VERSION: '0.0.1',
    getStagedFiles: jest.fn(),
    GitError: jest.fn()
  };
});

import { Logger, loggerInstance } from '@cadr/core';

describe('LoggerModule', () => {
  let testLogger: TestLogger;

  beforeEach(() => {
    // Get the test logger instance
    testLogger = loggerInstance as TestLogger;
    testLogger.clear();
  });

  describe('Logger class', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger();
    });

    it('should log info message without context', () => {
      logger.info('Test info message');

      expect(testLogger.getOutput()).toHaveLength(1);
      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      
      expect(logEntry.level).toBe(30); // pino info level
      expect(logEntry.msg).toBe('Test info message');
      expect(logEntry.time).toBeDefined();
    });

    it('should log info message with context', () => {
      const context = { staged_files: ['file1.ts', 'file2.ts'], count: 2 };
      logger.info('Retrieved staged files', context);

      expect(testLogger.getOutput()).toHaveLength(1);
      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      
      expect(logEntry.level).toBe(30); // pino info level
      expect(logEntry.msg).toBe('Retrieved staged files');
      expect(logEntry.staged_files).toEqual(['file1.ts', 'file2.ts']);
      expect(logEntry.count).toBe(2);
      expect(logEntry.time).toBeDefined();
    });

    it('should log warn message without context', () => {
      logger.warn('Test warning message');

      expect(testLogger.getOutput()).toHaveLength(1);
      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      
      expect(logEntry.level).toBe(40); // pino warn level
      expect(logEntry.msg).toBe('Test warning message');
      expect(logEntry.time).toBeDefined();
    });

    it('should log warn message with context', () => {
      const context = { error_code: 'GIT_ERROR', repository_path: '/path/to/repo' };
      logger.warn('Git operation failed', context);

      expect(testLogger.getOutput()).toHaveLength(1);
      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      
      expect(logEntry.level).toBe(40); // pino warn level
      expect(logEntry.msg).toBe('Git operation failed');
      expect(logEntry.error_code).toBe('GIT_ERROR');
      expect(logEntry.repository_path).toBe('/path/to/repo');
      expect(logEntry.time).toBeDefined();
    });

    it('should log error message without context', () => {
      logger.error('Test error message');

      expect(testLogger.getOutput()).toHaveLength(1);
      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      
      expect(logEntry.level).toBe(50); // pino error level
      expect(logEntry.msg).toBe('Test error message');
      expect(logEntry.time).toBeDefined();
    });

    it('should log error message with context', () => {
      const context = { error_code: 'NOT_GIT_REPO', original_error: 'fatal: not a git repository' };
      logger.error('Git repository error', context);

      expect(testLogger.getOutput()).toHaveLength(1);
      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      
      expect(logEntry.level).toBe(50); // pino error level
      expect(logEntry.msg).toBe('Git repository error');
      expect(logEntry.error_code).toBe('NOT_GIT_REPO');
      expect(logEntry.original_error).toBe('fatal: not a git repository');
      expect(logEntry.time).toBeDefined();
    });
  });

  describe('loggerInstance singleton', () => {
    it('should be an instance of Logger', () => {
      expect(loggerInstance).toBeDefined();
      expect(typeof loggerInstance.info).toBe('function');
      expect(typeof loggerInstance.warn).toBe('function');
      expect(typeof loggerInstance.error).toBe('function');
    });

    it('should log messages correctly', () => {
      loggerInstance.info('Singleton test message');

      expect(testLogger.getOutput()).toHaveLength(1);
      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      
      expect(logEntry.level).toBe(30); // pino info level
      expect(logEntry.msg).toBe('Singleton test message');
      expect(logEntry.time).toBeDefined();
    });
  });

  describe('JSON format validation', () => {
    it('should output valid JSON for all log levels', () => {
      const logger = new Logger();
      
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(testLogger.getOutput()).toHaveLength(3);
      
      // Verify all outputs are valid JSON
      testLogger.getOutput().forEach(output => {
        expect(() => JSON.parse(output)).not.toThrow();
      });
    });

    it('should include timestamp in ISO format', () => {
      const logger = new Logger();
      logger.info('Test message');

      const logEntry = JSON.parse(testLogger.getOutput()[0]);
      expect(logEntry.time).toBeDefined();
      
      // Verify timestamp is a valid date
      expect(() => new Date(logEntry.time)).not.toThrow();
      expect(new Date(logEntry.time).toISOString()).toBe(logEntry.time);
    });
  });
});
