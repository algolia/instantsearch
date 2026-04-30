import { compositionClient } from '@algolia/composition';
import instantsearch from 'instantsearch.js';
import { configure } from 'instantsearch.js/es/widgets';

import getRouting from './routing';
import {
  feedsWidget,
  pagination,
  searchBox,
} from './widgets';

const searchClient = compositionClient(
  '9HILZG6EJK',
  '65b3e0bb064c4172c4810fb2459bebd1'
);

const multifeedCompositionID = 'comp1774447423386___products';

const search = instantsearch({
  // @ts-expect-error compositionClient return type doesn't fully match SearchClient yet
  searchClient,
  compositionID: multifeedCompositionID,
  routing: getRouting({ indexName: multifeedCompositionID }),
  insights: true,
});

search.addWidgets([
  configure({ hitsPerPage: 20 }),
  feedsWidget,
  pagination,
  searchBox,
]);

export default search;
