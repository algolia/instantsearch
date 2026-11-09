import { history } from 'instantsearch.js/es/lib/routers';

const a = history({
  // TODO(instantsearch v5): the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.
  cleanUrlOnDispose: true
});
const b = history({
  windowTitle: () => 'x',

  // TODO(instantsearch v5): the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.
  cleanUrlOnDispose: true
});
const c = history({ cleanUrlOnDispose: false });
const d = instantsearch.routers.history({
  // TODO(instantsearch v5): `getCurrentURL` must return a `URL` instead of a `Location` (e.g. `new URL(href)`).
  getCurrentURL: () => window.location,

  // TODO(instantsearch v5): the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.
  cleanUrlOnDispose: true
});
const e = {
  router: { createURL({ qsModule, routeState, currentURL }) { return currentURL.href; } },
};
const f = {
  parseURL: ({ qsModule, currentURL }) => qsModule.parse(currentURL.search.slice(1)),
};
const g = { // TODO(instantsearch v5): the default history router no longer cleans the URL on dispose. Pass `router: history({ cleanUrlOnDispose: true })` to keep the v4 behavior.
routing: true };
const h = createInstantSearchRouterNext({
  serverUrl,

  routerOptions: {
    // TODO(instantsearch v5): the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.
    cleanUrlOnDispose: true
  }
});
const i = {
  createURL({ routeState, currentURL }) { return currentURL.href; },
};
