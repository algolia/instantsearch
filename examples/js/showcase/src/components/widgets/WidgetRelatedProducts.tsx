import { carousel } from 'instantsearch.js/es/templates';
import { relatedProducts } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

import { renderCarouselHit } from './ProductCard';

interface Props {
  objectIDs: string[];
}

export function WidgetRelatedProducts({ objectIDs }: Props) {
  const ref = useWidget((el) =>
    relatedProducts({
      container: el,
      objectIDs,
      limit: 6,
      templates: {
        item: renderCarouselHit,
        layout: carousel(),
      },
    })
  );
  return <div ref={ref} />;
}
