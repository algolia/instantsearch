/* eslint-disable import/no-duplicates */
// Custom types to support both algoliasearch
// `v3` and algoliasearch `v4` clients.

import algoliasearch from 'algoliasearch/lite';
import * as AlgoliaSearch from 'algoliasearch/lite';
/** @ts-ignore */
import * as ClientSearch from '@algolia/client-search';

/** @ts-ignore */
type SearchResponseV3<TObject> = AlgoliaSearch.Response<TObject>;
/** @ts-ignore */
type SearchResponseV4<TObject> = ClientSearch.SearchResponse<TObject>;

/** @ts-ignore */
type SearchForFacetValuesResponseV3 =
  AlgoliaSearch.SearchForFacetValues.Response;
/** @ts-ignore */
type SearchForFacetValuesResponseV4 = ClientSearch.SearchForFacetValuesResponse;

type RelevantSortResponse = {
  appliedRelevancyStrictness?: number;
  nbSortedHits?: number;
};

type DummySearchClientV4 = {
  readonly transporter: any;
};

type DefaultSearchClient = ReturnType<typeof algoliasearch>;

type SearchIndex = ReturnType<DefaultSearchClient['initIndex']>;

export type SearchClient = {
  search: DefaultSearchClient['search'];
  searchForFacetValues: DefaultSearchClient['searchForFacetValues'];
  addAlgoliaAgent?: DefaultSearchClient['addAlgoliaAgent'];
  initIndex?: (
    indexName: string
  ) => SearchIndex extends { findAnswers: any }
    ? Partial<Pick<SearchIndex, 'findAnswers'>>
    : SearchIndex;
};

export type MultiResponse<THit = any> = {
  results: Array<SearchResponse<THit>>;
};

export type SearchResponse<THit> =
  DefaultSearchClient extends DummySearchClientV4
    ? SearchResponseV4<THit>
    : SearchResponseV3<THit> & RelevantSortResponse;

export type SearchForFacetValuesResponse =
  DefaultSearchClient extends DummySearchClientV4
    ? SearchForFacetValuesResponseV4
    : SearchForFacetValuesResponseV3;

export type FindAnswersParameters = SearchIndex extends {
  findAnswers: (...params: infer Params) => any;
}
  ? Params
  : any;

export type FindAnswersOptions = DefaultSearchClient extends DummySearchClientV4
  ? ClientSearch.FindAnswersOptions
  : any;

export type FindAnswersResponse<TObject> =
  DefaultSearchClient extends DummySearchClientV4
    ? ClientSearch.FindAnswersResponse<TObject>
    : any;
