import { CommentBuilder } from '../src/comment-builder';
import { SuggestedADR } from '../src/types';

describe('CommentBuilder', () => {
  const builder = new CommentBuilder();
  
  it('should build analysis comment for significant changes', () => {
    const reason = 'This change introduces a new dependency.';
    const adr: SuggestedADR = {
      number: 5,
      title: 'Use Redis',
      filename: '0005-use-redis.md',
      path: 'docs/adr/0005-use-redis.md',
      content: '# Use Redis\n\nDecision: Use Redis',
      commitMessage: 'docs: add ADR 0005'
    };
    
    const comment = builder.buildAnalysisComment(reason, adr);
    
    expect(comment).toContain('### 🤖 cADR Analysis');
    expect(comment).toContain('**architecturally significant change**');
    expect(comment).toContain('> This change introduces a new dependency.');
    expect(comment).toContain('**`docs/adr/0005-use-redis.md`**');
    expect(comment).toContain('<details>');
    expect(comment).toContain('# Use Redis');
  });

  it('should build comment for non-significant changes if needed', () => {
    // Note: Usually we don't post comments for non-significant changes,
    // but this method might be useful for verbose mode or debugging
    const comment = builder.buildNoChangeComment();
    expect(comment).toContain('No architecturally significant changes detected');
  });
});
