import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { connectFrequentlyBoughtTogether } from 'instantsearch.js/es/connectors';
import {
  configure,
  // hits,
  pagination,
  panel,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

const mySuperWidget = connectFrequentlyBoughtTogether(
  ({ hits, widgetParams }) => {
    // eslint-disable-next-line no-console
    console.log('FrequentlyBoughtTogether', { hits, widgetParams });
  }
);

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  mySuperWidget({ container: '#hits', objectIDs: ['5723538', '4790739'] }),
  //  5386012, 5327500
  configure({
    hitsPerPage: 8,
  }),
  panel({
    templates: { header: 'brand' },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();
