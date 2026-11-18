import * as widgets from 'instantsearch.js';
import * as routers from 'instantsearch.js';
import { instantsearch as search, configure } from 'instantsearch.js';

const { historyRouter: history } = routers;

const instance = search({ indexName: 'x' });
instance.addWidgets([
  configure({ hitsPerPage: 8 }),
  widgets.hits({ container: '#hits' }),
]);
// TODO(instantsearch v5): `highlight` is removed, use `components.Highlight` in templates instead (`components` is in the second argument of the template function).
search.highlight({ attribute: 'name', hit });
// TODO(instantsearch v5): `instantsearch.insights` is removed, use `createInsightsMiddleware` and `instantSearchInstance.use(...)`.
search.insights('init', {});
