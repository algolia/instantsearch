import instantsearch from 'instantsearch.js';
import { autocomplete } from 'instantsearch.js/es/widgets';

const search = instantsearch({ indexName: 'x' });
search.addWidgets([autocomplete({ container: '#a' })]);
search.use(middleware);
search.removeWidgets([widget]);

index({ indexName: 'y', isolated: true });

const widget = {
  getWidgetUiState(uiState) {
    return uiState;
  },
};

helper.addFacetRefinement('brand', 'Apple').toggleFacetRefinement('brand', 'Samsung');

function render({ hasMapMovedSinceLastRefine, canRefine }) {
  return !hasMapMovedSinceLastRefine() && canRefine;
}

function renderSort(renderOptions) {
  if (!renderOptions.canRefine) return 'none';
  return renderOptions.canRefine ? 'a' : 'b';
}

const { items: hits, results } = useHits();
const { items: infiniteHits } = useInfiniteHits();
const j = { // TODO(instantsearch v5): `getCurrentURL` must return a `URL` instead of a `Location` (e.g. `new URL(href)`).
getCurrentURL() { return window.location; } };
