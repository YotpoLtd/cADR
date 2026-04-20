# 3. Fail-Open Error Strategy

Date: 2026-03-01

## Status

Accepted

## Context

cADR runs as part of Git workflows -- typically as a post-commit hook or CI step.
Errors can come from many sources: missing API keys, network failures, LLM rate
limits, malformed responses, or context-length overflows. If any of these errors
caused the process to exit non-zero, they would block commits, pushes, or CI
pipelines, directly harming developer productivity.

## Decision

cADR follows a fail-open strategy: all errors are logged as warnings but never
cause a non-zero exit code or throw unhandled exceptions that would block the
user's Git workflow. The LLM abstraction layer returns structured error responses
(`{ result: null, error: string }`) rather than throwing, and callers handle the
absence of a result gracefully.

## Consequences

### Positive
- Developers are never blocked from committing or pushing because of an ADR tool failure.
- Transient issues (network timeouts, rate limits) resolve themselves on the next run.
- Trust in the tool increases because it stays out of the critical path.

### Negative
- Persistent misconfigurations (wrong API key, unsupported model) may go unnoticed if developers do not check logs.
- Silent failures mean some commits that warrant an ADR may slip through without one.
- Debugging requires reviewing structured log output rather than reading a stack trace.
