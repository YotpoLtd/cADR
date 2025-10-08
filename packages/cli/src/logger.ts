import pino from 'pino';

// Configure Pino to output JSON to stderr (or be silent in tests)
const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport: process.env.NODE_ENV === 'test' ? undefined : {
    target: 'pino/file',
    options: { destination: 2 } // stderr
  }
});

export class Logger {
  info(message: string, context?: object): void {
    if (context) {
      logger.info(context, message);
    } else {
      logger.info(message);
    }
  }

  warn(message: string, context?: object): void {
    if (context) {
      logger.warn(context, message);
    } else {
      logger.warn(message);
    }
  }

  error(message: string, context?: object): void {
    if (context) {
      logger.error(context, message);
    } else {
      logger.error(message);
    }
  }
}

// Export singleton logger instance
export const loggerInstance = new Logger();
