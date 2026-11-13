// TODO(instantsearch v5): `places`, `analytics` no longer exist in v5, see the migration guide.
import { places, analytics } from 'instantsearch.js/es/widgets';
// TODO(instantsearch v5): `getInsightsAnonymousUserToken` is removed. What to do depends on what you did with the token:
// - to get the token onto your searches: delete the call, `createInsightsMiddleware` already sends it as the `userToken` search parameter;
// - to use the value in your own code (send it to your API, log it, etc.): read it from the insights client, which now owns it: `aa("getUserToken", null, (err, userToken) => { ... })`;
// - to get it on the server (SSR), where there is no insights client: read the `_ALGOLIA` cookie (insights only writes it when initialized with `useCookie: true`) and pass it as `userToken` yourself.
import { highlight, getInsightsAnonymousUserToken } from 'instantsearch.js/es/helpers';
import type { Hit } from 'instantsearch.js';
import type { ToggleRefinementConnector } from 'instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement';
import { useRange, useSearchBox } from 'react-instantsearch';

const items: Hit[] = [];

new InstantSearch({ // TODO(instantsearch v5): `searchFunction` is removed, use `onStateChange` (it receives `{ uiState, setUiState }` instead of the helper).
searchFunction(helper) { helper.search(); } });
connectHits(render, { // TODO(instantsearch v5): `escapeHTML` is removed: highlighted values are not escaped by the connectors anymore, and the `highlight`/`snippet` helpers escape their own output.
escapeHTML: false });
// TODO(instantsearch v5): `__hitIndex` is removed from the `hits` and `infiniteHits` item templates, use `__position` (the position across pages, starting at 1) instead.
hits({ container, templates: { item: (hit) => `${hit.__hitIndex}` } });

function App() {
  const { // TODO(instantsearch v5): `start` is replaced by `currentRefinement`, an object `{ min, max }` (unset values are `undefined` instead of `-Infinity`/`Infinity`), and `refine` takes `{ min, max }`.
  start, range } = useRange({ attribute: 'price' });
  // TODO(instantsearch v5): `isSearchStalled` is removed, use `status === 'stalled'` (`useInstantSearch().status` in React).
  const { isSearchStalled } = useSearchBox();
  // TODO(instantsearch v5): the default history router no longer cleans the URL on dispose. Pass `router: history({ cleanUrlOnDispose: true })` to keep the v4 behavior.
  return <InstantSearch routing searchClient={client} />;
}
