# 4. Provider-Agnostic LLM Abstraction

Date: 2026-03-01

## Status

Accepted

## Context

cADR uses large language models to analyze diffs and generate ADR content. Different
teams prefer different providers -- OpenAI, Google Gemini, and others. Coupling the
analysis and generation logic directly to one provider's SDK would make it expensive
to add alternatives and would force users onto a single vendor.

## Decision

We introduced an `LLMProvider` interface in `packages/cli/src/providers/types.ts`
that every provider must implement. The interface exposes a single `analyze` method
accepting a prompt and `ProviderCallOptions` (API key, model name, timeout). A
provider registry (`providers/registry.ts`) maps provider names from configuration
to concrete implementations. The core logic in `llm.ts` calls `getProvider()` and
works only against the interface, with no direct imports of any provider SDK.

## Consequences

### Positive
- Adding a new provider requires only a new file implementing `LLMProvider` and a registry entry.
- Users switch providers via a single `provider` field in `cadr.yaml` with no code changes.
- Unit tests can supply a mock provider without patching SDK internals.

### Negative
- The interface is constrained to a lowest-common-denominator API; provider-specific features (streaming, function calling) are not exposed.
- Each new provider still needs its own SDK dependency, increasing bundle size.
- The abstraction adds a layer of indirection that new contributors must trace through.
