export const CORE_VERSION: string;
export const CLI_VERSION: string;
export function getStagedFiles(): Promise<string[]>;
export class Logger {
  info(message: string, context?: object): void;
  warn(message: string, context?: object): void;
  error(message: string, context?: object): void;
}
export const loggerInstance: Logger;
export class GitError extends Error {
  constructor(message: string, code: string, originalError?: Error);
  readonly code: string;
  readonly originalError?: Error;
}
