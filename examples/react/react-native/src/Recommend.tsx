import React from 'react';
import {
  useFrequentlyBoughtTogether,
  useLookingSimilar,
  useRelatedProducts,
  useTrendingItems,
} from 'react-instantsearch-core';

import { ProductRecord, ProductHit } from '../types/ProductHit';

import { Carousel } from './Carousel';

type RecommendProps = {
  objectID: string;
  onSelect?: (hit: ProductHit) => void;
};

export function RelatedProducts({ objectID, onSelect }: RecommendProps) {
  const { items } = useRelatedProducts<ProductRecord>({
    objectIDs: [objectID],
    limit: 8,
  });

  return (
    <Carousel
      title="Related products"
      items={items as ProductHit[]}
      onSelect={onSelect}
    />
  );
}

export function FrequentlyBoughtTogether({ objectID, onSelect }: RecommendProps) {
  const { items } = useFrequentlyBoughtTogether<ProductRecord>({
    objectIDs: [objectID],
    limit: 4,
  });

  return (
    <Carousel
      title="Frequently bought together"
      items={items as ProductHit[]}
      onSelect={onSelect}
    />
  );
}

export function LookingSimilar({ objectID, onSelect }: RecommendProps) {
  const { items } = useLookingSimilar<ProductRecord>({
    objectIDs: [objectID],
    limit: 8,
  });

  return (
    <Carousel
      title="Looking similar"
      items={items as ProductHit[]}
      onSelect={onSelect}
    />
  );
}

type TrendingItemsProps = {
  onSelect?: (hit: ProductHit) => void;
};

export function TrendingItems({ onSelect }: TrendingItemsProps) {
  const { items } = useTrendingItems<ProductRecord>({ limit: 10 });

  return (
    <Carousel
      title="Trending right now"
      items={items as ProductHit[]}
      onSelect={onSelect}
    />
  );
}
