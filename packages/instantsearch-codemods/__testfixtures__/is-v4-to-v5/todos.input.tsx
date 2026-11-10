import { places, analytics } from 'instantsearch.js/es/widgets';
import type { Hits } from 'instantsearch.js';
import type { ToggleRefinementConnector } from 'instantsearch.js/es/connectors/toggle-refinement/types';
import { useRange, useSearchBox } from 'react-instantsearch';

const items: Hits = [];

new InstantSearch({ searchFunction(helper) { helper.search(); } });
connectHits(render, { escapeHTML: false });

function App() {
  const { start, range } = useRange({ attribute: 'price' });
  const { isSearchStalled } = useSearchBox();
  return <InstantSearch routing searchClient={client} />;
}
