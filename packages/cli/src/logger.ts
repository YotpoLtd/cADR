import pino from 'pino';

// Configure Pino to output JSON to stderr
const logger = pino({
  level: 'info',
  transport: {
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
