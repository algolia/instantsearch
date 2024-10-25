import {
  createSingleSearchResponse,
  createMultiSearchResponse,
  createRecommendResponse,
  createSFFVResponse,
} from './createAPIResponse';

import type { SearchClient, SearchResponses } from 'instantsearch-core';

export const createSearchClient = (
  args: Partial<SearchClient> = {}
): SearchClient => ({
  getRecommendations: jest.fn((requests) =>
    Promise.resolve(createRecommendResponse(requests))
  ),
  search: jest.fn((requests) =>
    Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() => createSingleSearchResponse())
      )
    )
  ),
  // @ts-ignore v5 does not have this method, but it's easier to have it here. In a future version we can replace this method and its usages with search({ type: 'facet })
  searchForFacetValues: jest.fn(() => Promise.resolve([createSFFVResponse()])),
  // @ts-ignore this allows us to test insights initialization without warning
  applicationID: 'appId',
  apiKey: 'apiKey',
  ...args,
});

type ControlledClient = {
  searchClient: SearchClient;
  searches: Array<{
    promise: Promise<SearchResponses<any>>;
    resolver: () => void;
    rejecter: (value: any) => void;
  }>;
};

export const createControlledSearchClient = (
  args: Partial<SearchClient> = {},
  createResponse = (...params: Parameters<SearchClient['search']>) =>
    createMultiSearchResponse(
      ...params[0].map(() => createSingleSearchResponse())
    )
): ControlledClient => {
  const searches: ControlledClient['searches'] = [];
  const searchClient = createSearchClient({
    search: jest.fn((...params) => {
      let resolver: () => void;
      let rejecter: (value: any) => void;
      const promise: Promise<SearchResponses<any>> = new Promise(
        (resolve, reject) => {
          resolver = () => resolve(createResponse(...params));
          rejecter = (value) => reject(value);
        }
      );

      searches.push({
        promise,
        // @ts-expect-error actually being assigned in the promise constructor
        resolver,
        // @ts-expect-error actually being assigned in the promise constructor
        rejecter,
      });

      return promise;
    }),
    ...args,
  });

  return {
    searchClient,
    searches,
  };
};
