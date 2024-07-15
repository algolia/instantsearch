import algoliasearchHelper, { SearchParameters, SearchResults } from '..';

import type { AlgoliaSearchHelper } from '..';
import type { SearchClient } from '../types/algoliasearch';

const client: SearchClient = {} as any;

const helper: AlgoliaSearchHelper = algoliasearchHelper(client, '');

helper.derive(
  () =>
    new SearchParameters({
      query: 'something fun',
    })
);

new SearchResults(new SearchParameters(), []);
