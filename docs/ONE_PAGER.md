## **One-Pager: cADR (Continuous ADR)**

### **TL;DR**

**cADR** is a CLI tool and GitHub Agent that analyzes code changes to intelligently decide if an Architectural Decision Record (ADR) is needed, then drafts a suggestion for the developer to review and commit.

-----

### **Problem Statement**

Significant architectural decisions are frequently made during development, but their context and reasoning are rarely documented. This undocumented architectural debt leads to measurable inefficiencies. Teams spend an estimated **5-10 hours per quarter** debating historical technical decisions, and new hire onboarding is delayed by an average of **2 weeks** due to a lack of architectural context. This creates knowledge silos and increases the risk of building on flawed or misunderstood precedents.

-----

### **Proposed Solution**

**cADR** is an LLM-powered system that integrates directly into the developer workflow to capture architectural decisions at the moment they are made.

* **Local CLI Journey:**

    1. A developer runs `git commit`.
    2. The `cadr` pre-commit hook intercepts the commit.
    3. The code `diff` is sent to an LLM for analysis.
    4. If the change is deemed significant, the developer is prompted to approve the creation of an ADR.
    5. If approved, a second LLM call drafts the ADR, and the file is created locally.

* **GitHub Agent Journey:**

    1. A developer opens a Pull Request.
    2. A `gh-aw` agentic workflow is triggered.
    3. The agent analyzes the PR's diff.
    4. If the change is significant, the agent drafts an ADR.
    5. The agent posts a review comment on the PR with the new ADR file included as a "suggestion," allowing for one-click approval.

-----

### **Goals (SMART)**

* **Adoption:** Achieve integration of `cADR` in **50%** of active, core service repositories within **6 months** of launch.
* **Documentation Velocity:** Increase the number of ADRs created for major features by **25%** within **9 months**, measured against a 12-month pre-launch baseline.
* **Developer Satisfaction:** Achieve an average developer satisfaction score of **4.0/5.0 or higher** on the question, "How helpful is cADR in improving our documentation practices?" in the first two quarterly engineering surveys post-launch.

-----

### **Non-Goals & Future Considerations**

* **V1 Non-Goals:** Blocking CI/CD pipelines, autonomous commits without user review, support for SCMs other than GitHub.
* **Future Considerations (Post-V1):** A VS Code extension for real-time suggestions, integrations with project management tools (e.g., Jira), using embeddings of the existing codebase for more contextual analysis.
