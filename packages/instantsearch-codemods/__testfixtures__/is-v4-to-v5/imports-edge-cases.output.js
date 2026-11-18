import { instantsearch, carousel, historyRouter as makeRouter } from 'instantsearch.js';
import * as routers from 'instantsearch.js';
// TODO(instantsearch v5): `instantsearch.js` only exposes its root now, import this by name from `instantsearch.js` if it's still exported (internal modules are not).
import { noop } from 'instantsearch.js/es/lib/utils';

const version = 'app';
// TODO(instantsearch v5): `instantsearch.version` is removed, import `version` by name from `instantsearch.js` (the name is already taken in this file).
console.log(instantsearch.version);

for (const { id } of items) {
  console.log(id);
}

function renderHits() {
  // TODO(instantsearch v5): `instantsearch.widgets` is removed, import its exports by name from `instantsearch.js`.
  const { hits: widget } = instantsearch.widgets;
  return widget();
}

const search = instantsearch({
  indexName: 'x',
  routing: { router: routers.historyRouter({
    // TODO(instantsearch v5): the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.
    cleanUrlOnDispose: true
  }) },
});
const router = makeRouter({
  // TODO(instantsearch v5): the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.
  cleanUrlOnDispose: true
});
const layout = carousel();
