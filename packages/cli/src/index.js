"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWelcomeMessage = getWelcomeMessage;
exports.displayWelcome = displayWelcome;
// Note: For v0.0.1, we inline the core version. Future versions will properly bundle @cadr/core
var CORE_VERSION = '0.0.1';
function getWelcomeMessage() {
    var version = '0.0.1';
    return "\uD83C\uDF89 Hello, cADR!\n\ncADR (Continuous Architectural Decision Records) helps you automatically\ncapture and document architectural decisions as you code.\n\nVersion: ".concat(version, "\nCore: ").concat(CORE_VERSION, "\nLearn more: https://github.com/rbarabash/cADR\n\nGet started by running 'cadr --help' (coming in future versions!)\n");
}
function displayWelcome() {
    // Use process.stdout.write instead of console.log (Constitution: no console.log)
    process.stdout.write(getWelcomeMessage());
}
