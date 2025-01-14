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

type ControlledCompositionClient = {
  searchClient: CompositionClient;
  searches: Array<{
    promise: ReturnType<CompositionClient['search']>;
    resolver: () => void;
    rejecter: (value: any) => void;
  }>;
};

export const createControlledCompositionClient = <
  T extends Record<string, unknown>
>(
  args: Partial<CompositionClient & T> = {},
  createResponse = (..._params: Parameters<CompositionClient['search']>) =>
    Promise.resolve({ results: [createSingleSearchResponse()] })
): ControlledCompositionClient => {
  const searches: ControlledCompositionClient['searches'] = [];
  const searchClient = createCompositionClient({
    search: jest.fn((...params) => {
      let resolver: () => void;
      let rejecter: (value: any) => void;
      const promise: ReturnType<CompositionClient['search']> = new Promise(
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
