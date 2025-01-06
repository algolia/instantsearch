import {
  createSingleSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

import type { CompositionClient } from 'instantsearch.js';

export const createCompositionClient = <T extends Record<string, unknown>>(
  args: Partial<CompositionClient & T> = {}
): CompositionClient => ({
  search: jest.fn(() =>
    Promise.resolve({ results: [createSingleSearchResponse()] })
  ),
  searchForFacetValues: jest.fn(() =>
    Promise.resolve({ results: [createSFFVResponse()] })
  ),
  applicationID: 'appId',
  apiKey: 'apiKey',
  ...args,
});
