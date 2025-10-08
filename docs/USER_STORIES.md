## **User Story Backlog: cADR (Core MVP for CLI)**

### **Story #1: "Hello, World!" - A deployable package**

> **As a developer**, I want to install `cadr-cli` via NPM and run its command to see a "Hello, cADR!" message, **so that we can verify the CI/CD release pipeline and public installation process works correctly.**

* **Definition of Done:**
  * [ ] `package.json` is configured for a public release with a `bin` entry.
  * [ ] The `release.yml` GitHub Action successfully publishes `v0.0.1` to NPM.
  * [ ] A developer can run `npx cadr@0.0.1` and see the welcome message.
  * [ ] The code is peer-reviewed in a Pull Request.

-----

### **Story \#2: Internal Plumbing - Read staged files and log**

> **As a developer**, I want `cadr` to read the list of staged files and print them using our structured logger, **so that we prove the application can interact with Git and produce its core output.**

* **Definition of Done:**
  * [x] The `cadr-cli` package contains a `GitModule` that correctly returns staged file paths.
  * [x] The `cadr-cli` package contains a `LoggerModule` that outputs valid JSON to `stderr`.
  * [x] The `cadr-cli` entrypoint successfully integrates these modules.
  * [x] Unit tests are written for the `GitModule` and `LoggerModule`, mocking external dependencies.
  * [x] All previous DoD criteria (CI, PR review, linting) are met.

-----

### **Story \#3: The Reasoning Engine - LLM-Powered Analysis**

> **As Alex the developer**, I want `cadr` to send my staged code changes to an LLM for **analysis**, so that the tool can intelligently decide if the changes are architecturally significant.

* **Definition of Done:**
  * [ ] The `cadr-cli` package contains an `LLMClient` that can call the configured LLM with the `v1` analysis prompt.
  * [ ] The client correctly parses the `{"is_significant": boolean, "reason": string}` response.
  * [ ] The "fail-open" principle is implemented: if the LLM call fails, a `WARN` is logged and the process exits with code 0.
  * [ ] Integration tests mock the LangChain client and verify the logic for both `true` and `false` responses.
  * [ ] All secrets (API keys) are loaded from environment variables.
  * [ ] All previous DoD criteria are met.

-----

### **Story \#4: The Interactive Prompt**

> **As Alex the developer**, when `cadr` detects a significant change, I want to be presented with an interactive prompt asking if I'd like to create an ADR, **so that I am in control of the decision-making process.**

* **Definition of Done:**
  * [ ] The `cadr-cli` package integrates `Ink` and `React`.
  * [ ] An Ink UI component correctly renders the prompt, including the dynamic `reason` string from the analysis step.
  * [ ] The application correctly handles 'y' and 'n' inputs, exiting or proceeding as required.
  * [ ] An end-to-end test is created that simulates the CLI execution and user input.
  * [ ] All previous DoD criteria are met.

-----

### **Story \#5: The Payoff - Generation**

> **As Alex the developer**, after I confirm 'y' at the prompt, I want `cadr` to call an LLM with my code changes and use the response to create a new draft ADR file, **so that the primary value of the tool is delivered.**

* **Definition of Done:**
  * [ ] A loading spinner is correctly displayed in the Ink UI during the second LLM call.
  * [ ] The `cadr-cli` package contains logic to call the `v1` generation prompt.
  * [ ] The `cadr-cli` package contains an `ADRGenerator` module that can successfully call `adr-tools` to create a markdown file.
  * [ ] The `cadr-cli` displays a final success message with the new file path.
  * [ ] The entire flow is covered by an end-to-end test (mocking the LLM and `adr-tools` calls).
  * [ ] The "fail-open" principle is upheld at every step.
  * [ ] All previous DoD criteria are met.
