#!/usr/bin/env node

// Executable wrapper for cadr-cli
// This file is the entry point when running 'cadr' command

const { displayWelcome, processStagedFiles } = require('../dist/index.js');

// Display welcome message first
displayWelcome();

// Then process staged files
processStagedFiles().catch((error) => {
  console.error('Failed to process staged files:', error.message);
  process.exit(1);
});

