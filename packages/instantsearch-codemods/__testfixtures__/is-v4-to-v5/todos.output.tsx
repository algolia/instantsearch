// TODO(instantsearch v5): `places`, `analytics` no longer exist in v5, see the migration guide.
import { places, analytics } from 'instantsearch.js/es/widgets';
import type { Hit } from 'instantsearch.js';
import type { ToggleRefinementConnector } from 'instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement';
import { useRange, useSearchBox } from 'react-instantsearch';

const items: Hit[] = [];

new InstantSearch({ // TODO(instantsearch v5): `searchFunction` is removed, use `onStateChange` (it receives `{ uiState, setUiState }` instead of the helper).
searchFunction(helper) { helper.search(); } });
connectHits(render, { // TODO(instantsearch v5): `escapeHTML` is removed: highlighted values are not escaped by the connectors anymore, and the `highlight`/`snippet` helpers escape their own output.
escapeHTML: false });

function App() {
  const { // TODO(instantsearch v5): `start` is replaced by `currentRefinement`, an object `{ min, max }` (unset values are `undefined` instead of `-Infinity`/`Infinity`), and `refine` takes `{ min, max }`.
  start, range } = useRange({ attribute: 'price' });
  // TODO(instantsearch v5): `isSearchStalled` is removed, use `status === 'stalled'` (`useInstantSearch().status` in React).
  const { isSearchStalled } = useSearchBox();
  // TODO(instantsearch v5): the default history router no longer cleans the URL on dispose. Pass `router: history({ cleanUrlOnDispose: true })` to keep the v4 behavior.
  return <InstantSearch routing searchClient={client} />;
}
