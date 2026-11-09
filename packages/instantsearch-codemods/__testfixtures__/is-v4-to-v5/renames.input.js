import instantsearch from 'instantsearch.js';
import { EXPERIMENTAL_autocomplete } from 'instantsearch.js/es/widgets';

const search = instantsearch({ indexName: 'x' });
search.addWidget(EXPERIMENTAL_autocomplete({ container: '#a' }));
search.EXPERIMENTAL_use(middleware);
search.removeWidget(widget);

index({ indexName: 'y', EXPERIMENTAL_isolated: true });

const widget = {
  getWidgetState(uiState) {
    return uiState;
  },
};

helper.addRefine('brand', 'Apple').toggleRefine('brand', 'Samsung');

function render({ hasMapMoveSinceLastRefine, hasRefinements }) {
  return !hasMapMoveSinceLastRefine() && hasRefinements;
}

function renderSort(renderOptions) {
  if (renderOptions.hasNoResults) return 'none';
  return !renderOptions.hasNoResults ? 'a' : 'b';
}

const { hits, results } = useHits();
const { hits: infiniteHits } = useInfiniteHits();
const j = { getLocation() { return window.location; } };
