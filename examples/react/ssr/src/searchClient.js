import { createMemoryCache } from '@algolia/client-common';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

export const requestsCache = createMemoryCache();
export const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76',
  {
    requestsCache,
  }
);
