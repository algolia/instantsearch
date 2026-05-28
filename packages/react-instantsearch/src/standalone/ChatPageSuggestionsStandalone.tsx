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

export type ChatPageSuggestionsStandaloneLayoutComponentProps = {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (prompt: string) => void;
  disabled: boolean;
};

export type ChatPageSuggestionsStandaloneProps =
  UseChatPageSuggestionsStandaloneProps & {
    classNames?: Partial<ChatPromptSuggestionsClassNames>;
    /**
     * Disable every pill (e.g. while your downstream chat is mid-stream).
     */
    disabled?: boolean;
    /**
     * Replaces the default pills layout. Receives the full state — the
     * component is responsible for rendering the list, the loading state, and
     * the click handlers.
     */
    layoutComponent?: (
      props: ChatPageSuggestionsStandaloneLayoutComponentProps
    ) => JSX.Element | null;
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
  disabled = false,
  layoutComponent: LayoutComponent,
  ...hookProps
}: ChatPageSuggestionsStandaloneProps) {
  const { suggestions, isLoading, onSuggestionClick } =
    useChatPageSuggestionsStandalone(hookProps);

  if (LayoutComponent) {
    return (
      <LayoutComponent
        suggestions={suggestions}
        isLoading={isLoading}
        onSuggestionClick={onSuggestionClick}
        disabled={disabled}
      />
    );
  }

  return (
    <ChatPromptSuggestionsUi
      classNames={classNames}
      suggestions={suggestions}
      isLoading={isLoading}
      onSuggestionClick={onSuggestionClick}
      skeletonCount={hookProps.maxSuggestions}
      disabled={disabled}
    />
  );
}
