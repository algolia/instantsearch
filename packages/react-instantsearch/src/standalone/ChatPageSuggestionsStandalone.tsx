import { createChatPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import { useChatPageSuggestionsStandalone } from './useChatPageSuggestionsStandalone';

import type { UseChatPageSuggestionsStandaloneProps } from './useChatPageSuggestionsStandalone';
import type {
  ChatPromptSuggestionsClassNames,
  Pragma,
} from 'instantsearch-ui-components';

const ChatPromptSuggestionsUi = createChatPromptSuggestionsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type ChatPageSuggestionsStandaloneProps =
  UseChatPageSuggestionsStandaloneProps & {
    classNames?: Partial<ChatPromptSuggestionsClassNames>;
    /**
     * Number of skeleton placeholder pills shown while loading.
     * @default maxSuggestions
     */
    skeletonCount?: number;
    /**
     * Disable every pill (e.g. while your downstream chat is mid-stream).
     */
    disabled?: boolean;
    /**
     * Optional custom pill renderer. Receives the prompt text, the click
     * handler, and the `disabled` state.
     */
    pillComponent?: (props: {
      prompt: string;
      onClick: () => void;
      disabled: boolean;
    }) => JSX.Element;
  };

/**
 * Drop-in React component for the standalone (no-`<InstantSearch>`)
 * prompt-pills experience. Renders the same UI as the in-IS
 * `<ChatPageSuggestions>` widget. Clicking a pill dispatches the
 * `algolia:chat-page-suggestion-click` `CustomEvent` on `window`; wire your
 * chat by listening for that event.
 */
export function ChatPageSuggestionsStandalone({
  classNames = {},
  skeletonCount,
  disabled = false,
  pillComponent: PillComponent,
  ...hookProps
}: ChatPageSuggestionsStandaloneProps) {
  const { suggestions, isLoading, onSuggestionClick } =
    useChatPageSuggestionsStandalone(hookProps);

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
            disabled={disabled}
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
      skeletonCount={skeletonCount ?? hookProps.maxSuggestions}
      disabled={disabled}
    />
  );
}
