
## **Product Requirements Document (PRD): cADR**

### **1. User Personas**

**Persona: Alex, the Senior Engineer**

* **Background:** Alex has 8 years of experience and is a tech lead on a team of 5 engineers working on a suite of Node.js microservices. She spends her days writing code for complex features, mentoring two mid-level developers, and reviewing 5-10 pull requests per day.
* **Narrative:** "Last quarter, we had a major outage because a junior developer removed a database index, not realizing it was added two years ago to solve a critical performance issue. The original decision was never documented in an ADR. I had to spend a full day digging through old commits and Slack messages to figure out *why* it was there. It's exhausting being the single point of failure for our team's architectural history."

-----

### **2. Functional Requirements**

* **FR1: LLM-Powered Change Analysis**

  * The system MUST send the full `git diff` of staged changes to an LLM.
  * The system MUST use a dedicated "analysis prompt" to instruct the LLM.
  * The LLM's response MUST be parsed from a specific JSON schema: `{ "is_significant": boolean, "reason": string }`.
  * The LLM API call MUST have a configurable timeout (default: 15 seconds).
  * The system MUST gracefully handle API errors or timeouts, defaulting to a non-blocking "fail open" state.

* **FR2: Interactive CLI Prompt**

  * The CLI MUST use the `reason` from the analysis response in its prompt to the user.
  * The CLI MUST accept 'y'/'Y' as confirmation and 'n'/'N' as rejection.
  * The CLI MUST wait indefinitely for user input.

* **FR3: GitHub PR Interaction**

  * The GitHub Agent MUST be triggered on `pull_request` events (`opened`, `synchronize`).
  * The Agent MUST be able to post review comments to the triggering PR.
  * The Agent MUST use GitHub's "suggested changes" feature to propose the new ADR file, allowing for easy acceptance by the developer.

* **FR4: LLM-Powered Content Generation**

  * The system MUST use a dedicated "generation prompt" for drafting the ADR.
  * The generation prompt MUST instruct the LLM to follow the standard ADR format (Context, Decision, Consequences).

* **FR5: File Creation**

  * The system MUST use the `adr-tools` CLI if it is available on the system PATH.
  * If `adr-tools` is not found, the system SHOULD fall back to creating a simple, numbered markdown file in the `/docs/adr` directory.

-----

### **3. UX/Design & Configuration**

* **`cadr.yml` Configuration File:**

    ```yaml
    # The LLM provider to use. Required.
    # Supported: "openai", "anthropic", "google"
    provider: "anthropic"

    # The specific model for analysis. Required.
    analysis_model: "claude-3-haiku-20240307"

    # The specific model for generation. Required.
    generation_model: "claude-3-sonnet-20240229"

    # A list of glob patterns to explicitly ignore during analysis. Optional.
    ignore_patterns:
      - "**.md"
      - "package-lock.json"
      - "poetry.lock"
    ```

* **CLI Copy:**

  * **Prompt:** `🤖 cADR has detected a significant change: [reason]. Would you like to create a draft ADR for this? (y/n)`
  * **Spinner Text:** `🧠 The agent is thinking...`
  * **Success Message:** `✅ Success! Draft created at: [filepath]`
  * **Error Message:** `⚠️ Warning: cADR could not connect to the LLM. Allowing commit to proceed.`
  * **Help Text (`cadr --help`):**

        ```
        Usage: cadr [command]

        Commands:
          check   (Default) Run analysis against staged git files.
          init    Create a default cadr.yml configuration file.
        ```

* **GitHub Agent Comment:**

  > ### 🤖 cADR Analysis

    > I've reviewed the changes in this PR and believe they introduce a significant architectural decision:

    > > *[reason from LLM]*

    > To ensure this is documented, I've drafted an ADR. Please review the suggestion below and click "Commit suggestion" to add it to your pull request.

    >

    > -----

    > ```suggestion
    > ---
    > path: docs/adr/XXXX-new-adr-title.md
    > ---
    > # ADR XXXX: New ADR Title
    > ```

  > ## Context

    > ...

    > ```
    > ```
