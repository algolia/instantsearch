import * as ClientCommon from '@algolia/client-common';
import * as HTTPRequester from '@algolia/requester-node-http';
import * as AlgoliaSearch from 'algoliasearch';

import {
  createSingleSearchResponse,
  createMultiSearchResponse,
  createSFFVResponse,
} from './createAPIResponse';

import type { SearchClient } from 'algoliasearch-helper/types/algoliasearch';

const algoliasearch = ((AlgoliaSearch as any).algoliasearch ||
  (AlgoliaSearch as any).default) as unknown as (
  appId: string,
  apiKey: string
) => SearchClient;

type OverrideKeys<TTarget, TOptions> = TOptions extends Record<string, never>
  ? TTarget
  : Omit<TTarget, keyof TOptions> & TOptions;

export type MockSearchClient = OverrideKeys<
  SearchClient,
  SearchClient extends { searchForFacetValues: (...args: any[]) => any }
    ? {
        search: jest.Mock<any, any>;
        searchForFacetValues: jest.Mock<any, any>;
      }
    : { search: jest.Mock<any, any> }
>;

export function createAlgoliaSearchClient<
  TOptions extends Partial<SearchClient>
>(options: TOptions): OverrideKeys<MockSearchClient, TOptions> {
  const appId = (options as Record<string, unknown>).appId || 'appId';

  const version =
    (AlgoliaSearch as any).apiClientVersion ||
    (algoliasearch as any).version ||
    '';

  if (version.startsWith('5.')) {
    // @ts-ignore (v4)
    type Host = typeof ClientCommon['Host'];
    options = {
      transporter: (ClientCommon as any).createTransporter({
        timeouts: {
          connect: 2,
          read: 5,
          write: 30,
        },
        algoliaAgent: (ClientCommon as any).getAlgoliaAgent({
          algoliaAgents: [],
          client: 'Search',
          version: '5.0.0',
        }),
        requester: (HTTPRequester as any).createHttpRequester(),
        responsesCache: (ClientCommon as any).createNullCache(),
        requestsCache: (ClientCommon as any).createNullCache(),
        hostsCache: (ClientCommon as any).createMemoryCache(),
        hosts: (
          [
            {
              url: `${appId}-dsn.algolia.net`,
              accept: 'read',
              protocol: 'https',
            },
            { url: `${appId}.algolia.net`, accept: 'write', protocol: 'https' },
          ] as readonly Host[]
        ).concat([
          {
            url: `${appId}-1.algolianet.com`,
            accept: 'readWrite',
            protocol: 'https',
          },
          {
            url: `${appId}-2.algolianet.com`,
            accept: 'readWrite',
            protocol: 'https',
          },
          {
            url: `${appId}-3.algolianet.com`,
            accept: 'readWrite',
            protocol: 'https',
          },
        ]),
        headers: {},
        queryParameters: {},
      }),
      ...options,
    };
  } else if (version.startsWith('4.')) {
    const CacheCommon = require('@algolia/cache-common');
    const CacheInMemory = require('@algolia/cache-in-memory');
    const LoggerCommon = require('@algolia/logger-common');
    const Transporter = require('@algolia/transporter');

    options = {
      transporter: Transporter.createTransporter({
        timeouts: {
          connect: 2,
          read: 5,
          write: 30,
        },
        userAgent: Transporter.createUserAgent('test'),
        requester: (HTTPRequester as any).createNodeHttpRequester(),
        logger: LoggerCommon.createNullLogger(),
        responsesCache: CacheCommon.createNullCache(),
        requestsCache: CacheCommon.createNullCache(),
        hostsCache: CacheInMemory.createInMemoryCache(),
        hosts: (
          [
            {
              url: `${appId}-dsn.algolia.net`,
              accept: Transporter.CallEnum.Read,
            },
            { url: `${appId}.algolia.net`, accept: Transporter.CallEnum.Write },
          ] as ReadonlyArray<typeof Transporter.HostOptions>
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
              params: getParams(version, request.params || {}),
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

function getParams(version: string, params: Record<string, any>) {
  if (version.startsWith('5.')) {
    return (ClientCommon as any).serializeQueryParameters(params);
  }
  if (version.startsWith('4.')) {
    const Transporter = require('@algolia/transporter');
    return Transporter.serializeQueryParameters(params);
  }

  if (version.startsWith('3.')) {
    return (algoliasearch('appid', 'apikey') as any)._getSearchParams(params);
  }

  return 'wrong version, no params';
}
