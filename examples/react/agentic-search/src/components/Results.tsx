import React from 'react';
import { Pagination, useHits, useInstantSearch } from 'react-instantsearch';

import { ProductCard } from './ProductCard';

import type { Product } from '../types';

/** Regular search results, shown whenever the query is not agentic. */
export function Results() {
  const { items, results } = useHits<Product>();
  const { status } = useInstantSearch();

  return (
    <section className="results" aria-labelledby="results-title">
      <header className="results-header">
        <h2 id="results-title" className="results-title">
          {results?.query ? `Results for “${results.query}”` : 'All products'}
        </h2>
        <p className="results-count">
          {status === 'stalled'
            ? 'Searching…'
            : `${results?.nbHits ?? 0} products`}
        </p>
      </header>
      {items.length === 0 ? (
        <p className="empty">No products match. Try another search.</p>
      ) : (
        <div className="grid">
          {items.map((hit) => (
            <ProductCard key={hit.objectID} product={hit} />
          ))}
        </div>
      )}
      <Pagination padding={2} />
    </section>
  );
}
