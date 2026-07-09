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

/**
 * Props passed to a custom `layoutComponent`. Mirrors the connector render
 * state so a layout component owns the full markup.
 */
export type ChatPageSuggestionsLayoutComponentProps = {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (prompt: string) => void;
  isChatBusy: boolean;
};

export type ChatPageSuggestionsOnSuggestionClick = (
  prompt: string,
  helpers: { sendToChat: (prompt: string) => boolean }
) => void;

export type ChatPageSuggestionsProps = UseChatPageSuggestionsProps & {
  classNames?: Partial<ChatPromptSuggestionsClassNames>;
  /**
   * Replaces the default pills layout. Receives the full render state — the
   * component is responsible for rendering the list, the loading state, and
   * the click handlers.
   */
  layoutComponent?: (
    props: ChatPageSuggestionsLayoutComponentProps
  ) => JSX.Element | null;
  /**
   * Override the default click behavior (handoff to the chat widget). Receives
   * the prompt and a `sendToChat` callback you can call to fall through to the
   * default handoff after running custom logic (analytics, routing, fallback
   * to a non-InstantSearch chat).
   */
  onSuggestionClick?: ChatPageSuggestionsOnSuggestionClick;
};

export function ChatPageSuggestions({
  classNames = {},
  layoutComponent: LayoutComponent,
  onSuggestionClick: onSuggestionClickOverride,
  ...connectorProps
}: ChatPageSuggestionsProps) {
  const {
    suggestions,
    isLoading,
    onSuggestionClick,
    isChatBusy,
    sendToChat,
  } = useChatPageSuggestions(connectorProps, {
    $$widgetType: 'ais.chatPageSuggestions',
  });

  const handleClick = onSuggestionClickOverride
    ? (prompt: string) => onSuggestionClickOverride(prompt, { sendToChat })
    : onSuggestionClick;

  if (LayoutComponent) {
    return (
      <LayoutComponent
        suggestions={suggestions}
        isLoading={isLoading}
        onSuggestionClick={handleClick}
        isChatBusy={isChatBusy}
      />
    );
  }

  return (
    <ChatPromptSuggestionsUi
      classNames={classNames}
      suggestions={suggestions}
      isLoading={isLoading}
      onSuggestionClick={handleClick}
      disabled={isChatBusy}
    />
  );
}
