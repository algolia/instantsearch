// Custom types to support both algoliasearch
// `v3` and algoliasearch `v4` clients.

import type algoliasearch from 'algoliasearch';
import type {
  // @ts-ignore
  Response as SearchResponseV3,
} from 'algoliasearch';

import type {
  // @ts-ignore
  SearchResponse as SearchResponseV4,
} from '@algolia/client-search';

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
