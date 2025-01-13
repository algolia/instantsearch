import { createMemoryCache } from '@algolia/client-common';
import { liteClient as algoliasearch } from 'algoliasearch-v5/lite';

export const responsesCache = createMemoryCache();
export const client = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76',
  { responsesCache }
);
