import { createMemoryCache } from '@algolia/client-common';
import { compositionClient } from '@algolia/composition';

export const responsesCache = createMemoryCache();
export const client = compositionClient(
  '9HILZG6EJK',
  '65b3e0bb064c4172c4810fb2459bebd1',
  { responsesCache }
);
