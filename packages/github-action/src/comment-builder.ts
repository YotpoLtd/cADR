import { SuggestedADR } from './types';

export class CommentBuilder {
  static readonly MARKER = '### 🤖 cADR Analysis';

  buildAnalysisComment(reason: string, adr: SuggestedADR): string {
    return `${CommentBuilder.MARKER}

I've reviewed the changes in this PR and detected an **architecturally significant change**:

> ${reason}

#### Suggested ADR

To document this decision, create the following file:

**\`${adr.path}\`**

<details>
<summary>Click to expand ADR content</summary>

\`\`\`markdown
${adr.content}
\`\`\`

</details>

**Next Steps:**
1. Copy the ADR content above
2. Create the file at \`${adr.path}\`
3. Commit and push to this PR
`;
  }

  buildNoChangeComment(): string {
    return `${CommentBuilder.MARKER}

No architecturally significant changes detected.
`;
  }
}
