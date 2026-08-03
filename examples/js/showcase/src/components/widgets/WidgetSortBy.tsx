import { sortBy } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

export function WidgetSortBy() {
  const ref = useWidget((el) =>
    sortBy({
      container: el,
      items: [
        { value: 'instant_search', label: 'Relevance' },
        { value: 'instant_search_price_asc', label: 'Price asc.' },
        { value: 'instant_search_price_desc', label: 'Price desc.' },
        {
          value: 'instant_search_price_asc_relevant_sort',
          label: 'Price asc. (virtual replica)',
        },
      ],
    })
  );
  return <div ref={ref} />;
}
