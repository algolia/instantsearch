import { createChatPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChatPageSuggestions } from 'react-instantsearch-core';

import type {
  ChatPromptSuggestionsClassNames,
  Pragma,
} from 'instantsearch-ui-components';
import type { UseChatPageSuggestionsProps } from 'react-instantsearch-core';

const ChatPromptSuggestionsUi = createChatPromptSuggestionsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatPageSuggestionsProps = UseChatPageSuggestionsProps & {
  classNames?: Partial<ChatPromptSuggestionsClassNames>;
  /**
   * Number of skeleton placeholder pills shown while loading.
   * @default maxSuggestions
   */
  skeletonCount?: number;
  /**
   * Optional custom pill renderer. Receives the prompt text, the click
   * handler, and whether the pill is disabled (mid-stream chat).
   */
  pillComponent?: (props: {
    prompt: string;
    onClick: () => void;
    disabled: boolean;
  }) => JSX.Element;
};

export function ChatPageSuggestions({
  classNames = {},
  skeletonCount,
  pillComponent: PillComponent,
  ...connectorProps
}: ChatPageSuggestionsProps) {
  const { suggestions, isLoading, onSuggestionClick, canHandoff } =
    useChatPageSuggestions(connectorProps, {
      $$widgetType: 'ais.chatPageSuggestions',
    });

  if (PillComponent) {
    if (suggestions.length === 0) {
      return null;
    }
    return (
      <div className="ais-ChatPromptSuggestions">
        {suggestions.map((prompt, index) => (
          <PillComponent
            key={index}
            prompt={prompt}
            onClick={() => onSuggestionClick(prompt)}
            disabled={!canHandoff}
          />
        ))}
      </div>
    );
  }

  return (
    <ChatPromptSuggestionsUi
      classNames={classNames}
      suggestions={suggestions}
      isLoading={isLoading}
      onSuggestionClick={onSuggestionClick}
      skeletonCount={skeletonCount ?? connectorProps.maxSuggestions}
      disabled={!canHandoff}
    />
  );
}
