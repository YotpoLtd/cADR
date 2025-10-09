import pino from 'pino';

// Configure Pino to be silent by default (or verbose if --verbose flag is present)
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
const isTest = process.env.NODE_ENV === 'test';

const logger = pino({
  level: isTest || !isVerbose ? 'silent' : 'info',
  transport: isTest || !isVerbose ? undefined : {
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
