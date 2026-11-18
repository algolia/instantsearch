import {
  instantsearch,
  configure,
  connectMenu,
  refinementList,
  pagination as paginationWidget,
  version,
  searchBox,
  autocomplete,
  connectHits,
  hits,
  connectSearchBox,
  simpleStateMapping as simple,
  singleIndexStateMapping as singleIndex,
} from 'instantsearch.js';
// TODO(instantsearch v5): `instantsearch.js` only exposes its root now, import this by name from `instantsearch.js` (internal modules are not exported anymore).
import getPropertyByPath from 'instantsearch.js/es/lib/utils/getPropertyByPath';

const index = 0;

const search = instantsearch({
  indexName: 'x',
  routing: { stateMapping: simple() },
});
// TODO(instantsearch v5): `instantsearch.widgets` is removed, import its exports by name from `instantsearch.js`.
search.addWidgets([
  configure({ hitsPerPage: 8 }),
  instantsearch.widgets.index({ indexName: 'y' }),
  connectMenu(render)({ attribute: 'brand' }),
]);
console.log(version);
