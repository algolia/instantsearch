import instantsearch from 'instantsearch.js';
import * as routers from 'instantsearch.js/es/lib/routers';
import makeRouter from 'instantsearch.js/es/lib/routers/history';
import { noop } from 'instantsearch.js/es/lib/utils';
import * as routing from 'instantsearch.js/es/lib/routers/index.js';
import hitsTemplates from 'instantsearch.js/es/widgets/hits/defaultTemplates';

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
const otherRouter = routing.history();
const layout = instantsearch.templates.carousel();
