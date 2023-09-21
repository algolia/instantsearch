import { createNullCache } from '@algolia/cache-common';
import { createInMemoryCache } from '@algolia/cache-in-memory';
import { createNullLogger } from '@algolia/logger-common';
import { createNodeHttpRequester } from '@algolia/requester-node-http';
import {
  serializeQueryParameters,
  createTransporter,
  CallEnum,
  createUserAgent,
} from '@algolia/transporter';
import algoliasearch from 'algoliasearch';

import {
  createSingleSearchResponse,
  createMultiSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

import type { HostOptions } from '@algolia/transporter';

type OverrideKeys<TTarget, TOptions> = TOptions extends Record<string, never>
  ? TTarget
  : Omit<TTarget, keyof TOptions> & TOptions;

type SearchClient = ReturnType<typeof algoliasearch>;

export type MockSearchClient = OverrideKeys<
  SearchClient,
  {
    search: jest.Mock<any, any>;
    searchForFacetValues: jest.Mock<any, any>;
  }
>;

export function createAlgoliaSearchClient<
  TOptions extends Partial<SearchClient>
>(options: TOptions): OverrideKeys<MockSearchClient, TOptions> {
  const appId = (options as Record<string, unknown>).appId || 'appId';

  // check if algoliasearch is v4 (has transporter)
  if ('transporter' in algoliasearch('appId', 'apiKey')) {
    options = {
      transporter: createTransporter({
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
      }),
      ...options,
    };
  } else {
    options = {
      _ua: 'Algolia for JavaScript (test)',
      ...options,
    };
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    appId,
    addAlgoliaAgent: jest.fn(),
    clearCache: jest.fn(),
    initIndex: jest.fn(),
    customRequest: jest.fn(),
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
  } as SearchClient as OverrideKeys<MockSearchClient, TOptions>;
}
