import { createMemoryCache } from '@algolia/client-common';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

export const appId = 'F4T6CUV2AH';
export const apiKey = 'f33fd36eb0c251c553e3cd7684a6ba33';
export const agentId = '6711d1bb-32fb-46ee-9708-ffc7fd6425b5';

export const responsesCache = createMemoryCache();
export const searchClient = algoliasearch(
  appId,
  apiKey,
  { responsesCache }
);
