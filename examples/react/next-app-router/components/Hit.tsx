import { Hit as AlgoliaHit } from 'instantsearch.js';
import React from 'react';
import { Highlight } from 'react-instantsearch';

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

export function Hit({ hit }: HitProps) {
  return (
    <>
      <Highlight hit={hit} attribute="name" />
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}
