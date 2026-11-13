import { carousel, trendingItems } from 'instantsearch.js';

import { useWidget } from '../../hooks/useWidget';

import { renderCarouselHit } from './ProductCard';

export function WidgetTrendingItems() {
  const ref = useWidget((el) =>
    trendingItems({
      container: el,
      limit: 6,
      templates: {
        item: renderCarouselHit,
        layout: carousel(),
      },
    })
  );
  return <div ref={ref} />;
}
