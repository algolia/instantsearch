import algoliasearch from 'algoliasearch';
import algoliasearchHelper, {
  AlgoliaSearchHelper,
  SearchParameters,
  SearchResults,
} from '..';

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
