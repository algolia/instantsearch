import algoliasearch from 'algoliasearch';
import type { AlgoliaSearchHelper } from '..';
import algoliasearchHelper, { SearchParameters, SearchResults } from '..';

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
