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
  isSearchStalled: boolean;
  onSubmit?: () => void;
  isDetached?: boolean;
  submitTitle?: string;
  onAiModeClick?: () => void;
};

export function AutocompleteSearch({
  inputProps,
  clearQuery,
  onQueryChange,
  query,
  isSearchStalled,
  onSubmit,
  isDetached,
  submitTitle,
  onAiModeClick,
}: AutocompleteSearchProps) {
  return (
    <AutocompleteSearchComponent
      inputProps={{
        ...(inputProps as NonNullable<AutocompleteSearchProps['inputProps']>),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.currentTarget.value;
          onQueryChange?.(value);
        },
      }}
      onClear={clearQuery}
      query={query}
      isSearchStalled={isSearchStalled}
      onSubmit={onSubmit}
      isDetached={isDetached}
      submitTitle={submitTitle}
      onAiModeClick={onAiModeClick}
    />
  );
}
