import { createNullCache } from '@algolia/cache-common';
import { createInMemoryCache } from '@algolia/cache-in-memory';
import {
  serializeQueryParameters,
  createTransporter,
  CallEnum,
  createUserAgent,
} from '@algolia/transporter';
import type { HostOptions } from '@algolia/transporter';
import { createNullLogger } from '@algolia/logger-common';
import { createNodeHttpRequester } from '@algolia/requester-node-http';
import type {
  // @ts-ignore Search client v3 doesn't have this type and errors on the CI v3 job
  SearchClient,
} from 'algoliasearch/lite';
import {
  createSingleSearchResponse,
  createMultiSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

export function createSearchClient(
  options: Partial<SearchClient> = {}
): SearchClient {
  const appId = options.appId || 'appId';
  const transporter = createTransporter({
    timeouts: {
      connect: 2,
      read: 5,
      write: 30,
    },
    userAgent: createUserAgent('test'),
    requester: createNodeHttpRequester(),
    logger: createNullLogger(),
    responsesCache: createNullCache(),
    requestsCache: createNullCache(),
    hostsCache: createInMemoryCache(),
    hosts: (
      [
        { url: `${appId}-dsn.algolia.net`, accept: CallEnum.Read },
        { url: `${appId}.algolia.net`, accept: CallEnum.Write },
      ] as readonly HostOptions[]
    ).concat([
      { url: `${appId}-1.algolianet.com` },
      { url: `${appId}-2.algolianet.com` },
      { url: `${appId}-3.algolianet.com` },
    ]),
    headers: {},
    queryParameters: {},
  });

  return {
    appId,
    addAlgoliaAgent: jest.fn(),
    clearCache: jest.fn(),
    initIndex: jest.fn(),
    transporter,
    search: jest.fn((requests) =>
      Promise.resolve(
        createMultiSearchResponse(
          ...requests.map((request) =>
            createSingleSearchResponse({
              index: request.indexName,
              params: serializeQueryParameters(request.params || {}),
            })
          )
        )
      )
    ),
    searchForFacetValues: jest.fn(() =>
      Promise.resolve([createSFFVResponse()])
    ),
    ...options,
  };
}
