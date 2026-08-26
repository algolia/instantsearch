import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { usePromptSuggestions } from 'react-instantsearch-core';

import type {
  PromptSuggestionsOwnProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { UsePromptSuggestionsProps } from 'react-instantsearch-core';

const PromptSuggestionsUi = createPromptSuggestionsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

/**
 * Props passed to a custom `layoutComponent`. Mirrors the connector render
 * state so a layout component owns the full markup.
 */
export type PromptSuggestionsLayoutComponentProps = {
  suggestions: string[];
  isLoading: boolean;
  error: Error | undefined;
  onSuggestionClick: (prompt: string) => void;
  isChatBusy: boolean;
};

export type PromptSuggestionsOnSuggestionClick = (
  prompt: string,
  helpers: { sendToChat: (prompt: string) => boolean }
) => void;

type OwnedUiProps =
  | 'suggestions'
  | 'isLoading'
  | 'onSuggestionClick'
  | 'disabled'
  | 'skeletonCount';

export type PromptSuggestionsProps = Omit<
  PromptSuggestionsOwnProps,
  OwnedUiProps
> &
  UsePromptSuggestionsProps & {
    layoutComponent?: (
      props: PromptSuggestionsLayoutComponentProps
    ) => JSX.Element | null;
    onSuggestionClick?: PromptSuggestionsOnSuggestionClick;
  };

export function PromptSuggestions({
  classNames = {},
  layoutComponent: LayoutComponent,
  onSuggestionClick: onSuggestionClickOverride,
  // Connector params — forwarded to the hook, not the UI root.
  agentId,
  transport,
  configurationId,
  transformHits,
  context,
  transformItems,
  ...props
}: PromptSuggestionsProps) {
  const source = agentId !== undefined ? { agentId, transport } : { transport };
  const {
    suggestions,
    isLoading,
    error,
    onSuggestionClick,
    isChatBusy,
    sendToChat,
  } = usePromptSuggestions(
    {
      ...source,
      configurationId,
      transformHits,
      context,
      transformItems,
    },
    {
      $$widgetType: 'ais.promptSuggestions',
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
        error={error}
        onSuggestionClick={handleClick}
        isChatBusy={isChatBusy}
      />
    );
  }

  return (
    <PromptSuggestionsUi
      {...props}
      classNames={classNames}
      suggestions={suggestions}
      isLoading={isLoading}
      onSuggestionClick={handleClick}
      disabled={isChatBusy}
    />
  );
}
