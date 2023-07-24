// Custom types to support both algoliasearch
// `v3` and algoliasearch `v4` clients.

import type * as ClientSearch from '@algolia/client-search';
import type algoliasearch from 'algoliasearch/lite';
import type * as AlgoliaSearch from 'algoliasearch/lite';
/** @ts-ignore */

/** @ts-ignore */
type SearchResponseV3<TObject> = AlgoliaSearch.Response<TObject>;
/** @ts-ignore */
type SearchResponseV4<TObject> = ClientSearch.SearchResponse<TObject>;

type DummySearchClientV4 = {
  readonly addAlgoliaAgent: (segment: string, version?: string) => void;
};

type SearchResponse<THit> = ReturnType<
  typeof algoliasearch
> extends DummySearchClientV4
  ? SearchResponseV4<THit>
  : SearchResponseV3<THit>;

export interface MultiResponse<THit = any> {
  results: Array<SearchResponse<THit>>;
}
