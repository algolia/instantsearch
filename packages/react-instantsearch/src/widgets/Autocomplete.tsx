import { createAutocompleteComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useState } from 'react';

import type { Pragma } from 'instantsearch-ui-components';

export type AutocompleteProps = {
  placeholder?: string;
};

const AutocompleteUiComponent = createAutocompleteComponent({
  createElement: createElement as Pragma,
  Fragment,
});

export function Autocomplete({ placeholder }: AutocompleteProps) {
  const [query, setQuery] = useState('');

  return (
    <AutocompleteUiComponent
      query={query}
      onInput={(evt) => {
        setQuery(evt.target.value);
      }}
      placeholder={placeholder}
      items={[
        'Evil Chicken Bouillon',
        'Ginger Garlic Paste',
        'Oyster Sauce',
        'Lao Gan Ma Spicy Chili Crisp',
        'Sauce Gribiche',
      ]}
      isOpen={query.length > 0}
    />
  );
}
