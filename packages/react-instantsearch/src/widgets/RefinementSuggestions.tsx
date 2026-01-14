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
  | 'suggestions'
  | 'isLoading'
  | 'onRefine'
  | 'skeletonCount'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
>;

export type RefinementSuggestionsProps = Omit<
  RefinementSuggestionsUiComponentProps,
  keyof UiProps
> &
  UseRefinementSuggestionsProps & {
    /**
     * Component to render each suggestion item.
     */
    itemComponent?: RefinementSuggestionsUiComponentProps['itemComponent'];
    /**
     * Component to render the header.
     */
    headerComponent?: RefinementSuggestionsUiComponentProps['headerComponent'];
    /**
     * Component to render when there are no suggestions.
     */
    emptyComponent?: RefinementSuggestionsUiComponentProps['emptyComponent'];
  };

export function RefinementSuggestions({
  agentId,
  attributes,
  maxSuggestions,
  debounceMs,
  hitsToSample,
  transformItems,
  itemComponent,
  headerComponent,
  emptyComponent,
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
    itemComponent,
    headerComponent,
    emptyComponent,
  };

  return <RefinementSuggestionsUiComponent {...props} {...uiProps} />;
}
