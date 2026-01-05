'use client';

import { createButtonComponent } from 'instantsearch-ui-components';
import { Hit } from 'instantsearch.js';
import Link from 'next/link';
import { createElement } from 'react';
import {
  Configure,
  Hits,
  PromptSuggestions,
  useInstantSearch,
} from 'react-instantsearch';

import type { Pragma } from 'instantsearch-ui-components';
import { agentId } from '../../../lib/client';

const Button = createButtonComponent({
  createElement: createElement as Pragma,
});

export default function Product({ pid }: { pid: string }) {
  return (
    <>
      <Configure hitsPerPage={1} filters={`objectID:${pid}`} />
      <div className="container product-page">
        <Link href="/" className="back-link">
          ← Back to search
        </Link>
        <Hits hitComponent={HitComponent} classNames={{ item: 'no-border' }} />
      </div>
    </>
  );
}

function formatToDollar(amount: number, locale = 'en-US', currency = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function ProductSkeleton() {
  return (
    <article className="product-detail">
      <div className="product-detail-image-container skeleton-image" />
      <div className="product-detail-content">
        <div className="skeleton skeleton-category" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-description short" />
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-button" />
      </div>
    </article>
  );
}

function HitComponent({ hit }: { hit: Hit }) {
  const { results } = useInstantSearch();

  if (results.hits.length > 1) {
    return <ProductSkeleton />;
  }

  return (
    <article className="product-detail">
      <div className="product-detail-image-container">
        <img src={hit.image} alt={hit.name} className="product-detail-image" />
      </div>
      <div className="product-detail-content">
        <span className="product-detail-category">{hit.categories?.[0]}</span>
        <h1 className="product-detail-title">{hit.name}</h1>
        <div className="product-detail-price">{formatToDollar(hit.price)}</div>
        <p className="product-detail-description">{hit.description}</p>
        {hit.free_shipping && (
          <span className="product-detail-shipping">Free Shipping</span>
        )}
        <PromptSuggestions agentId={agentId} context={hit} />
        <Button className="product-detail-button">Add to Cart</Button>
      </div>
    </article>
  );
}
