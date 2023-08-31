'use client';

import algoliasearch from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import { ServerInsertedHTMLContext } from 'next/navigation';
import React from 'react';
import {
  Hits,
  Highlight,
  SearchBox,
  RefinementList,
} from 'react-instantsearch';
import { NextInstantSearchSSR } from 'react-instantsearch-ssr-nextjs';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <Highlight hit={hit} attribute="name" className="Hit-label" />
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}

export default function SearchPage() {
  return (
    <NextInstantSearchSSR
      searchClient={client}
      indexName="instant_search"
      ServerInsertedHTMLContext={ServerInsertedHTMLContext}
    >
      <div className="Container">
        <div>
          <RefinementList attribute="brand" />
        </div>
        <div>
          <SearchBox />
          <Hits hitComponent={Hit} />
        </div>
      </div>
    </NextInstantSearchSSR>
  );
}
