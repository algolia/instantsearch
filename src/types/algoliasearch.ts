// Custom types to support both algoliasearch
// `v3` and algoliasearch `v4` clients.

import algoliasearch, {
  // @ts-ignore
  SearchClient as SearchClientV4,
  // @ts-ignore
  Client as SearchClientV3,
  // @ts-ignore
  Response as SearchResponseV3,
  // @ts-ignore
  SearchForFacetValues as SearchForFacetValuesV3,
} from 'algoliasearch';
import {
  SearchResponse as SearchResponseV4,
  SearchForFacetValuesResponse as SearchForFacetValuesResponseV4,
  // @ts-ignore
  // eslint-disable-next-line import/no-unresolved
} from '@algolia/client-search';

type DummySearchClientV4 = {
  readonly addAlgoliaAgent: (segment: string, version?: string) => void;
};

export type Client = ReturnType<
  typeof algoliasearch
> extends DummySearchClientV4
  ? SearchClientV4
  : SearchClientV3;

export type MultiResponse<THit = any> = {
  results: Array<SearchResponse<THit>>;
};

export type SearchResponse<THit> = Client extends DummySearchClientV4
  ? SearchResponseV4<THit>
  : SearchResponseV3<THit>;

export type SearchForFacetValuesResponse = Client extends DummySearchClientV4
  ? SearchForFacetValuesResponseV4
  : SearchForFacetValuesV3.Response;
