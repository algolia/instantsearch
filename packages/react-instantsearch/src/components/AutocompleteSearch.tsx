import { createAutocompleteSearchComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { useSearchBox } from 'react-instantsearch-core';

import type { ComponentProps, Pragma } from 'instantsearch-ui-components';

const AutocompleteSearchComponent = createAutocompleteSearchComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export type AutocompleteSearchProps = {
  inputProps: ComponentProps<'input'>;
  clearQuery: () => void;
};

export function AutocompleteSearch({
  inputProps,
  clearQuery,
}: AutocompleteSearchProps) {
  const { query, refine, isSearchStalled } = useSearchBox();

  return (
    <AutocompleteSearchComponent
      inputProps={{
        ...(inputProps as NonNullable<AutocompleteSearchProps['inputProps']>),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          refine(event.currentTarget.value),
      }}
      onClear={clearQuery}
      query={query}
      isSearchStalled={isSearchStalled}
    />
  );
}
