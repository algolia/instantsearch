import { createOnPageSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useOnPageSuggestions } from 'react-instantsearch-core';

import type {
  OnPageSuggestionsOwnProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { UseOnPageSuggestionsProps } from 'react-instantsearch-core';

const OnPageSuggestionsUi = createOnPageSuggestionsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

/**
 * Props passed to a custom `layoutComponent`. Mirrors the connector render
 * state so a layout component owns the full markup.
 */
export type OnPageSuggestionsLayoutComponentProps = {
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (prompt: string) => void;
  isChatBusy: boolean;
};

export type OnPageSuggestionsOnSuggestionClick = (
  prompt: string,
  helpers: { sendToChat: (prompt: string) => boolean }
) => void;

type OwnedUiProps =
  | 'suggestions'
  | 'isLoading'
  | 'onSuggestionClick'
  | 'disabled';

export type OnPageSuggestionsProps = Omit<
  OnPageSuggestionsOwnProps,
  OwnedUiProps
> &
  UseOnPageSuggestionsProps & {
    layoutComponent?: (
      props: OnPageSuggestionsLayoutComponentProps
    ) => JSX.Element | null;
    onSuggestionClick?: OnPageSuggestionsOnSuggestionClick;
  };

export function OnPageSuggestions({
  classNames = {},
  skeletonCount,
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
}: OnPageSuggestionsProps) {
  const { suggestions, isLoading, onSuggestionClick, isChatBusy, sendToChat } =
    useOnPageSuggestions(
      {
        agentId,
        transport,
        configurationId,
        transformHits,
        context,
        transformItems,
      } as UseOnPageSuggestionsProps,
      {
        $$widgetType: 'ais.onPageSuggestions',
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
    <OnPageSuggestionsUi
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
