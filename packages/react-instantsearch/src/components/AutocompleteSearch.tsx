import { createAutocompleteSearchComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type { ComponentProps, Pragma } from 'instantsearch-ui-components';

const AutocompleteSearchComponent = createAutocompleteSearchComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type AutocompleteSearchProps = {
  inputProps: ComponentProps<'input'>;
  clearQuery: () => void;
  onQueryChange?: (query: string) => void;
  query: string;
  refine: (query: string) => void;
  isSearchStalled: boolean;
};

export function AutocompleteSearch({
  inputProps,
  clearQuery,
  onQueryChange,
  query,
  refine,
  isSearchStalled,
}: AutocompleteSearchProps) {
  return (
    <AutocompleteSearchComponent
      inputProps={{
        ...(inputProps as NonNullable<AutocompleteSearchProps['inputProps']>),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.currentTarget.value;
          refine(value);
          onQueryChange?.(value);
        },
      }}
      onClear={clearQuery}
      query={query}
      isSearchStalled={isSearchStalled}
    />
  );
}
