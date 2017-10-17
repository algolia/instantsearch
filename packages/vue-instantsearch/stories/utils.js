import { createFromAlgoliaCredentials } from '../src/store';

export function defaultSearchStore() {
  const searchStore = createFromAlgoliaCredentials(
    'latency',
    '6be0576ff61c053d5f9a3225e2a90f76'
  );
  searchStore.indexName = 'ikea';
  searchStore.start();

  return searchStore;
}
