import React from 'react';
import {
  AutocompleteWrapper,
  useAutocomplete,
} from 'react-instantsearch-core/dist/es/autocomplete';

export function Autocomplete() {
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
