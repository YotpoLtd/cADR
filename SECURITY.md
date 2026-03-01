# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x     | Yes                |

Only the latest published release receives security updates.

## Reporting a Vulnerability

We take security issues seriously. If you discover a vulnerability in cADR,
please report it responsibly using one of the following methods:

1. **GitHub Security Advisories (preferred)** -- Open a draft advisory at
   <https://github.com/YotpoLtd/cADR/security/advisories/new>. This keeps the
   report private until a fix is available.
2. **Email** -- Send details to the maintainers listed in the repository's
   CODEOWNERS file. Include "cADR Security" in the subject line.

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof-of-concept.
- The version(s) affected, if known.

## Responsible Disclosure Timeline

- We will acknowledge receipt within **3 business days**.
- We aim to confirm the issue and provide an initial assessment within **10 business days**.
- A fix will be developed and released within **90 days** of confirmation.
- We will coordinate with the reporter before public disclosure.

## Scope

cADR is a CLI tool that reads Git diffs and sends them to LLM provider APIs.
The following areas are considered in scope for security reports:

- **API key and credential handling** -- Insecure storage, logging, or
  transmission of provider API keys and tokens.
- **Prompt injection** -- Crafted diffs or repository content that manipulate
  LLM behavior in unintended ways (e.g., exfiltrating environment variables
  through prompt responses).
- **Dependency vulnerabilities** -- Known CVEs in direct or transitive
  dependencies that are reachable from cADR's execution paths.
- **Arbitrary code execution** -- Any path by which cADR could execute
  untrusted code on the user's machine.
- **Information disclosure** -- Unintended leakage of file contents, environment
  variables, or other sensitive data beyond the expected diff payload.

The following are generally **out of scope**:

- Issues that require the attacker to already have local shell access with the
  same privileges as the cADR user.
- Vulnerabilities in the upstream LLM provider APIs themselves.
- Denial-of-service attacks against the local CLI process.

## Security Best Practices for Users

- Store API keys in environment variables or a secrets manager; avoid
  committing them to configuration files.
- Review cADR's output before incorporating generated ADRs into your repository.
- Keep cADR and its dependencies up to date.
