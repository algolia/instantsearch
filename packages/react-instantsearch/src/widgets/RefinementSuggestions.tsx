import { createRefinementSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useRefinementSuggestions } from 'react-instantsearch-core';

import type {
  Pragma,
  RefinementSuggestionsProps as RefinementSuggestionsUiComponentProps,
} from 'instantsearch-ui-components';
import type { UseRefinementSuggestionsProps } from 'react-instantsearch-core';

const RefinementSuggestionsUiComponent = createRefinementSuggestionsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

type UiProps = Pick<
  RefinementSuggestionsUiComponentProps,
  'suggestions' | 'isLoading' | 'onRefine' | 'skeletonCount'
>;

export type RefinementSuggestionsProps = Omit<
  RefinementSuggestionsUiComponentProps,
  keyof UiProps
> &
  UseRefinementSuggestionsProps;

export function RefinementSuggestions({
  agentId,
  attributes,
  maxSuggestions,
  debounceMs,
  hitsToSample,
  transformItems,
  ...props
}: RefinementSuggestionsProps) {
  const { suggestions, isLoading, refine } = useRefinementSuggestions(
    {
      agentId,
      attributes,
      maxSuggestions,
      debounceMs,
      hitsToSample,
      transformItems,
    },
    { $$widgetType: 'ais.refinementSuggestions' }
  );

  const uiProps: UiProps = {
    suggestions,
    isLoading,
    onRefine: refine,
    skeletonCount: maxSuggestions,
  };

  return <RefinementSuggestionsUiComponent {...props} {...uiProps} />;
}
