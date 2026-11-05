import React from 'react';

import { ProductArt } from './ProductArt';

import type { Product } from '../types';

function formatPrice(price: number) {
  return `$${Number.isInteger(price) ? price : price.toFixed(2)}`;
}

export function ProductCard({
  product,
  style,
}: {
  product: Product;
  style?: React.CSSProperties;
}) {
  const category =
    product.category ?? product.categories?.[product.categories.length - 1];
  const variant = [product.color, product.material?.toLowerCase()]
    .filter(Boolean)
    .join(' ');

  return (
    <article className="card" style={style}>
      {product.image ? (
        <div className="art art--photo">
          <img src={product.image} alt="" loading="lazy" />
        </div>
      ) : (
        <ProductArt
          category={category ?? ''}
          color={product.color ?? ''}
          material={product.material ?? ''}
        />
      )}
      <div className="card-body">
        <p className="card-eyebrow">
          {[product.brand, category].filter(Boolean).join(' · ')}
        </p>
        <h3 className="card-title">{product.name}</h3>
        <p className="card-meta">
          <span>{variant}</span>
          {typeof product.rating === 'number' && product.rating > 0 ? (
            <span aria-label={`Rated ${product.rating} out of 5`}>
              <span aria-hidden="true">★</span> {product.rating}
              {product.reviews ? (
                <span className="card-reviews"> ({product.reviews})</span>
              ) : null}
            </span>
          ) : null}
        </p>
        {typeof product.price === 'number' ? (
          <p className="card-price">{formatPrice(product.price)}</p>
        ) : null}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="art" />
      <div className="card-body">
        <span className="skeleton-line" style={{ width: '50%' }} />
        <span className="skeleton-line" style={{ width: '80%' }} />
        <span className="skeleton-line" style={{ width: '30%' }} />
      </div>
    </div>
  );
}
