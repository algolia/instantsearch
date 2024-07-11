import {
  algoliasearch as namedConstructor,
  default as defaultConstructor,
} from 'algoliasearch';

import algoliasearchHelper, { SearchParameters, SearchResults } from '..';

import type { AlgoliaSearchHelper } from '..';
import type { SearchClient } from '../types/algoliasearch';

const algoliasearch = (namedConstructor || defaultConstructor) as unknown as (
  appId: string,
  apiKey: string
) => SearchClient;

const helper: AlgoliaSearchHelper = algoliasearchHelper(
  algoliasearch('', ''),
  ''
);

helper.derive(
  () =>
    new SearchParameters({
      query: 'something fun',
    })
);

new SearchResults(new SearchParameters(), []);
