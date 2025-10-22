# Testing Guide

Comprehensive guide to testing cADR.

## Testing Philosophy

cADR uses a pragmatic testing approach:

1. **Integration tests provide primary coverage** - Test real workflows and user scenarios
2. **Unit tests for complex logic** - Test algorithms, parsing, validation
3. **Fail-open behavior must be tested** - Ensure errors never block users
4. **Real external dependencies in integration tests** - Test actual LLM interactions
5. **Fast feedback loop** - Tests should run quickly for rapid development

## Running Tests

### Run All Tests

Runs both unit and integration tests using your test runner.

### Run Unit Tests Only

Faster feedback for development - runs in ~5-10 seconds.

### Run Integration Tests Only

Tests real workflows - takes 30-60 seconds with LLM calls.

### Run Specific Test File

Run individual test files by path or pattern.

### Watch Mode (Development)

Automatically reruns tests on file changes.

### Coverage Reports

Generates coverage reports with HTML, terminal summary, and JSON formats.

### Coverage by Test Type

Compare coverage between integration and unit tests to understand what each type contributes.

> 💡 **Note**: Integration tests typically provide 60-70% of overall coverage because they test real code paths.

## Resources

- **[Jest Documentation](https://jestjs.io/)** - Testing framework
- **[Testing Library](https://testing-library.com/)** - Testing utilities
- **[Test Doubles](https://martinfowler.com/bliki/TestDouble.html)** - Mocking patterns

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Usage Guide](./docs/USAGE.md)

