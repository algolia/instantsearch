import algoliasearch from 'algoliasearch';

import algoliasearchHelper, { SearchParameters, SearchResults } from '..';

import type { AlgoliaSearchHelper } from '..';

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
