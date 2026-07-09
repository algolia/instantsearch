import { createChatPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useChatPageSuggestions } from 'react-instantsearch-core';

import type {
  ChatPromptSuggestionsOwnProps,
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

type OwnedUiProps =
  | 'suggestions'
  | 'isLoading'
  | 'onSuggestionClick'
  | 'disabled';

export type ChatPageSuggestionsProps = Omit<
  ChatPromptSuggestionsOwnProps,
  OwnedUiProps
> &
  UseChatPageSuggestionsProps & {
    layoutComponent?: (
      props: ChatPageSuggestionsLayoutComponentProps
    ) => JSX.Element | null;
    onSuggestionClick?: ChatPageSuggestionsOnSuggestionClick;
  };

export function ChatPageSuggestions({
  classNames = {},
  skeletonCount,
  layoutComponent: LayoutComponent,
  onSuggestionClick: onSuggestionClickOverride,
  // Connector params — forwarded to the hook, not the UI root.
  agentId,
  transport,
  task,
  pageType,
  transformHits,
  context,
  transformItems,
  ssrTimeout,
  ...props
}: ChatPageSuggestionsProps) {
  const { suggestions, isLoading, onSuggestionClick, isChatBusy, sendToChat } =
    useChatPageSuggestions(
      {
        agentId,
        transport,
        task,
        pageType,
        transformHits,
        context,
        transformItems,
        ssrTimeout,
      } as UseChatPageSuggestionsProps,
      {
        $$widgetType: 'ais.chatPageSuggestions',
      }
    );

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
      {...props}
      classNames={classNames}
      skeletonCount={skeletonCount}
      suggestions={suggestions}
      isLoading={isLoading}
      onSuggestionClick={handleClick}
      disabled={isChatBusy}
    />
  );
}
