#!/usr/bin/env node

// Executable wrapper for cadr-cli
// This file is the entry point when running 'cadr' command

const { displayWelcome } = require('../dist/index.js');

displayWelcome();
process.exit(0);

