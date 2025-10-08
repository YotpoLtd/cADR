# LoggerModule Contract

**Module**: `packages/cli/src/logger.ts`
**Purpose**: Provide structured JSON logging to stderr
**Version**: 1.0.0

## Interface

```typescript
export interface LoggerModule {
  /**
   * Log an info message with optional context
   * @param message Human-readable message
   * @param context Optional structured data
   */
  info(message: string, context?: object): void;

  /**
   * Log a warning message with optional context
   * @param message Human-readable message
   * @param context Optional structured data
   */
  warn(message: string, context?: object): void;

  /**
   * Log an error message with optional context
   * @param message Human-readable message
   * @param context Optional structured data
   */
  error(message: string, context?: object): void;
}

export interface LogEntry {
  timestamp: string; // ISO 8601 format
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: object;
}
```

## Implementation Requirements

### Output Format

**Target**: stderr (file descriptor 2)  
**Format**: JSON Lines (one JSON object per line)  
**Library**: Pino for performance and reliability

### Log Schema

Each log entry MUST follow this structure:
```json
{
  "timestamp": "2025-01-27T10:30:00.000Z",
  "level": "info",
  "message": "Retrieved staged files",
  "context": {
    "staged_files": ["src/index.ts", "package.json"],
    "count": 2
  }
}
```

### Configuration

```typescript
const pino = require('pino');
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino/file',
    options: { destination: 2 } // stderr
  }
});
```

## Usage Example

```typescript
import { loggerInstance } from './logger';

// Simple message
loggerInstance.info('Starting cADR analysis');

// Message with context
loggerInstance.info('Retrieved staged files', {
  staged_files: ['src/index.ts', 'package.json'],
  count: 2
});

// Error with context
loggerInstance.error('Failed to read Git repository', {
  error_code: 'NOT_GIT_REPO',
  repository_path: '/path/to/repo'
});
```

## Testing Requirements

**Unit Tests Must Cover**:
- JSON output format validation
- Timestamp presence and format
- Log level handling (info, warn, error)
- Context object serialization
- stderr output verification

**Test Strategy**:
- Capture stderr output
- Parse JSON lines
- Validate schema compliance
- Test context serialization

## Performance Requirements

- Logging should not block CLI execution
- JSON serialization should be <1ms for typical messages
- Memory usage should be minimal
- No performance impact on CLI responsiveness
