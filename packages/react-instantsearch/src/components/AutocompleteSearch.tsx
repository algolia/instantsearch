import { createAutocompleteSearchComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  AutocompleteClassNames,
  ComponentProps,
  Pragma,
} from 'instantsearch-ui-components';

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
  onCancel?: () => void;
  isDetached?: boolean;
  submitTitle?: string;
  onAiModeClick?: () => void;
  aiModeButtonDisabled?: boolean;
  classNames?: Partial<AutocompleteClassNames>;
};

export function AutocompleteSearch({
  inputProps,
  clearQuery,
  onQueryChange,
  query,
  isSearchStalled,
  onCancel,
  isDetached,
  submitTitle,
  onAiModeClick,
  aiModeButtonDisabled,
  classNames,
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
      onCancel={onCancel}
      isDetached={isDetached}
      submitTitle={submitTitle}
      onAiModeClick={onAiModeClick}
      aiModeButtonDisabled={aiModeButtonDisabled}
      classNames={classNames}
    />
  );
}
