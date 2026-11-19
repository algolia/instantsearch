import { Hit as AlgoliaHit, Highlight } from 'react-instantsearch';
import React from 'react';

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
