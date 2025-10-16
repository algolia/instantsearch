import React from 'react';
import { Index } from 'react-instantsearch-core';

import { Hits } from './Hits';
import { SearchBox } from './SearchBox';

import type { BaseHit, Hit } from 'instantsearch.js';

type IndexConfig<TItem extends Hit<BaseHit> = Hit<BaseHit>> = {
  indexName: string;
  indexId?: string;
  getQuery?: (item: TItem) => string;
  getURL?: (item: TItem) => string;
  itemComponent: React.ComponentType<TItem> | React.ComponentType<any>;
};

export type AutocompleteProps = {
  indices?: IndexConfig[];
};

export function EXPERIMENTAL_Autocomplete({ indices }: AutocompleteProps) {
  return (
    <div className="ais-Autocomplete">
      <Index EXPERIMENTAL_isolated>
        <SearchBox />
        {indices?.map((index) => (
          <Index
            key={index.indexName}
            indexName={index.indexName}
            indexId={index.indexId}
          >
            <Hits
              hitComponent={({ hit }) => <index.itemComponent {...hit} />}
            />
          </Index>
        ))}
      </Index>
    </div>
  );
}
