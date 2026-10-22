import { carousel } from 'instantsearch.js/es/templates';
import { frequentlyBoughtTogether } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

import { renderCarouselHit } from './ProductCard';

interface Props {
  objectIDs: string[];
}

export function WidgetFrequentlyBoughtTogether({ objectIDs }: Props) {
  const ref = useWidget((el) =>
    frequentlyBoughtTogether({
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
