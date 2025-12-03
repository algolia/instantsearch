import React from 'react';
import { useHits, usePromptSuggestions } from 'react-instantsearch-core';

type PromptSuggestionsUiProps = {
  agentId: string;
};

export function PromptSuggestions({ agentId }: PromptSuggestionsUiProps) {
  const { items } = useHits();

  const { suggestions, status } = usePromptSuggestions({
    agentId,
    item: items[0],
  });

  return (
    <div>
      <span>Item: {JSON.stringify(items[0])}</span>
      <span>Status: {status}</span>

      {status === 'streaming' && <span>Loading suggestions...</span>}

      {status === 'ready' && suggestions.length > 0 && (
        <div>
          <h3>Suggestions:</h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
