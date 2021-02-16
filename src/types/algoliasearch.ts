// Custom types to support both algoliasearch
// `v3` and algoliasearch `v4` clients.

import algoliasearch, {
  /** @ts-ignore */
  Response as SearchResponseV3,
  /** @ts-ignore */
  SearchForFacetValues as SearchForFacetValuesV3,
} from 'algoliasearch';
import {
  /** @ts-ignore */
  SearchResponse as SearchResponseV4,
  /** @ts-ignore */
  SearchForFacetValuesResponse as SearchForFacetValuesResponseV4,
} from '@algolia/client-search'; /** @ts-ignore */

type DummySearchClientV4 = {
  readonly transporter: any;
};

type DefaultSearchClient = ReturnType<typeof algoliasearch>;

export type SearchClient = {
  search: DefaultSearchClient['search'];
  searchForFacetValues: DefaultSearchClient['searchForFacetValues'];
  addAlgoliaAgent?: DefaultSearchClient['addAlgoliaAgent'];
};

export type MultiResponse<THit = any> = {
  results: Array<SearchResponse<THit>>;
};

export type SearchResponse<
  THit
> = DefaultSearchClient extends DummySearchClientV4
  ? SearchResponseV4<THit>
  : SearchResponseV3<THit>;

export type SearchForFacetValuesResponse = DefaultSearchClient extends DummySearchClientV4
  ? SearchForFacetValuesResponseV4
  : SearchForFacetValuesV3.Response;
