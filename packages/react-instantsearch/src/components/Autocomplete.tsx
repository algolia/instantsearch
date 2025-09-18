import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
} from 'instantsearch-ui-components';
import React, { createElement, useState, Fragment } from 'react';
import { Index, useHits } from 'react-instantsearch-core';

import { SearchBox } from '../widgets';

import type { Pragma } from 'instantsearch-ui-components';
import type { BaseHit, Hit } from 'instantsearch.js';

const Autocomplete = createAutocompleteComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompletePanel = createAutocompletePanelComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteIndex = createAutocompleteIndexComponent({
  createElement: createElement as Pragma,
  Fragment,
});

type IndexConfig<TItem extends Hit<BaseHit> = Hit<BaseHit>> = {
  indexName: string;
  getQuery?: (item: TItem) => string;
  getURL?: (item: TItem) => string;
  itemComponent: React.ComponentType<TItem> | React.ComponentType<any>;
};

export type AutocompleteProps = {
  indices: IndexConfig[];
};

export function EXPERIMENTAL_Autocomplete({ indices }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Index EXPERIMENTAL_isolated>
      <Autocomplete isOpen={isOpen}>
        <SearchBox onFocus={() => setIsOpen(true)} />
        <AutocompletePanel isOpen={isOpen}>
          {indices.map((index) => (
            <Index key={index.indexName} indexName={index.indexName}>
              <AutocompleteIndexComponent itemComponent={index.itemComponent} />
            </Index>
          ))}
        </AutocompletePanel>
      </Autocomplete>
    </Index>
  );
}

type AutocompleteIndexProps = {
  itemComponent: IndexConfig['itemComponent'];
};

function AutocompleteIndexComponent({
  itemComponent: ItemComponent,
}: AutocompleteIndexProps) {
  const { items } = useHits();

  return (
    <AutocompleteIndex
      // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
      ItemComponent={ItemComponent}
      items={items}
    />
  );
}
