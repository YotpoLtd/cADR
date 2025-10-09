import React, { useState } from 'react';
import { Box, Text, useInput, render } from 'ink';

export interface AnalysisPromptProps {
  reason: string;
  onSubmit: (createAdr: boolean) => void;
}

function Prompt({ reason, onSubmit }: AnalysisPromptProps) {
  const [selected, setSelected] = useState<'create' | 'skip'>('skip');

  useInput((input: string, key: any) => {
    const i = (input || '').toLowerCase();
    
    // Direct shortcuts
    if (i === 'y') onSubmit(true);
    else if (i === 'n' || key.escape || i === 'q') onSubmit(false);
    
    // Menu navigation
    else if (key.leftArrow || key.rightArrow) {
      setSelected(s => (s === 'create' ? 'skip' : 'create'));
    }
    else if (key.return) {
      onSubmit(selected === 'create');
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="whiteBright">Architecturally Significant Change Detected</Text>
      </Box>
      <Box marginBottom={1}>
        <Text color="gray">Reason: {reason || '—'}</Text>
      </Box>
      <Box>
        <Text color={selected === 'skip' ? 'cyan' : 'gray'}>
          {selected === 'skip' ? '▶ ' : '  '}Skip
        </Text>
        <Text>   </Text>
        <Text color={selected === 'create' ? 'cyan' : 'gray'}>
          {selected === 'create' ? '▶ ' : '  '}Create ADR
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">Use ←/→, Enter (y/n also works)</Text>
      </Box>
    </Box>
  );
}

export function promptForAdr(reason: string): Promise<boolean> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <Prompt reason={reason} onSubmit={(decision) => {
        resolve(decision);
        unmount();
      }} />
    );
  });
}