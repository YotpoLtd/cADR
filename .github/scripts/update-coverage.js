#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read coverage summary
const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
const total = coverage.total;

// Helper functions
const formatPercent = (metric) => metric.pct.toFixed(2);
const getColor = (pct) => pct >= 80 ? 'brightgreen' : pct >= 60 ? 'yellow' : pct >= 40 ? 'orange' : 'red';

// Generate badge data
const coveragePct = formatPercent(total.lines);
const color = getColor(total.lines.pct);
const badgeUrl = `https://img.shields.io/badge/coverage-${coveragePct}%25-${color}`;

// Create coverage table
const table = `## Test Coverage

| Category | Percentage | Covered / Total |
|----------|------------|-----------------|
| Statements | ${formatPercent(total.statements)}% | ${total.statements.covered} / ${total.statements.total} |
| Branches | ${formatPercent(total.branches)}% | ${total.branches.covered} / ${total.branches.total} |
| Functions | ${formatPercent(total.functions)}% | ${total.functions.covered} / ${total.functions.total} |
| Lines | ${formatPercent(total.lines)}% | ${total.lines.covered} / ${total.lines.total} |

> Coverage report generated on ${new Date().toISOString().split('T')[0]}`;

// Save outputs
fs.writeFileSync('coverage-badge.txt', badgeUrl);
fs.writeFileSync('coverage-table.txt', table);

console.log('✅ Coverage report generated');
console.log('Badge URL:', badgeUrl);
console.log('\nCoverage Table:\n', table);

// Update README
const readmePath = path.join(process.cwd(), 'README.md');
let readme = fs.readFileSync(readmePath, 'utf-8');

// Update coverage badge
readme = readme.replace(
  /\[!\[Coverage\]\([^\)]+\)\]\([^\)]+\)/,
  `[![Coverage](${badgeUrl})](https://github.com/YotpoLtd/cADR/actions/workflows/test.yml)`
);

// Update coverage table
const coverageMarker = '<!-- COVERAGE_TABLE -->';
if (readme.includes(coverageMarker)) {
  const regex = new RegExp(`${coverageMarker}[\\s\\S]*?${coverageMarker}`, 'g');
  readme = readme.replace(regex, `${coverageMarker}\n${table}\n${coverageMarker}`);
}

fs.writeFileSync(readmePath, readme);
console.log('✅ README.md updated with coverage data');

