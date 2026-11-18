import instantsearch from 'instantsearch.js';
import { searchBox, EXPERIMENTAL_autocomplete } from 'instantsearch.js/es/widgets';
import { connectHits } from 'instantsearch.js/es/connectors';
import hits from 'instantsearch.js/es/widgets/hits/hits';
import connectSearchBox from 'instantsearch.js/es/connectors/search-box/connectSearchBox';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import singleIndex from 'instantsearch.js/es/lib/stateMappings/singleIndex';
import getPropertyByPath from 'instantsearch.js/es/lib/utils/getPropertyByPath';

const { refinementList, pagination: paginationWidget } = instantsearch.widgets;
const index = 0;

const search = instantsearch({
  indexName: 'x',
  routing: { stateMapping: simple() },
});
search.addWidgets([
  instantsearch.widgets.configure({ hitsPerPage: 8 }),
  instantsearch.widgets.index({ indexName: 'y' }),
  instantsearch.connectors.connectMenu(render)({ attribute: 'brand' }),
]);
console.log(instantsearch.version);
