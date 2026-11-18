import * as widgets from 'instantsearch.js/es/widgets';
import * as routers from 'instantsearch.js/es/lib/routers';
import search from 'instantsearch.js';

const { history } = routers;

const instance = search({ indexName: 'x', routing: { router: history() } });
instance.addWidgets([
  search.widgets.configure({ hitsPerPage: 8 }),
  widgets.hits({ container: '#hits' }),
]);
search.highlight({ attribute: 'name', hit });
search.insights('init', {});
