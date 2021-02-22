// Custom types to support both algoliasearch
// `v3` and algoliasearch `v4` clients.

import algoliasearch, {
  /** @ts-ignore */
  // @ts-ignore (TypeScript 3.8.3 does not yet support multi-line ts-ignore, but 3.9.3 bugs when compiling. This is fixed when we migrate to 4)
  SearchClient as SearchClientV4,
  /** @ts-ignore */
  // @ts-ignore
  Client as SearchClientV3,
  /** @ts-ignore */
  // @ts-ignore
  Response as SearchResponseV3,
  /** @ts-ignore */
  // @ts-ignore
  SearchForFacetValues as SearchForFacetValuesV3,
} from 'algoliasearch';
import {
  FindAnswersResponse as FindAnswersResponseV4,
  SearchResponse as SearchResponseV4,
  FindAnswersOptions as FindAnswersOptionsV4,
  // no comma, TS is particular about which nodes expose comments
  // eslint-disable-next-line prettier/prettier
  SearchForFacetValuesResponse as SearchForFacetValuesResponseV4
  /** @ts-ignore */
  // @ts-ignore
  // eslint-disable-next-line import/no-unresolved
} from '@algolia/client-search';

export type FindAnswersOptions = DefaultSearchClient extends DummySearchClientV4
  ? FindAnswersOptionsV4
  : any;

export type FindAnswersResponse<
  TObject
> = DefaultSearchClient extends DummySearchClientV4
  ? FindAnswersResponseV4<TObject>
  : any;

type DummySearchClientV4 = {
  readonly transporter: any;
};

type DefaultSearchClient = ReturnType<
  typeof algoliasearch
> extends DummySearchClientV4
  ? SearchClientV4
  : SearchClientV3;

export type SearchClient = {
  search: DefaultSearchClient['search'];
  searchForFacetValues: DefaultSearchClient['searchForFacetValues'];
  addAlgoliaAgent?: DefaultSearchClient['addAlgoliaAgent'];
  initIndex?: DefaultSearchClient['initIndex'];
};

export type MultiResponse<THit = any> = {
  results: Array<SearchResponse<THit>>;
};

export type SearchResponse<
  THit
> = DefaultSearchClient extends DummySearchClientV4
  ? SearchResponseV4<THit>
  : SearchResponseV3<THit> & { appliedRelevancyStrictness?: number };

export type SearchForFacetValuesResponse = DefaultSearchClient extends DummySearchClientV4
  ? SearchForFacetValuesResponseV4
  : SearchForFacetValuesV3.Response;
