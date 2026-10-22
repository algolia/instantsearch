import { hits } from 'instantsearch.js/es/widgets';

import { useSearch } from '../../context/search';
import { useWidget } from '../../hooks/useWidget';

import { renderProductCard } from './ProductCard';

export function WidgetHits() {
  const ref = useWidget((el) =>
    hits({
      container: el,
      templates: {
        item: (hit, helpers) => renderProductCard(hit, helpers),
      },
    })
  );
  return <div ref={ref} />;
}

/**
 * Hits with a "Compare" toggle on each card, wired to the `compareBar` widget
 * mounted on the same instance: the selection lives in the shared render
 * state, so the toggles and the bar stay in sync.
 */
export function WidgetHitsWithCompare() {
  const search = useSearch();
  const ref = useWidget((el) =>
    hits({
      container: el,
      templates: {
        item: (hit, helpers) =>
          renderProductCard(
            hit,
            helpers,
            search.renderState[search.indexName]?.compare
          ),
      },
    })
  );
  return <div ref={ref} />;
}
