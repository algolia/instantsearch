import { MultiResponse } from 'algoliasearch';
import { Client } from '../../src/types';
import {
  createSingleSearchResponse,
  createMutliSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

export const createSearchClient = (args: Partial<Client> = {}): Client =>
  ({
    search: jest.fn(requests =>
      Promise.resolve(
        createMutliSearchResponse(
          ...requests.map(() => createSingleSearchResponse())
        )
      )
    ),
    searchForFacetValues: jest.fn(() =>
      Promise.resolve([createSFFVResponse()])
    ),
    ...args,
  } as Client);

type ControlledClient = {
  searchClient: Client;
  searches: Array<{
    promise: Promise<MultiResponse>;
    resolver: () => void;
  }>;
};

export const createControlledSearchClient = (
  args: Partial<Client> = {}
): ControlledClient => {
  const searches: ControlledClient['searches'] = [];
  const searchClient = createSearchClient({
    search: jest.fn(() => {
      let resolver: () => void;
      const promise: Promise<MultiResponse> = new Promise(resolve => {
        resolver = () => resolve(createMutliSearchResponse());
      });

      searches.push({
        promise,
        // @ts-ignore
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
