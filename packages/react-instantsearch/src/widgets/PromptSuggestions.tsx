import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, useEffect } from 'react';
import { useHits, useChat } from 'react-instantsearch-core';

import type { Pragma } from 'instantsearch-ui-components';

const PromptSuggestionsUiComponent = createPromptSuggestionsComponent({
  createElement: createElement as Pragma,
});

type PromptSuggestionsUiProps = {
  agentId: string;
};

export function PromptSuggestions({ agentId }: PromptSuggestionsUiProps) {
  const { items } = useHits();

  const { suggestions, messages, sendMessage, status } = useChat({
    agentId,
  });

  useEffect(() => {
    if (items.length > 0 && messages.length === 0) {
      const objectToSend = items[0];
      sendMessage({
        text: JSON.stringify(objectToSend),
      });
    }
  }, [items, messages.length, sendMessage]);

  return (
    <PromptSuggestionsUiComponent
      status={status}
      suggestions={suggestions}
      onSuggestionClick={(suggestion) => {
        sendMessage({ text: suggestion });
      }}
    />
  );
}
