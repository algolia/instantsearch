import instantsearch from 'instantsearch.js';
import * as routers from 'instantsearch.js/es/lib/routers';
import makeRouter from 'instantsearch.js/es/lib/routers/history';
import { noop } from 'instantsearch.js/es/lib/utils';

const version = 'app';
console.log(instantsearch.version);

for (const { id } of items) {
  console.log(id);
}

function renderHits() {
  const { hits: widget } = instantsearch.widgets;
  return widget();
}

const search = instantsearch({
  indexName: 'x',
  routing: { router: routers.history() },
});
const router = makeRouter();
const layout = instantsearch.templates.carousel();
