import { history } from 'instantsearch.js/es/lib/routers';

const a = history();
const b = history({ windowTitle: () => 'x' });
const c = history({ cleanUrlOnDispose: false });
const d = instantsearch.routers.history({ getLocation: () => window.location });
const e = {
  router: { createURL({ qsModule, routeState, location }) { return location.href; } },
};
const f = {
  parseURL: ({ qsModule, location }) => qsModule.parse(location.search.slice(1)),
};
const g = { routing: true };
const h = createInstantSearchRouterNext({ serverUrl });
const i = {
  createURL({ routeState, location }) { return location.href; },
};
