/**
 * A hit as either backend returns it. The fake fixture has color/material;
 * the real index has an image and a category path. Only `objectID` and
 * `name` are guaranteed.
 */
export type Product = {
  objectID: string;
  name: string;
  brand?: string;
  category?: string;
  categories?: string[];
  color?: string;
  material?: string;
  price?: number;
  rating?: number;
  reviews?: number;
  image?: string;
  description?: string;
};

/** Active filters as a snapshot, keyed by attribute. */
export type Filters = Record<string, string[]>;
