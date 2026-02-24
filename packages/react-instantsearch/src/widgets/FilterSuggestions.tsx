import { createFilterSuggestionsComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useFilterSuggestions } from 'react-instantsearch-core';

import type {
  Pragma,
  FilterSuggestionsProps as FilterSuggestionsUiComponentProps,
} from 'instantsearch-ui-components';
import type { UseFilterSuggestionsProps } from 'react-instantsearch-core';

const FilterSuggestionsUiComponent = createFilterSuggestionsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

type UiProps = Pick<
  FilterSuggestionsUiComponentProps,
  | 'suggestions'
  | 'isLoading'
  | 'refine'
  | 'skeletonCount'
  | 'itemComponent'
  | 'headerComponent'
  | 'emptyComponent'
>;

export type FilterSuggestionsProps = Omit<
  FilterSuggestionsUiComponentProps,
  keyof UiProps
> &
  UseFilterSuggestionsProps & {
    /**
     * Component to render each suggestion item.
     */
    itemComponent?: FilterSuggestionsUiComponentProps['itemComponent'];
    /**
     * Component to render the header. Set to `false` to disable the header.
     */
    headerComponent?: FilterSuggestionsUiComponentProps['headerComponent'];
    /**
     * Component to render when there are no suggestions.
     */
    emptyComponent?: FilterSuggestionsUiComponentProps['emptyComponent'];
  };

export function FilterSuggestions({
  agentId,
  attributes,
  maxSuggestions,
  debounceMs,
  hitsToSample,
  transformItems,
  itemComponent,
  headerComponent,
  emptyComponent,
  transport,
  ...props
}: FilterSuggestionsProps) {
  const { suggestions, isLoading, refine } = useFilterSuggestions(
    {
      agentId,
      attributes,
      maxSuggestions,
      debounceMs,
      hitsToSample,
      transformItems,
      transport,
    },
    { $$widgetType: 'ais.filterSuggestions' }
  );

  const uiProps: UiProps = {
    suggestions,
    isLoading,
    refine,
    skeletonCount: maxSuggestions,
    itemComponent,
    headerComponent,
    emptyComponent,
  };

  return <FilterSuggestionsUiComponent {...props} {...uiProps} />;
}
