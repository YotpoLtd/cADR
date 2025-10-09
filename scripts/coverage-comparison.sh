#!/bin/bash

# Compare coverage between integration tests only vs all tests

echo "========================================"
echo "Coverage from INTEGRATION TESTS ONLY"
echo "========================================"
npm test -- --coverage --testPathPattern="integration" --coverageDirectory="coverage-integration" 2>&1 | tail -20

echo ""
echo "========================================"
echo "Coverage from ALL TESTS (Unit + Integration)"
echo "========================================"
npm test -- --coverage 2>&1 | tail -20

echo ""
echo "📊 Compare the two reports above to see how integration tests contribute!"
echo ""
echo "Integration tests should show significant coverage of:"
echo "  - git.ts (was 11%, should be ~60%)"
echo "  - config.ts (was 46%, should be ~70%)"
echo "  - analysis.ts (was 70%, should be ~75%)"

