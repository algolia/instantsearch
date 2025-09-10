import React from 'react';
import {
  EXPERIMENTAL_AutocompleteWrapper as AutocompleteWrapper,
  EXPERIMENTAL_useAutocomplete as useAutocomplete,
} from 'react-instantsearch-core';

export function EXPERIMENTAL_Autocomplete() {
  return (
    <AutocompleteWrapper>
      <AutocompleteInner />
    </AutocompleteWrapper>
  );
}

function AutocompleteInner() {
  useAutocomplete();

  return null;
}
