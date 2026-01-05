import { createMemoryCache } from '@algolia/client-common';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

const appId = 'F4T6CUV2AH';
const apiKey = 'f33fd36eb0c251c553e3cd7684a6ba33';
export const agentId = '43d06334-d1ef-48a4-abe6-15bc343ad68c';

export const responsesCache = createMemoryCache();
export const searchClient = algoliasearch(
  appId,
  apiKey,
  { responsesCache }
);
