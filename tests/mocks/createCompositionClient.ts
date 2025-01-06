import {
  createSingleSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

import type { CompositionClient } from 'instantsearch.js';

export const createCompositionClient = (
  args: Partial<CompositionClient> = {}
): CompositionClient => ({
  search: jest.fn(() =>
    Promise.resolve({ results: [createSingleSearchResponse()] })
  ),
  // @ts-expect-error
  searchForFacetValues: jest.fn(() =>
    Promise.resolve({ results: [createSFFVResponse()] })
  ),
  applicationID: 'appId',
  apiKey: 'apiKey',
  ...args,
});
