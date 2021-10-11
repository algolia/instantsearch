import type {
  // @ts-ignore Search client v3 doesn't have this type and errors on the CI v3 job
  SearchClient,
} from 'algoliasearch/lite';
import {
  createSingleSearchResponse,
  createMultiSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

export function createSearchClient(options: Partial<SearchClient> = {}) {
  return {
    appId: '',
    addAlgoliaAgent: jest.fn(),
    clearCache: jest.fn(),
    initIndex: jest.fn(),
    transporter: {},
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map(() => createSingleSearchResponse())
        )
      )
    ),
    searchForFacetValues: jest.fn(() =>
      Promise.resolve([createSFFVResponse()])
    ),
    ...options,
  };
}
