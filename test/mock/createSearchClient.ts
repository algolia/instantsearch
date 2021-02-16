import { SearchClient, MultiResponse } from '../../src/types';

import {
  createSingleSearchResponse,
  createMultiSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

export const createSearchClient = (
  args: Partial<SearchClient> = {}
): SearchClient => ({
  search: jest.fn(requests =>
    Promise.resolve(
      createMultiSearchResponse(
        ...requests.map(() => createSingleSearchResponse())
      )
    )
  ),
  searchForFacetValues: jest.fn(() => Promise.resolve([createSFFVResponse()])),
  ...args,
});

type ControlledClient = {
  searchClient: SearchClient;
  searches: Array<{
    promise: Promise<MultiResponse>;
    resolver: () => void;
  }>;
};

export const createControlledSearchClient = (
  args: Partial<SearchClient> = {}
): ControlledClient => {
  const searches: ControlledClient['searches'] = [];
  const searchClient = createSearchClient({
    search: jest.fn(() => {
      let resolver: () => void;
      const promise: Promise<MultiResponse> = new Promise(resolve => {
        resolver = () => resolve(createMultiSearchResponse());
      });

      searches.push({
        promise,
        // @ts-expect-error
        resolver,
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
