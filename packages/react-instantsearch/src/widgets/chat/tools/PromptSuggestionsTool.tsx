import { createButtonComponent } from 'instantsearch-ui-components';
import React, { createElement } from 'react';

import type {
  ClientSideToolComponentProps,
  Pragma,
  UserClientSideTool,
} from 'instantsearch-ui-components';

export function createPromptSuggestionsTool(): UserClientSideTool {
  const Button = createButtonComponent({
    createElement: createElement as Pragma,
  });

  function PromptSuggestionsComponent({
    message,
    sendMessage,
  }: ClientSideToolComponentProps) {
    const input = message.input as { promptSuggestions?: string[] } | undefined;
    const promptSuggestions = input?.promptSuggestions;

    if (!promptSuggestions || promptSuggestions.length === 0) {
      return <></>;
    }

    return (
      <ul className="ais-ChatMessage-toolPromptSuggestions">
        {promptSuggestions.map((suggestion, index) => (
          <li key={index} style={{ marginBottom: '0.5rem' }}>
            <Button onClick={() => sendMessage(suggestion)}>
              {suggestion}
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  return {
    layoutComponent: PromptSuggestionsComponent,
    renderLast: true,
  };
}
