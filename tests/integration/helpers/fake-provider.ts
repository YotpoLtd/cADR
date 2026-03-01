import type { LLMProvider, ProviderCallOptions } from '../../../packages/cli/src/providers/types';

export const SIGNIFICANT_JSON = JSON.stringify({
  is_significant: true,
  reason: 'Introduces new database dependency',
  confidence: 0.92,
});

export const NOT_SIGNIFICANT_JSON = JSON.stringify({
  is_significant: false,
  reason: 'Minor refactor',
  confidence: 0.15,
});

export const VALID_ADR_MARKDOWN = `# Use PostgreSQL for Data Storage

* Status: accepted
* Date: 2025-01-01

## Context and Problem Statement

The application needs persistent data storage for user accounts and transactions.

## Decision Drivers

* Data integrity requirements
* Query complexity
* Team familiarity

## Considered Options

* PostgreSQL
* MongoDB
* SQLite

## Decision Outcome

Chosen option: "PostgreSQL", because it provides strong ACID guarantees.

### Consequences

* Good, because strong data integrity
* Good, because mature ecosystem
* Bad, because requires separate server process

## More Information

Related files changed in this PR introduce the pg dependency.`;

export interface FakeProviderConfig {
  analysisResponse?: string;
  generationResponse?: string;
  shouldThrow?: Error;
  throwOnCall?: number;
}

export function createFakeProvider(config: FakeProviderConfig = {}): LLMProvider & { analyze: jest.Mock } {
  let callCount = 0;
  const analyze = jest.fn(async (_prompt: string, _options: ProviderCallOptions): Promise<string | undefined> => {
    callCount++;
    if (config.shouldThrow && (!config.throwOnCall || callCount === config.throwOnCall)) {
      throw config.shouldThrow;
    }
    if (callCount === 1) {
      return config.analysisResponse ?? NOT_SIGNIFICANT_JSON;
    }
    return config.generationResponse ?? VALID_ADR_MARKDOWN;
  });

  return { name: 'openai' as const, analyze };
}
