import { Hit as AlgoliaHit } from 'instantsearch.js';

export type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    description: string;
    brand: string;
    image_urls: string[];
    list_categories: string[];
    price: {
      currency: string;
      value: number;
    };
  }>;
};
