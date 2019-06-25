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
