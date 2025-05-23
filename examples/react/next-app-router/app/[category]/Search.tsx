'use client';

import { Hit as AlgoliaHit } from 'instantsearch.js';
import Link from 'next/link';
import React from 'react';
import { Hits, Highlight, SearchBox, Configure } from 'react-instantsearch';
import {
  InstantSearchNext,
  createInstantSearchNextInstance,
} from 'react-instantsearch-nextjs';

import { client } from '../../lib/client';

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <Highlight hit={hit} attribute="name" />
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}

const categoryInstance = createInstantSearchNextInstance();

export default function Search({ category }: { category: string }) {
  return (
    <InstantSearchNext
      searchClient={client}
      indexName="instant_search"
      routing
      instance={categoryInstance}
    >
      <Configure filters={`categories:${category}`} />

      <div className="Container">
        <div>
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/Appliances">Appliances</Link>
            </li>
            <li>
              <Link href="/Audio">Audio</Link>
            </li>
            <li>
              <Link href="/Housewares">Housewares</Link>
            </li>
          </ul>
        </div>
        <div>
          <SearchBox />
          <Hits hitComponent={Hit} />
        </div>
      </div>
    </InstantSearchNext>
  );
}
