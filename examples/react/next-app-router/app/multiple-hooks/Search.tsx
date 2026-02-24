'use client';

import React from 'react';
import { useRefinementList } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import { client } from '../../lib/client';

export default function Search() {
  return (
    <InstantSearchNext searchClient={client} indexName="instant_search" routing>
      <WithoutSkipSuspense />
      <WithSkipSuspense />
    </InstantSearchNext>
  );
}

function WithoutSkipSuspense() {
  const { items: brands } = useRefinementList({ attribute: 'brand' });
  const { items: categories } = useRefinementList({ attribute: 'categories' });

  return (
    <ul id="without-skip-suspense">
      {brands.length > 0 && <li>Brands</li>}
      {categories.length > 0 && <li>Categories</li>}
    </ul>
  );
}

function WithSkipSuspense() {
  const { items: brands } = useRefinementList(
    {
      attribute: 'brand',
    },
    { skipSuspense: true }
  );
  const { items: prices } = useRefinementList({ attribute: 'price' });

  return (
    <ul id="with-skip-suspense">
      {brands.length > 0 && <li>Brands</li>}
      {prices.length > 0 && <li>Prices</li>}
    </ul>
  );
}
